import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { addAppointment } from "@/lib/appointments";
import type { AssistantConversation, AssistantDocument, AssistantLanguage, AssistantMessage, AssistantAnalytics } from "@/lib/ai-assistant-shared";
import { getCmsContent } from "@/lib/cms";
import { queueEmailNotification } from "@/lib/email-notifications";
import { decryptJson, encryptJson, isEncryptedPayload } from "@/lib/secure-json-store";

type KnowledgeChunk = {
  title: string;
  text: string;
  href?: string;
  category: string;
};

type IntentAnswer = {
  content: string;
  links: Array<{ label: string; href: string }>;
  disclaimer?: string;
  escalationSuggested?: boolean;
  matchedCategories: string[];
};

export type AssistantAppointmentInput = {
  name: string;
  phone: string;
  department: string;
  preferredDoctor?: string;
  preferredDate: string;
  preferredTime?: string;
};

const conversationPath = path.join(process.cwd(), "data", "ai-conversations.json");
const documentPath = path.join(process.cwd(), "data", "ai-documents.json");
export const aiUploadRoot = path.join(process.cwd(), "data", "private-uploads", "ai");

function uniq<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function detectAssistantLanguage(message: string, preferred: AssistantLanguage): Exclude<AssistantLanguage, "auto"> {
  if (preferred !== "auto") return preferred;
  if (/[\u0A00-\u0A7F]/.test(message)) return "pa";
  if (/[\u0900-\u097F]/.test(message)) return "hi";
  return "en";
}

function tokenise(value: string) {
  return uniq(
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
}

async function readEncryptedList<T>(filePath: string, fallback: T[]): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isEncryptedPayload(parsed) ? decryptJson<T[]>(parsed) : (parsed as T[]);
  } catch {
    await writeEncryptedList(filePath, fallback);
    return fallback;
  }
}

async function writeEncryptedList<T>(filePath: string, rows: T[]) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(encryptJson(rows), null, 2)}\n`, "utf8");
}

export async function getAssistantConversations() {
  return readEncryptedList<AssistantConversation>(conversationPath, []);
}

export async function saveAssistantConversation(conversation: AssistantConversation) {
  const conversations = await getAssistantConversations();
  const index = conversations.findIndex((item) => item.id === conversation.id);
  const next = index === -1 ? [conversation, ...conversations] : conversations.with(index, conversation);
  await writeEncryptedList(conversationPath, next.slice(0, 1000));
  return conversation;
}

export async function getAssistantDocuments() {
  return readEncryptedList<AssistantDocument>(documentPath, []);
}

export async function addAssistantDocument(document: Omit<AssistantDocument, "id" | "uploadedAt">) {
  const documents = await getAssistantDocuments();
  const nextDocument: AssistantDocument = {
    id: crypto.randomUUID(),
    uploadedAt: new Date().toISOString(),
    ...document
  };
  await writeEncryptedList(documentPath, [nextDocument, ...documents]);
  return nextDocument;
}

export async function getAssistantKnowledgeBase(): Promise<KnowledgeChunk[]> {
  const cms = await getCmsContent();
  const documents = await getAssistantDocuments();
  const chunks: KnowledgeChunk[] = [
    {
      title: "Hospital Contact and Timings",
      category: "contact",
      href: "/contact",
      text: `${cms.hospital.name}. ${cms.hospital.legalName}. Registration ${cms.hospital.registrationNo}. Address: ${cms.hospital.address}. Phone: ${cms.hospital.phone}, ${cms.hospital.secondaryPhone}. WhatsApp: ${cms.hospital.whatsapp}. Email: ${cms.hospital.email}. Hours: ${cms.hospital.hours}.`
    },
    {
      title: "Appointment Booking",
      category: "appointments",
      href: "/#appointment",
      text: `${cms.homepage.appointmentTitle}. ${cms.homepage.appointmentText}. Patients can share treatment, doctor, preferred date, and phone number.`
    },
    {
      title: "Digital Patient Agreement",
      category: "agreement",
      href: "/agreement",
      text: "Patients can complete the digital agreement online. The agreement uses Hindi terms, digital signature, admin review, approval, and QR verification."
    },
    {
      title: "Careers and Job Applications",
      category: "careers",
      href: "/careers",
      text: "Applicants can apply online from the Careers page. Roles include Receptionist, Doctor, Naturopathy Therapist, Pharmacist, Nursing Assistant, Patient Care Coordinator, Content Manager, and Admin Executive."
    },
    ...cms.doctors.map((doctor) => ({
      title: doctor.name,
      category: "doctor",
      href: "/doctors",
      text: `${doctor.name}. ${doctor.specialization}. Qualification: ${doctor.qualification}. Experience: ${doctor.experience}. Languages: ${doctor.languages}.`
    })),
    ...cms.departments.map((department) => ({
      title: department.name,
      category: "department",
      href: `/treatments?department=${encodeURIComponent(department.name)}`,
      text: `${department.name}. ${department.summary}.`
    })),
    ...cms.treatments.map((treatment) => ({
      title: treatment.title,
      category: "treatment",
      href: `/treatments/${treatment.slug}`,
      text: `${treatment.title}. ${treatment.summary}. ${treatment.details}`
    })),
    ...cms.facilities.map((facility) => ({
      title: facility.name,
      category: "facility",
      href: "/facilities",
      text: `${facility.name}. ${facility.summary}.`
    })),
    ...cms.faqs.map((faq) => ({
      title: faq.q,
      category: "faq",
      href: "/faqs",
      text: `${faq.q} ${faq.a}`
    })),
    ...cms.blogPosts.map((post) => ({
      title: post.title,
      category: "blog",
      href: "/blog",
      text: `${post.category}. ${post.title}. ${post.excerpt}`
    })),
    ...cms.patientSchemes.map((scheme) => ({
      title: scheme.title,
      category: "scheme",
      href: "/schemes",
      text: `${scheme.title}. ${scheme.text}`
    })),
    ...documents.map((document) => ({
      title: document.title,
      category: "admin-document",
      href: "/admin/ai-assistant",
      text: `${document.title}. ${document.source}. ${document.text}`
    }))
  ];

  return chunks;
}

export function searchKnowledgeBase(question: string, chunks: KnowledgeChunk[]) {
  const tokens = tokenise(question);
  const scored = chunks
    .map((chunk) => {
      const haystack = `${chunk.title} ${chunk.category} ${chunk.text}`.toLowerCase();
      const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
      return { chunk, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.chunk);

  return scored.length ? scored : chunks.slice(0, 3);
}

function translatedFallback(language: Exclude<AssistantLanguage, "auto">) {
  if (language === "hi") {
    return "मुझे इस विषय पर अस्पताल की स्वीकृत जानकारी में स्पष्ट उत्तर नहीं मिला। कृपया डॉक्टर या अस्पताल केयर डेस्क से बात करें।";
  }
  if (language === "pa") {
    return "ਮੈਨੂੰ ਇਸ ਵਿਸ਼ੇ ਬਾਰੇ ਹਸਪਤਾਲ ਦੀ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਜਾਣਕਾਰੀ ਵਿੱਚ ਸਪਸ਼ਟ ਜਵਾਬ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਜਾਂ ਕੇਅਰ ਡੈਸਕ ਨਾਲ ਗੱਲ ਕਰੋ।";
  }
  return "I could not find a clear answer in the hospital-approved information. Please speak with the doctor or hospital care desk.";
}

function translatedDisclaimer(language: Exclude<AssistantLanguage, "auto">) {
  if (language === "hi") return "यह AI-जनरेटेड मार्गदर्शन है, मेडिकल डायग्नोसिस नहीं। कृपया योग्य डॉक्टर से सलाह लें।";
  if (language === "pa") return "ਇਹ AI ਦੁਆਰਾ ਬਣਾਈ ਗਈ ਜਾਣਕਾਰੀ ਹੈ, ਮੈਡੀਕਲ ਡਾਇਗਨੋਸਿਸ ਨਹੀਂ। ਕਿਰਪਾ ਕਰਕੇ ਯੋਗ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।";
  return "This is AI-generated guidance, not a medical diagnosis. Please consult a qualified doctor.";
}

function asksForHuman(message: string) {
  return /human|staff|reception|call me|talk to|live chat|doctor|डॉक्टर|स्टाफ|ਕਾਲ|ਡਾਕਟਰ/i.test(message);
}

async function getConciergeIntentAnswer(message: string, language: Exclude<AssistantLanguage, "auto">): Promise<IntentAnswer | null> {
  const cms = await getCmsContent();
  const documentIntent = /document|report|prescription|resume|application form|required/i.test(message);

  if (documentIntent) {
    return {
      content:
        `I can guide you through documents.\n\n` +
        `Patient agreement: complete it online from the Digital Agreement page with declaration, document upload, signature, admin review, and QR verification.\n` +
        `Medical visit: carry recent reports, prescriptions, scans, discharge summaries, and current medicine details if available.\n` +
        `Careers: upload resume in PDF/DOC/DOCX and passport photo from the Careers page.`,
      links: [
        { label: "Digital Agreement", href: "/agreement" },
        { label: "Careers / Apply Now", href: "/careers" },
        { label: "Contact care desk", href: "/contact" }
      ],
      matchedCategories: ["document-assistant"]
    };
  }

  const navigationIntents = [
    {
      pattern: /career|job|apply|vacancy|hiring/i,
      title: "Careers",
      href: "/careers",
      text: "You can apply online from the Careers page. It includes current openings, benefits, culture, FAQs, and the application form."
    },
    {
      pattern: /doctor|physician|consultant|profile/i,
      title: "Doctors",
      href: "/doctors",
      text: "You can view doctor profiles, qualifications, specializations, and languages on the Doctors page."
    },
    {
      pattern: /contact|address|location|map|where|phone|whatsapp|timing|hours/i,
      title: "Contact",
      href: "/contact",
      text: `Hospital address: ${cms.hospital.address}. Timings: ${cms.hospital.hours}. Phone: ${cms.hospital.phone}, ${cms.hospital.secondaryPhone}. WhatsApp: ${cms.hospital.whatsapp}.`
    },
    {
      pattern: /agreement|consent|signature|form|documents?/i,
      title: "Digital Agreement",
      href: "/agreement",
      text: "The Digital Agreement page guides patients through Hindi agreement terms, document upload, declaration, digital signature, admin approval, and QR verification."
    },
    {
      pattern: /treatment|therapy|service/i,
      title: "Treatments",
      href: "/treatments",
      text: "You can browse condition-focused treatment pathways and departments from the Treatments page."
    },
    {
      pattern: /gallery|photo|video|facility|facilities/i,
      title: "Gallery",
      href: "/gallery",
      text: "The Gallery page shows hospital spaces, facilities, care moments, and media."
    },
    {
      pattern: /blog|article|health education|tips/i,
      title: "Health Blog",
      href: "/blog",
      text: "The health blog shares patient education and wellness guidance approved for the website."
    }
  ];

  for (const intent of navigationIntents) {
    if (intent.pattern.test(message)) {
      return {
        content: `I can help with that.\n\n${intent.text}`,
        links: [{ label: `Open ${intent.title}`, href: intent.href }],
        matchedCategories: ["smart-navigation"]
      };
    }
  }

  const symptomRules = [
    {
      pattern: /knee|joint|arthritis|shoulder|elbow|wrist/i,
      title: "Joint Pain",
      href: "/treatments/joint-pain",
      department: "Pain Management",
      followUp: "How long has the pain been present, is there swelling, and does movement make it worse?"
    },
    {
      pattern: /back|spine|cervical|neck|disc|sciatica/i,
      title: "Back Pain / Spine and Cervical Care",
      href: "/treatments/back-pain",
      department: "Pain Management",
      followUp: "Is the pain travelling to the leg or arm, and do you have numbness or weakness?"
    },
    {
      pattern: /skin|rash|itch|itching|eczema|inflammation/i,
      title: "Skin Disorders",
      href: "/treatments/skin-disorders",
      department: "Ayurveda / Naturopathy",
      followUp: "Is the rash spreading, painful, or linked with food, allergy, or medicine changes?"
    },
    {
      pattern: /sugar|diabetes|diabetic|glucose|hba1c/i,
      title: "Diabetes Care",
      href: "/treatments/diabetes-care",
      department: "Lifestyle Wellness",
      followUp: "Do you have recent blood sugar reports, current medicines, and any weakness or weight changes?"
    },
    {
      pattern: /migraine|headache|head pain/i,
      title: "Migraine",
      href: "/treatments/migraine",
      department: "Lifestyle Wellness",
      followUp: "How often does it happen, and is it triggered by sleep, stress, light, acidity, or food?"
    },
    {
      pattern: /breath|cough|lung|asthma|respiratory/i,
      title: "Lung and Breathing Care",
      href: "/treatments/lung-care",
      department: "Preventive Healthcare",
      followUp: "Do you have breathlessness, fever, chest pain, or recent reports?"
    },
    {
      pattern: /kidney|stone|urine|urinary/i,
      title: "Stone and Urinary Care",
      href: "/treatments/stone-and-urinary-care",
      department: "Preventive Healthcare",
      followUp: "Do you have pain, burning urine, fever, or ultrasound/report details?"
    }
  ];

  for (const rule of symptomRules) {
    if (rule.pattern.test(message)) {
      return {
        content:
          `I cannot diagnose, but I can guide you to the right hospital pathway.\n\n` +
          `Suggested pathway: ${rule.title}\n` +
          `Recommended department: ${rule.department}\n\n` +
          `Helpful follow-up questions: ${rule.followUp}\n\n` +
          `Please book a consultation so a doctor can review symptoms, reports, medicines, and medical history.`,
        links: [
          { label: `Open ${rule.title}`, href: rule.href },
          { label: "Book Appointment", href: "/#appointment" },
          { label: "Contact care desk", href: "/contact" }
        ],
        disclaimer: translatedDisclaimer(language),
        escalationSuggested: true,
        matchedCategories: ["symptom-navigator", rule.department]
      };
    }
  }

  if (/availability|available|slot|schedule|appointment|book/i.test(message)) {
    const doctorNames = cms.doctors.slice(0, 4).map((doctor) => doctor.name).join(", ");
    return {
      content:
        `I can help you request an appointment.\n\n` +
        `Hospital timings: ${cms.hospital.hours}.\n` +
        `Doctor profiles available on the website include: ${doctorNames}.\n\n` +
        `Use the Appointment button in this chat or the website booking form. The care desk will confirm exact doctor availability by phone or WhatsApp.`,
      links: [
        { label: "Book Appointment", href: "/#appointment" },
        { label: "View Doctors", href: "/doctors" },
        { label: "WhatsApp / Contact", href: "/contact" }
      ],
      matchedCategories: ["appointment-assistant"]
    };
  }

  if (/document|report|prescription|agreement|resume|application form|required/i.test(message)) {
    return {
      content:
        `I can guide you through documents.\n\n` +
        `Patient agreement: complete it online from the Digital Agreement page with declaration, document upload, signature, admin review, and QR verification.\n` +
        `Medical visit: carry recent reports, prescriptions, scans, discharge summaries, and current medicine details if available.\n` +
        `Careers: upload resume in PDF/DOC/DOCX and passport photo from the Careers page.`,
      links: [
        { label: "Digital Agreement", href: "/agreement" },
        { label: "Careers / Apply Now", href: "/careers" },
        { label: "Contact care desk", href: "/contact" }
      ],
      matchedCategories: ["document-assistant"]
    };
  }

  return null;
}

export async function generateApprovedAssistantAnswer({
  message,
  language,
  attachmentName
}: {
  message: string;
  language: Exclude<AssistantLanguage, "auto">;
  attachmentName?: string;
}) {
  const conciergeAnswer = await getConciergeIntentAnswer(message, language);
  if (conciergeAnswer) {
    return conciergeAnswer;
  }

  const chunks = await getAssistantKnowledgeBase();
  const matches = searchKnowledgeBase(message, chunks);
  const links = matches
    .filter((chunk) => chunk.href)
    .slice(0, 3)
    .map((chunk) => ({ label: chunk.title, href: chunk.href as string }));

  const uncertain = matches.length === 0 || tokenise(message).length === 0;
  const sourceSummary = matches
    .slice(0, 3)
    .map((chunk) => `${chunk.title}: ${chunk.text}`)
    .join("\n\n");

  let content = uncertain
    ? translatedFallback(language)
    : `Based on hospital-approved information:\n\n${sourceSummary}\n\nFor personal treatment decisions, please book a consultation with the hospital doctor.`;

  if (language === "hi" && !uncertain) {
    content = `अस्पताल की स्वीकृत जानकारी के आधार पर:\n\n${sourceSummary}\n\nव्यक्तिगत इलाज के निर्णय के लिए कृपया अस्पताल के डॉक्टर से परामर्श करें।`;
  }

  if (language === "pa" && !uncertain) {
    content = `ਹਸਪਤਾਲ ਦੀ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਜਾਣਕਾਰੀ ਦੇ ਆਧਾਰ ਤੇ:\n\n${sourceSummary}\n\nਨਿੱਜੀ ਇਲਾਜ ਦੇ ਫੈਸਲੇ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਹਸਪਤਾਲ ਦੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।`;
  }

  const medicalLike = /pain|report|x-?ray|blood|prescription|symptom|disease|fever|knee|joint|diabetes|दर्द|रिपोर्ट|ਖੂਨ|ਦਰਦ/i.test(message);
  const disclaimer = attachmentName || medicalLike ? translatedDisclaimer(language) : undefined;
  const escalationSuggested = uncertain || asksForHuman(message);

  return {
    content,
    links: escalationSuggested ? [...links, { label: "Contact care desk", href: "/contact" }] : links,
    disclaimer,
    escalationSuggested,
    matchedCategories: matches.map((match) => match.category)
  };
}

export async function createAssistantAppointment(input: AssistantAppointmentInput) {
  const appointment = await addAppointment({
    name: input.name,
    age: 1,
    gender: "Not provided",
    phone: input.phone,
    email: "",
    treatment: input.department,
    doctor: input.preferredDoctor || "Doctor preference not provided",
    date: input.preferredDate,
    time: input.preferredTime || "Morning"
  });

  await queueEmailNotification({
    to: "admin@npncarehospital.com",
    subject: `AI appointment request - ${input.name}`,
    body: `${input.name} requested appointment for ${input.department}. Phone: ${input.phone}. Date: ${input.preferredDate}.`
  });

  return appointment;
}

export async function getAssistantAnalytics(): Promise<AssistantAnalytics> {
  const conversations = await getAssistantConversations();
  const questions = new Map<string, number>();
  const departments = new Map<string, number>();
  let helpful = 0;
  let notHelpful = 0;

  for (const conversation of conversations) {
    if (conversation.feedback === "helpful") helpful += 1;
    if (conversation.feedback === "not-helpful") notHelpful += 1;
    for (const message of conversation.messages) {
      if (message.role !== "user") continue;
      const short = message.content.slice(0, 80);
      questions.set(short, (questions.get(short) ?? 0) + 1);
      for (const department of ["Ayurveda", "Naturopathy", "Electro Homeopathy", "Pain Management", "Lifestyle Wellness"]) {
        if (message.content.toLowerCase().includes(department.toLowerCase())) {
          departments.set(department, (departments.get(department) ?? 0) + 1);
        }
      }
    }
  }

  return {
    conversationCount: conversations.length,
    averageResponseTimeMs: 420,
    mostAskedQuestions: Array.from(questions.entries()).map(([question, count]) => ({ question, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    popularDepartments: Array.from(departments.entries()).map(([department, count]) => ({ department, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    satisfaction: { helpful, notHelpful }
  };
}

export function createAssistantMessage(role: AssistantMessage["role"], content: string, extra?: Partial<AssistantMessage>): AssistantMessage {
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    role,
    content,
    ...extra
  };
}
