"use client";

import { useMemo, useRef, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  PenLine,
  ShieldCheck,
  Upload,
  UserRound
} from "lucide-react";
import type { AgreementDocument, AgreementInput } from "@/lib/agreements";
import type { CmsContent } from "@/lib/cms";

type AgreementWizardProps = {
  doctors: CmsContent["doctors"];
  departments: CmsContent["departments"];
  hospital: CmsContent["hospital"];
};

type AgreementErrors = Record<string, string>;

const steps = [
  "Patient Information",
  "Medical Information",
  "Treatment Details",
  "Upload Documents",
  "Digital Agreement",
  "Digital Signature",
  "Review"
];

const agreementSections = [
  {
    key: "declaration",
    title: "Patient Declaration",
    text: "I confirm that the personal information provided by me is true and complete."
  },
  {
    key: "treatmentConsent",
    title: "Treatment Consent",
    text: "I understand that treatment planning depends on consultation, medical history, and doctor assessment."
  },
  {
    key: "privacyPolicy",
    title: "Privacy Policy",
    text: "I consent to the hospital storing and using my information for care, follow-up, billing, and required records."
  },
  {
    key: "medicalConfirmation",
    title: "Medical Information Confirmation",
    text: "I confirm that I have shared previous reports, medicines, allergies, and relevant medical details accurately."
  },
  {
    key: "responsibilities",
    title: "Responsibilities",
    text: "I agree to follow doctor guidance, attend follow-ups, and inform the hospital if my condition changes."
  },
  {
    key: "importantNotes",
    title: "Important Notes",
    text: "I understand that outcomes vary by patient and no treatment promise is final without written hospital confirmation."
  }
] as const;

const initialForm: AgreementInput = {
  patient: {
    fullName: "",
    guardianName: "",
    gender: "",
    dob: "",
    age: 0,
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: ""
  },
  medical: {
    disease: "",
    symptoms: "",
    duration: "",
    previousTreatment: "",
    currentMedicines: "",
    medicalHistory: "",
    allergies: "",
    doctorPreference: ""
  },
  treatment: {
    courseDuration: "",
    recommendedTherapy: "",
    assignedDoctor: "",
    hospitalBranch: ""
  },
  documents: [],
  confirmations: {
    declaration: false,
    treatmentConsent: false,
    privacyPolicy: false,
    medicalConfirmation: false,
    responsibilities: false,
    importantNotes: false,
    finalConsent: false
  },
  signature: {
    mode: "type",
    value: "",
    typedName: ""
  }
};

export function AgreementWizard({ doctors, departments, hospital }: AgreementWizardProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AgreementInput>(initialForm);
  const [errors, setErrors] = useState<AgreementErrors>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const completion = Math.round(((step + 1) / steps.length) * 100);

  const doctorOptions = useMemo(() => doctors.map((doctor) => doctor.name), [doctors]);
  const departmentOptions = useMemo(() => departments.map((department) => department.name), [departments]);

  function setNested(section: keyof AgreementInput, key: string, value: string | number | boolean) {
    setForm((current) => ({
      ...current,
      [section]: {
        ...(current[section] as Record<string, unknown>),
        [key]: value
      }
    }));
  }

  function field(name: string, value: string | number | undefined, label: string, nextErrors: AgreementErrors) {
    if (value === undefined || String(value).trim() === "" || value === 0) {
      nextErrors[name] = `${label} is required`;
    }
  }

  function validateCurrentStep() {
    const nextErrors: AgreementErrors = {};

    if (step === 0) {
      field("fullName", form.patient.fullName, "Full name", nextErrors);
      field("guardianName", form.patient.guardianName, "Father's / husband's name", nextErrors);
      field("gender", form.patient.gender, "Gender", nextErrors);
      field("dob", form.patient.dob, "Date of birth", nextErrors);
      field("age", form.patient.age, "Age", nextErrors);
      field("mobile", form.patient.mobile, "Mobile number", nextErrors);
      field("address", form.patient.address, "Address", nextErrors);
      field("city", form.patient.city, "City", nextErrors);
      field("state", form.patient.state, "State", nextErrors);
      field("pinCode", form.patient.pinCode, "PIN code", nextErrors);
      if (form.patient.email && !form.patient.email.includes("@")) nextErrors.email = "Enter a valid email";
      if (form.patient.mobile && form.patient.mobile.replace(/\D/g, "").length < 10) nextErrors.mobile = "Enter a valid mobile number";
    }

    if (step === 1) {
      Object.entries(form.medical).forEach(([key, value]) => field(key, value, key.replace(/([A-Z])/g, " $1"), nextErrors));
    }

    if (step === 2) {
      Object.entries(form.treatment).forEach(([key, value]) => field(key, value, key.replace(/([A-Z])/g, " $1"), nextErrors));
    }

    if (step === 3 && form.documents.length === 0) {
      nextErrors.documents = "Upload at least one required document";
    }

    if (step === 4) {
      Object.entries(form.confirmations).forEach(([key, value]) => {
        if (!value) nextErrors[key] = "Required";
      });
    }

    if (step === 5) {
      field("signature", form.signature.value, "Signature", nextErrors);
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    if (validateCurrentStep()) setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function previous() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleFiles(label: string, files: FileList | null) {
    if (!files?.length) return;
    setUploadProgress(18);
    const documents = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<AgreementDocument>((resolve) => {
            const document: AgreementDocument = {
              label,
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size
            };

            if (file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = () => resolve({ ...document, preview: String(reader.result) });
              reader.readAsDataURL(file);
              return;
            }

            resolve(document);
          })
      )
    );
    setUploadProgress(100);
    setForm((current) => ({ ...current, documents: [...current.documents, ...documents] }));
    window.setTimeout(() => setUploadProgress(0), 800);
  }

  function startDraw(event: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    draw(event);
  }

  function stopDraw() {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setNested("signature", "value", canvas.toDataURL("image/png"));
    }
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    if (!context) return;
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.strokeStyle = "#123b2c";
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    context.stroke();
    context.beginPath();
    context.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setForm((current) => ({ ...current, signature: { ...current.signature, value: "", typedName: "" } }));
  }

  async function submitAgreement() {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    const response = await fetch("/api/agreements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const result = (await response.json()) as { ok: boolean; agreement?: { agreementNo: string } };
    setSubmitting(false);

    if (response.ok && result.agreement) {
      router.push(`/agreement/success/${result.agreement.agreementNo}`);
      return;
    }

    setErrors({ submit: "Please review all steps before submitting." });
  }

  return (
    <section className="agreement-shell">
      <div className="agreement-progress-card">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={17} />
            Secure Digital Agreement
          </span>
          <h1>Complete your treatment agreement online.</h1>
          <p>Finish the legally organized patient agreement in about five minutes. Your submission goes to admin review.</p>
        </div>
        <strong>{completion}%</strong>
      </div>

      <div className="wizard-progress" aria-label="Agreement progress">
        <span style={{ width: `${completion}%` }} />
      </div>

      <div className="wizard-layout">
        <aside className="wizard-steps">
          {steps.map((item, index) => (
            <button className={index === step ? "active" : index < step ? "done" : ""} key={item} onClick={() => setStep(index)} type="button">
              <CheckCircle2 size={18} />
              <span>{item}</span>
            </button>
          ))}
        </aside>

        <div className="wizard-panel">
          {step === 0 ? (
            <div className="wizard-section">
              <StepTitle icon={<UserRound size={22} />} title="Patient Information" text="Enter patient identity and contact details." />
              <div className="form-grid">
                <WizardInput label="Full Name" value={form.patient.fullName} error={errors.fullName} onChange={(value) => setNested("patient", "fullName", value)} />
                <WizardInput label="Father's / Husband's Name" value={form.patient.guardianName} error={errors.guardianName} onChange={(value) => setNested("patient", "guardianName", value)} />
                <WizardSelect label="Gender" value={form.patient.gender} error={errors.gender} options={["Female", "Male", "Other"]} onChange={(value) => setNested("patient", "gender", value)} />
                <WizardInput label="Date of Birth" type="date" value={form.patient.dob} error={errors.dob} onChange={(value) => setNested("patient", "dob", value)} />
                <WizardInput label="Age" type="number" value={String(form.patient.age || "")} error={errors.age} onChange={(value) => setNested("patient", "age", Number(value))} />
                <WizardInput label="Mobile Number" value={form.patient.mobile} error={errors.mobile} onChange={(value) => setNested("patient", "mobile", value)} />
                <WizardInput label="Email" value={form.patient.email ?? ""} error={errors.email} onChange={(value) => setNested("patient", "email", value)} />
                <WizardInput label="PIN Code" value={form.patient.pinCode} error={errors.pinCode} onChange={(value) => setNested("patient", "pinCode", value)} />
              </div>
              <WizardTextarea label="Address" value={form.patient.address} error={errors.address} onChange={(value) => setNested("patient", "address", value)} />
              <div className="form-grid">
                <WizardInput label="City" value={form.patient.city} error={errors.city} onChange={(value) => setNested("patient", "city", value)} />
                <WizardInput label="State" value={form.patient.state} error={errors.state} onChange={(value) => setNested("patient", "state", value)} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="wizard-section">
              <StepTitle icon={<FileText size={22} />} title="Medical Information" text="Share the problem, symptoms, treatment history, and preferences." />
              <div className="form-grid">
                <WizardInput label="Disease / Problem" value={form.medical.disease} error={errors.disease} onChange={(value) => setNested("medical", "disease", value)} />
                <WizardInput label="Duration" value={form.medical.duration} error={errors.duration} onChange={(value) => setNested("medical", "duration", value)} />
              </div>
              <WizardTextarea label="Symptoms" value={form.medical.symptoms} error={errors.symptoms} onChange={(value) => setNested("medical", "symptoms", value)} />
              <WizardTextarea label="Previous Treatment" value={form.medical.previousTreatment} error={errors.previousTreatment} onChange={(value) => setNested("medical", "previousTreatment", value)} />
              <WizardTextarea label="Current Medicines" value={form.medical.currentMedicines} error={errors.currentMedicines} onChange={(value) => setNested("medical", "currentMedicines", value)} />
              <WizardTextarea label="Medical History" value={form.medical.medicalHistory} error={errors.medicalHistory} onChange={(value) => setNested("medical", "medicalHistory", value)} />
              <div className="form-grid">
                <WizardInput label="Allergies" value={form.medical.allergies} error={errors.allergies} onChange={(value) => setNested("medical", "allergies", value)} />
                <WizardSelect label="Doctor Preference" value={form.medical.doctorPreference} error={errors.doctorPreference} options={doctorOptions} onChange={(value) => setNested("medical", "doctorPreference", value)} />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="wizard-section">
              <StepTitle icon={<ShieldCheck size={22} />} title="Treatment Details" text="Confirm the recommended pathway before agreement review." />
              <div className="form-grid">
                <WizardInput label="Course Duration" value={form.treatment.courseDuration} error={errors.courseDuration} onChange={(value) => setNested("treatment", "courseDuration", value)} />
                <WizardInput label="Recommended Therapy" value={form.treatment.recommendedTherapy} error={errors.recommendedTherapy} onChange={(value) => setNested("treatment", "recommendedTherapy", value)} />
                <WizardSelect label="Assigned Doctor" value={form.treatment.assignedDoctor} error={errors.assignedDoctor} options={doctorOptions} onChange={(value) => setNested("treatment", "assignedDoctor", value)} />
                <WizardSelect label="Hospital Branch" value={form.treatment.hospitalBranch} error={errors.hospitalBranch} options={[hospital.address, ...departmentOptions]} onChange={(value) => setNested("treatment", "hospitalBranch", value)} />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="wizard-section">
              <StepTitle icon={<Upload size={22} />} title="Upload Documents" text="Attach photographs, IDs, reports, prescriptions, and optional insurance documents." />
              <div className="upload-grid">
                {["Patient Photograph", "Government ID", "Medical Reports", "Previous Prescription", "Insurance Documents Optional"].map((label) => (
                  <label className="upload-dropzone" key={label}>
                    <Upload size={22} />
                    <strong>{label}</strong>
                    <span>Drag, drop, or browse files</span>
                    <input multiple type="file" accept="image/*,.pdf" onChange={(event) => void handleFiles(label, event.target.files)} />
                  </label>
                ))}
              </div>
              {uploadProgress ? (
                <div className="upload-progress">
                  <span style={{ width: `${uploadProgress}%` }} />
                </div>
              ) : null}
              {errors.documents ? <p className="field-error">{errors.documents}</p> : null}
              <div className="document-preview-grid">
                {form.documents.map((document, index) => (
                  <article className="document-preview" key={`${document.name}-${index}`}>
                    {document.preview ? <img src={document.preview} alt="" /> : <FileText size={34} />}
                    <strong>{document.label}</strong>
                    <span>{document.name}</span>
                    <small>{Math.round(document.size / 1024)} KB</small>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="wizard-section">
              <StepTitle icon={<FileCheck2 size={22} />} title="Digital Agreement" text="Read each section and confirm before signing." />
              <div className="agreement-text-card">
                {agreementSections.map((section) => (
                  <label className="consent-row" key={section.key}>
                    <input
                      checked={Boolean(form.confirmations[section.key])}
                      type="checkbox"
                      onChange={(event) => setNested("confirmations", section.key, event.target.checked)}
                    />
                    <span>
                      <strong>{section.title}</strong>
                      {section.text}
                    </span>
                  </label>
                ))}
                <label className="consent-row final">
                  <input checked={form.confirmations.finalConsent} type="checkbox" onChange={(event) => setNested("confirmations", "finalConsent", event.target.checked)} />
                  <span>
                    <strong>I have read and understood the agreement and voluntarily agree to all terms.</strong>
                  </span>
                </label>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="wizard-section">
              <StepTitle icon={<PenLine size={22} />} title="Digital Signature" text="Draw, type, or upload your signature." />
              <div className="signature-tabs">
                {(["type", "draw", "upload"] as const).map((mode) => (
                  <button className={form.signature.mode === mode ? "active" : ""} key={mode} type="button" onClick={() => setForm((current) => ({ ...current, signature: { mode, value: "", typedName: "" } }))}>
                    {mode}
                  </button>
                ))}
              </div>
              {form.signature.mode === "type" ? (
                <WizardInput
                  label="Type Signature"
                  value={form.signature.typedName ?? ""}
                  error={errors.signature}
                  onChange={(value) => setForm((current) => ({ ...current, signature: { mode: "type", typedName: value, value } }))}
                />
              ) : null}
              {form.signature.mode === "draw" ? (
                <div>
                  <canvas
                    className="signature-pad"
                    height={220}
                    ref={canvasRef}
                    width={720}
                    onPointerDown={startDraw}
                    onPointerMove={draw}
                    onPointerUp={stopDraw}
                    onPointerLeave={stopDraw}
                  />
                  {errors.signature ? <p className="field-error">{errors.signature}</p> : null}
                </div>
              ) : null}
              {form.signature.mode === "upload" ? (
                <label className="upload-dropzone single">
                  <Upload size={22} />
                  <strong>Upload Signature</strong>
                  <span>PNG, JPG, or PDF</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setForm((current) => ({ ...current, signature: { mode: "upload", value: file.name, typedName: file.name } }));
                    }}
                  />
                </label>
              ) : null}
              <button className="button button-quiet" type="button" onClick={clearSignature}>
                Clear Signature
              </button>
              {form.signature.value ? (
                <div className="signature-preview">
                  <span>Signature Preview</span>
                  {form.signature.value.startsWith("data:image") ? <img src={form.signature.value} alt="Signature preview" /> : <strong>{form.signature.value}</strong>}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 6 ? (
            <div className="wizard-section">
              <StepTitle icon={<CheckCircle2 size={22} />} title="Review Agreement" text="Confirm the complete summary before final submission." />
              <ReviewBlock title="Patient Information" items={[form.patient.fullName, form.patient.mobile, form.patient.email || "No email", `${form.patient.city}, ${form.patient.state} ${form.patient.pinCode}`]} />
              <ReviewBlock title="Medical Information" items={[form.medical.disease, form.medical.symptoms, form.medical.duration, form.medical.doctorPreference]} />
              <ReviewBlock title="Treatment Details" items={[form.treatment.courseDuration, form.treatment.recommendedTherapy, form.treatment.assignedDoctor, form.treatment.hospitalBranch]} />
              <ReviewBlock title="Uploaded Documents" items={form.documents.map((document) => `${document.label}: ${document.name}`)} />
              <ReviewBlock title="Agreement" items={["All agreement sections confirmed", "Final voluntary consent accepted"]} />
              <ReviewBlock title="Signature" items={[form.signature.value.startsWith("data:image") ? "Drawn signature captured" : form.signature.value]} />
              {errors.submit ? <p className="field-error">{errors.submit}</p> : null}
            </div>
          ) : null}

          <div className="wizard-actions">
            <button className="button button-quiet" type="button" onClick={previous} disabled={step === 0}>
              <ArrowLeft size={18} />
              Previous
            </button>
            {step < steps.length - 1 ? (
              <button className="button button-primary" type="button" onClick={next}>
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button className="button button-primary" type="button" onClick={submitAgreement} disabled={submitting}>
                <FileCheck2 size={18} />
                {submitting ? "Submitting..." : "Submit Agreement"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepTitle({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="form-title">
      <span className="card-icon">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

function WizardInput({
  label,
  value,
  error,
  type = "text",
  onChange
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <span>{error}</span> : null}
    </label>
  );
}

function WizardTextarea({ label, value, error, onChange }: { label: string; value: string; error?: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <span>{error}</span> : null}
    </label>
  );
}

function WizardSelect({
  label,
  value,
  error,
  options,
  onChange
}: {
  label: string;
  value: string;
  error?: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {error ? <span>{error}</span> : null}
    </label>
  );
}

function ReviewBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="review-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button className="button button-quiet" type="button">
        Edit
      </button>
    </article>
  );
}
