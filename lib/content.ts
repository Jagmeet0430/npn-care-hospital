import {
  Activity,
  Baby,
  Bone,
  Brain,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Droplets,
  FileHeart,
  HeartPulse,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  Waves
} from "lucide-react";

export const hospital = {
  name: "N.P.N. CARE HOSPITAL",
  hindiName: "एन. पी. एन. केयर हॉस्पिटल",
  legalName: "Navel Power Naturopathy India Pvt. Ltd.",
  registrationNo: "U86903UP2023PTC178984",
  tagline: "Integrated Healthcare for Better Living",
  phone: "+91 91197 44783",
  secondaryPhone: "+91 90685 34783",
  emergency: "+91 91197 44783",
  whatsapp: "+91 90685 34783",
  email: "npncarehospital786@gmail.com",
  instagram: "https://www.instagram.com/n.p.n_care_hospital/",
  facebook: "https://www.facebook.com/search/top?q=N.P.N.%20Care%20Hospital",
  youtube: "https://www.youtube.com/results?search_query=N.P.N.+Care+Hospital",
  address: "Pathak Ji Complex, Main Chauraha to Mant Road, Gorei, Iglas, Aligarh, Uttar Pradesh 202145",
  hours: "Mon-Sat, 10:00 AM - 4:00 PM | Sunday closed",
  mapQuery: "N.P.N. Care Hospital, Pathak Ji Complex, Main Chauraha to Mant Road, Gorei, Iglas, Aligarh, Uttar Pradesh 202145"
};

export const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Treatments", href: "/treatments" },
  { label: "Agreement", href: "/agreement" },
  { label: "Careers", href: "/careers" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
];

export const trustStats = [
  { label: "Years of Experience", value: "15+" },
  { label: "Patients Served", value: "48K+" },
  { label: "Expert Doctors", value: "04" },
  { label: "Modern Facilities", value: "08" },
  { label: "Support", value: "24/7" }
];

export const values = [
  {
    title: "Experienced Doctors",
    text: "Consultations are guided by experienced practitioners who explain each step clearly before care begins.",
    icon: Stethoscope
  },
  {
    title: "Personalized Care",
    text: "Plans are shaped around reports, age, symptoms, lifestyle, family needs, and treatment history.",
    icon: HeartPulse
  },
  {
    title: "Natural Healing",
    text: "Ayurveda, naturopathy, electro homeopathy, nutrition, and lifestyle care work together thoughtfully.",
    icon: Leaf
  },
  {
    title: "Affordable Treatment",
    text: "Families can discuss available schemes, insurance support, and suitable care options at the help desk.",
    icon: Users
  },
  {
    title: "Modern Facilities",
    text: "A clean, calm, and organized care environment helps patients feel safe from arrival to follow-up.",
    icon: Building2
  },
  {
    title: "Patient-Centered Approach",
    text: "Every service is designed for simple communication, dignity, transparency, and family confidence.",
    icon: ShieldCheck
  },
  {
    title: "Long-Term Wellness",
    text: "Follow-ups, prevention, daily routines, and recovery support help patients build sustainable health.",
    icon: Leaf
  }
];

export const departments = [
  { name: "Ayurveda", icon: Leaf, summary: "Personalized protocols rooted in classical wisdom and patient assessment." },
  { name: "Naturopathy", icon: Waves, summary: "Drugless therapies, detox support, nutrition, and lifestyle correction." },
  { name: "Electro Homeopathy", icon: Sparkles, summary: "Doctor-guided alternative care listed in the hospital pamphlet." },
  { name: "Lifestyle Wellness", icon: Activity, summary: "Daily routine, nutrition, sleep, stress, weight, and metabolic wellness support." },
  { name: "Pain Management", icon: Bone, summary: "Non-surgical support for joint, knee, spine, back, and cervical pain." },
  { name: "Preventive Healthcare", icon: ShieldCheck, summary: "Early guidance, risk awareness, follow-up, and long-term wellness planning." }
];

export const treatments = [
  {
    slug: "joint-pain",
    title: "Joint Pain",
    icon: Bone,
    summary: "Mobility-focused care for knee, shoulder, and chronic joint discomfort.",
    details: "A personalized plan may include doctor consultation, posture assessment, Ayurveda therapies, naturopathy support, diet correction, and guided mobility routines."
  },
  {
    slug: "diabetes-care",
    title: "Diabetes Care",
    icon: Droplets,
    summary: "Integrated lifestyle, nutrition, monitoring, and metabolic support.",
    details: "Care focuses on blood sugar awareness, weight management, food habits, stress, sleep, and doctor-led follow-up for safer long-term control."
  },
  {
    slug: "kidney-care",
    title: "Kidney Care",
    icon: ShieldCheck,
    summary: "Supportive wellness plans for kidney health, stones, and preventive monitoring.",
    details: "Doctors guide hydration habits, diet, medical history review, lab monitoring, and safe supportive therapies based on the patient's condition."
  },
  {
    slug: "liver-care",
    title: "Liver Care",
    icon: Activity,
    summary: "Digestive, detox, nutrition, and lifestyle support for liver wellness.",
    details: "The care pathway emphasizes safe evaluation, dietary correction, metabolic improvement, and holistic routines that reduce avoidable strain."
  },
  {
    slug: "heart-care",
    title: "Heart Care",
    icon: HeartPulse,
    summary: "Lifestyle, monitoring, and supportive integrative care for heart wellness.",
    details: "Doctors review symptoms, reports, medicines, diet, stress, and activity patterns before recommending a safe supportive care plan."
  },
  {
    slug: "lung-care",
    title: "Lung and Breathing Care",
    icon: Activity,
    summary: "Supportive care for breathing difficulty, recurring cough, and respiratory weakness.",
    details: "The program may include medical review, breathing practices, trigger awareness, immunity support, and follow-up guidance."
  },
  {
    slug: "spine-cervical-care",
    title: "Spine and Cervical Care",
    icon: Bone,
    summary: "Care for cervical pain, back pain, disc-related discomfort, and posture concerns.",
    details: "A structured pathway helps patients understand pain triggers, posture, mobility, therapies, and practical home routines."
  },
  {
    slug: "nerve-care",
    title: "Nerve and Numbness Care",
    icon: Brain,
    summary: "Support for nerve blockage concerns, numbness, tingling, and limb discomfort.",
    details: "Doctors assess medical history and symptoms carefully, then guide therapies, diet, exercise, and referral needs where appropriate."
  },
  {
    slug: "paralysis-rehabilitation-support",
    title: "Paralysis Rehabilitation Support",
    icon: ShieldCheck,
    summary: "Long-term supportive rehabilitation planning for paralysis and weakness.",
    details: "Care focuses on supervised support, family guidance, therapy routines, prevention of complications, and regular progress review."
  },
  {
    slug: "stone-and-urinary-care",
    title: "Stone and Urinary Care",
    icon: Droplets,
    summary: "Doctor-led guidance for kidney stone concerns, urinary discomfort, and hydration habits.",
    details: "Patients are guided through report review, hydration, diet, symptom monitoring, and appropriate clinical referral when needed."
  },
  {
    slug: "thyroid",
    title: "Thyroid",
    icon: Sparkles,
    summary: "Whole-person support for thyroid balance, weight, mood, and energy.",
    details: "A doctor-led program looks at reports, symptoms, nutrition, stress, sleep, and routine habits to support more stable health."
  },
  {
    slug: "skin-disorders",
    title: "Skin Disorders",
    icon: Leaf,
    summary: "Natural and clinical care for recurring skin concerns and inflammation.",
    details: "Plans may combine internal health review, diet changes, cleansing routines, Ayurveda support, and follow-up for visible progress."
  },
  {
    slug: "digestive-disorders",
    title: "Digestive Disorders",
    icon: FileHeart,
    summary: "Gut-focused care for acidity, bloating, constipation, and irregular digestion.",
    details: "Treatment is built around food timing, trigger mapping, stress regulation, digestive therapies, and practical lifestyle changes."
  },
  {
    slug: "back-pain",
    title: "Back Pain",
    icon: Bone,
    summary: "Posture, therapy, and recovery programs for back and spine discomfort.",
    details: "The pathway may include pain evaluation, movement guidance, therapies, ergonomic education, and follow-up tracking."
  },
  {
    slug: "arthritis",
    title: "Arthritis",
    icon: Activity,
    summary: "Comfort, flexibility, and inflammation support for arthritis patients.",
    details: "Care combines physician assessment, gentle therapies, anti-inflammatory nutrition, daily movement planning, and patient education."
  },
  {
    slug: "migraine",
    title: "Migraine",
    icon: Brain,
    summary: "Trigger-led migraine care for stress, sleep, digestion, and lifestyle patterns.",
    details: "Doctors help identify triggers, improve routines, and build a preventive care plan alongside appropriate medical guidance."
  },
  {
    slug: "womens-health",
    title: "Women's Health",
    icon: HeartPulse,
    summary: "Respectful care for hormonal, metabolic, reproductive, and wellness needs.",
    details: "Programs support menstrual concerns, fatigue, weight, stress, family health, and preventive wellness."
  },
  {
    slug: "respiratory-care",
    title: "Respiratory Care",
    icon: Activity,
    summary: "Breathing, immunity, allergy, and lifestyle support for respiratory wellness.",
    details: "Care includes breathing practices, trigger awareness, immunity support, environment guidance, and doctor-led monitoring."
  },
  {
    slug: "cancer-supportive-care",
    title: "Cancer Supportive Care",
    icon: ShieldCheck,
    summary: "Supportive wellness guidance for strength, nutrition, comfort, and coordinated referral.",
    details: "This is supportive care only and does not replace oncology treatment. Doctors help families with nutrition, fatigue, comfort, and safe coordination with specialist medical care."
  }
];

export const doctors = [
  {
    name: "Dr. Sukhwinder Singh",
    qualification: "Punjab (M.D.), B.E.M.S. Electro Homeopathy, D.N.Y.S. Naturopathy",
    experience: "Managing Director",
    specialization: "Chronic disease specialist, Ayurveda, Naturopathy, Electro Homeopathy advisor",
    languages: "Hindi, English, Punjabi",
    initials: "SS"
  },
  {
    name: "Dr. S. S. Singh",
    qualification: "B.E.M.S. Electro Homeopathy, D.N.Y.S. Naturopathy",
    experience: "Chronic Disease Expert",
    specialization: "Electro Homeopathy, Naturopathy, Ayurveda and chronic disease advisory",
    languages: "Hindi, English",
    initials: "SS"
  },
  {
    name: "Dr. Raj Kumari",
    qualification: "B.A.M.S. Alternative",
    experience: "Chronic Disease Expert",
    specialization: "Naturopathy advisory and alternative care",
    languages: "Hindi, English",
    initials: "RK"
  },
  {
    name: "Dr. G. K. Kumari",
    qualification: "D.N.Y.S. Naturopathy",
    experience: "Naturopathy Advisor",
    specialization: "Natural healing, wellness routines, and patient guidance",
    languages: "Hindi, English",
    initials: "GK"
  }
];

export const patientSchemes = [
  {
    title: "Free Registration for Eligible Poor Families",
    text: "Eligible poor families can ask the hospital desk about the free-registration and free-treatment support scheme mentioned in the pamphlet.",
    icon: Users
  },
  {
    title: "Private Insurance Support",
    text: "Patients with private insurance policies can contact the care desk for cashless or bill-support guidance, subject to policy terms and approval.",
    icon: FileHeart
  },
  {
    title: "Documented Care Assurance",
    text: "The pamphlet mentions written assurance and refund documentation. Patients should verify the final terms at registration before starting treatment.",
    icon: ShieldCheck
  },
  {
    title: "Doctor-prepared Medicines",
    text: "The pamphlet states that medicines are prepared by the hospital's specialist doctors. Patients should share current medicines and reports before any plan begins.",
    icon: Stethoscope
  }
];

export const conditionGroups = [
  "Liver, kidney and heart concerns",
  "Lung and breathing problems",
  "Joint pain, knee pain and arthritis",
  "Back pain, spine pain and cervical pain",
  "Nerve blockage, numbness and tingling",
  "Paralysis and long-term weakness support",
  "Diabetes, thyroid and cholesterol concerns",
  "Digestive disorders and stomach problems",
  "Skin disorders and chronic itching",
  "Women's health, men's health and infertility concerns",
  "Tumor and cancer supportive care with referral guidance",
  "General body pain and lifestyle disorders"
];

export const hindiHighlights = [
  "निःशुल्क पंजीकरण योजना की जानकारी अस्पताल से प्राप्त करें।",
  "प्राइवेट बीमा पॉलिसी पर कैशलेस या बिल सहायता उपलब्ध हो सकती है।",
  "इलाज शुरू करने से पहले अपनी पुरानी रिपोर्ट और दवाइयों की जानकारी डॉक्टर को दें।",
  "हेल्पलाइन: 9119744783, 9068534783"
];

export const patientHindiHighlights = [
  "\u0928\u093f\u0903\u0936\u0941\u0932\u094d\u0915 \u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u092f\u094b\u091c\u0928\u093e \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0905\u0938\u094d\u092a\u0924\u093e\u0932 \u0938\u0947 \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u0915\u0930\u0947\u0902\u0964",
  "\u092a\u094d\u0930\u093e\u0907\u0935\u0947\u091f \u092c\u0940\u092e\u093e \u092a\u0949\u0932\u093f\u0938\u0940 \u092a\u0930 \u0915\u0948\u0936\u0932\u0947\u0938 \u092f\u093e \u092c\u093f\u0932 \u0938\u0939\u093e\u092f\u0924\u093e \u0909\u092a\u0932\u092c\u094d\u0927 \u0939\u094b \u0938\u0915\u0924\u0940 \u0939\u0948\u0964",
  "\u0907\u0932\u093e\u091c \u0936\u0941\u0930\u0942 \u0915\u0930\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0905\u092a\u0928\u0940 \u092a\u0941\u0930\u093e\u0928\u0940 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0914\u0930 \u0926\u0935\u093e\u0907\u092f\u094b\u0902 \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0921\u0949\u0915\u094d\u091f\u0930 \u0915\u094b \u0926\u0947\u0902\u0964",
  "\u0939\u0947\u0932\u094d\u092a\u0932\u093e\u0907\u0928: 9119744783, 9068534783"
];

export const journey = [
  "Appointment",
  "Consultation",
  "Diagnosis",
  "Personalized Treatment Plan",
  "Therapy",
  "Follow-up",
  "Recovery Support"
];

export const testimonials = [
  {
    name: "Suresh Patel",
    condition: "Joint pain recovery",
    quote: "The doctors explained everything simply. My treatment felt organized, respectful, and focused on daily improvement."
  },
  {
    name: "Farida Khan",
    condition: "Diabetes lifestyle program",
    quote: "The care team helped me understand food, sleep, stress, and reports in a way my whole family could follow."
  },
  {
    name: "Amit Verma",
    condition: "Back pain management",
    quote: "The therapy schedule and doctor follow-up gave me confidence. The hospital feels modern and very human."
  }
];

export const faqs = [
  {
    q: "Do I need previous reports for consultation?",
    a: "Bring any recent reports, prescriptions, scans, or discharge summaries. The doctor can still guide you if you do not have them."
  },
  {
    q: "Can senior citizens book appointments easily?",
    a: "Yes. Families can book online, call the hospital, or use WhatsApp for assisted booking."
  },
  {
    q: "Are Ayurveda, Naturopathy, and Electro Homeopathy used together?",
    a: "Doctors recommend an integrated plan only after reviewing the patient's condition, medical history, current treatment, and reports."
  },
  {
    q: "What are the hospital timings?",
    a: "The pamphlet lists consultation timing as 10:00 AM to 4:00 PM, with Sunday closed."
  },
  {
    q: "Is free treatment available?",
    a: "The pamphlet mentions a free-treatment support scheme for eligible poor families. Please confirm eligibility and documents at the hospital desk."
  },
  {
    q: "Can I use private insurance?",
    a: "The pamphlet says patients may receive support through private insurance policies, subject to policy terms and approval."
  },
  {
    q: "What about the assurance mentioned in the pamphlet?",
    a: "Any assurance, refund process, or written documentation should be confirmed at registration, including eligibility, exclusions, and treatment-completion requirements."
  },
  {
    q: "Is emergency support available?",
    a: "The helpline numbers are visible throughout the website for urgent help and quick routing."
  }
];

export const blogPosts = [
  {
    slug: "ayurveda-and-modern-diagnostics",
    title: "How Ayurveda and Modern Diagnostics Can Work Together",
    category: "Ayurveda",
    readTime: "5 min read",
    excerpt: "A clear look at how reports, symptoms, lifestyle, and natural care can support better decisions.",
    image: "/images/npn-care-hero.png",
    publishedAt: "2026-07-20",
    authorName: "Dr. Raj Kumari",
    authorQualification: "B.A.M.S.",
    metaTitle: "Ayurveda and Modern Diagnostics | N.P.N. Care Hospital",
    metaDescription: "Learn how Ayurveda and modern reports can work together for safer health decisions.",
    fullContent: [
      "Ayurveda begins with understanding the person, not only the symptom. Modern diagnostic reports can add useful clarity about current health status, risk factors, and progress over time.",
      "When both are used responsibly, the doctor can review symptoms, medical history, medicines, food habits, sleep, stress, and available reports before suggesting the next step.",
      "Patients should bring recent blood tests, scans, prescriptions, and discharge summaries when available. These documents help the care team explain the condition in simple language and avoid unnecessary confusion."
    ]
  },
  {
    slug: "joint-pain-warning-signs",
    title: "Joint Pain Warning Signs Families Should Not Ignore",
    category: "Pain Care",
    readTime: "4 min read",
    excerpt: "Simple indicators that help patients seek care early and avoid preventable discomfort.",
    image: "/images/npn-care-hero.png",
    publishedAt: "2026-07-18",
    authorName: "Dr. Sukhwinder Singh",
    authorQualification: "Chronic Disease Specialist",
    metaTitle: "Joint Pain Warning Signs | N.P.N. Care Hospital",
    metaDescription: "Understand joint pain warning signs and when families should seek doctor guidance.",
    fullContent: [
      "Joint pain should be reviewed when it affects walking, sleep, work, daily chores, or mobility. Swelling, stiffness, repeated pain, or pain after a fall should not be ignored.",
      "A doctor can check whether the pain is linked to injury, age-related changes, lifestyle strain, inflammation, posture, weight, or an existing medical condition.",
      "Early consultation helps patients understand the safest care pathway, including exercises, lifestyle correction, natural therapies, and follow-up planning where suitable."
    ]
  },
  {
    slug: "diabetes-lifestyle-routine",
    title: "A Daily Routine for Better Diabetes Management",
    category: "Diabetes",
    readTime: "6 min read",
    excerpt: "Food timing, movement, sleep, stress, and follow-up habits that make care more sustainable.",
    image: "/images/npn-care-hero.png",
    publishedAt: "2026-07-15",
    authorName: "Dr. S. S. Singh",
    authorQualification: "D.N.Y.S. Naturopathy",
    metaTitle: "Daily Routine for Diabetes Management | N.P.N. Care Hospital",
    metaDescription: "Simple daily lifestyle habits that can support diabetes care and doctor-led follow-up.",
    fullContent: [
      "Diabetes care becomes easier when daily habits are consistent. Food timing, sleep, movement, hydration, stress, and medicine follow-up all matter.",
      "Patients should track sugar reports as advised by their doctor and share symptoms such as weakness, unusual thirst, weight changes, or repeated fatigue during consultation.",
      "A sustainable routine is not extreme. It should be realistic for the patient's age, work, family life, medicines, and medical history."
    ]
  },
  {
    slug: "heart-health-family-guide",
    title: "A Family Guide to Heart Health Warning Signs",
    category: "Heart Care",
    readTime: "5 min read",
    excerpt: "Know the symptoms, habits, and follow-up steps that support better heart health awareness.",
    image: "/images/npn-care-hero.png",
    publishedAt: "2026-07-12",
    authorName: "Dr. G. K. Kumari",
    authorQualification: "D.N.Y.S. Naturopathy",
    metaTitle: "Heart Health Warning Signs | N.P.N. Care Hospital",
    metaDescription: "A simple family guide to heart health awareness and timely consultation.",
    fullContent: [
      "Chest discomfort, breathlessness, unusual sweating, repeated fatigue, dizziness, or pain spreading to the arm or jaw should be taken seriously.",
      "Families can support heart health by encouraging regular check-ups, balanced food, sleep, movement, stress management, and medicine adherence as advised.",
      "Emergency symptoms require urgent medical help. Wellness guidance is useful, but it should never delay emergency care."
    ]
  },
  {
    slug: "nutrition-for-natural-wellness",
    title: "Nutrition Habits That Support Natural Wellness",
    category: "Nutrition",
    readTime: "5 min read",
    excerpt: "Simple food habits that help patients build a more stable daily wellness routine.",
    image: "/images/npn-care-hero.png",
    publishedAt: "2026-07-10",
    authorName: "N.P.N. Doctor Team",
    authorQualification: "Doctor reviewed",
    metaTitle: "Nutrition for Natural Wellness | N.P.N. Care Hospital",
    metaDescription: "Learn practical nutrition habits that support long-term wellness.",
    fullContent: [
      "Nutrition advice should fit the patient's body, routine, condition, age, appetite, digestion, and medicines. A plan that is too difficult is rarely sustainable.",
      "Balanced meals, regular timing, mindful portions, hydration, and less dependence on processed foods can support better daily energy.",
      "Patients with diabetes, kidney issues, heart concerns, pregnancy, or chronic disease should take personalized diet guidance before making major changes."
    ]
  },
  {
    slug: "skin-health-and-natural-care",
    title: "Skin Health: When Rashes and Itching Need Attention",
    category: "Skin",
    readTime: "4 min read",
    excerpt: "Understand common skin signals and why personal review matters before treatment.",
    image: "/images/npn-care-hero.png",
    publishedAt: "2026-07-08",
    authorName: "Dr. Raj Kumari",
    authorQualification: "B.A.M.S.",
    metaTitle: "Skin Health and Natural Care | N.P.N. Care Hospital",
    metaDescription: "Understand when rashes, itching, and skin irritation should be reviewed by a doctor.",
    fullContent: [
      "Skin symptoms can be linked to allergy, infection, weather, food, stress, medicines, hygiene, or internal health concerns.",
      "A spreading rash, pain, swelling, pus, fever, repeated itching, or symptoms after a new medicine should be reviewed promptly.",
      "The care plan should be based on examination and history. Avoid using strong creams or home remedies without guidance."
    ]
  }
];

export const gallery = [
  "Reception",
  "Consultation",
  "Therapy Rooms",
  "Wellness Spaces",
  "Pharmacy",
  "Patient Lounge",
  "Modern Equipment",
  "Clean Environment"
];

export const adminModules = [
  { title: "Appointments", value: "126", icon: CalendarCheck },
  { title: "Doctors", value: "04", icon: Stethoscope },
  { title: "Treatments", value: "42", icon: Leaf },
  { title: "Gallery", value: "318", icon: Building2 },
  { title: "Videos", value: "64", icon: Video },
  { title: "Reviews", value: "1,842", icon: MessageCircle },
  { title: "SEO Pages", value: "89", icon: CheckCircle2 },
  { title: "Users", value: "18", icon: Users }
];

export const cmsAreas = [
  "Homepage Sections",
  "Doctors",
  "Departments",
  "Treatments",
  "Blogs",
  "Gallery",
  "Videos",
  "Testimonials",
  "FAQs",
  "SEO",
  "Media Library",
  "Settings"
];
