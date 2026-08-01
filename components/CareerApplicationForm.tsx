"use client";

import { useRef, useState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";

type CareerSubmitResult = {
  ok: boolean;
  message?: string;
  application?: {
    applicationId: string;
    submittedAt: string;
    status: string;
  };
};

const positions = [
  "Receptionist",
  "Doctor",
  "Naturopathy Therapist",
  "Pharmacist",
  "Nursing Assistant",
  "Patient Care Coordinator",
  "Content Manager",
  "Admin Executive"
];

export function CareerApplicationForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("Upload PDF, DOC, or DOCX resume up to 5 MB.");
  const [success, setSuccess] = useState<CareerSubmitResult["application"] | null>(null);

  function submitApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    setSubmitting(true);
    setProgress(0);
    setMessage("Submitting application...");
    setSuccess(null);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/careers");
    request.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      }
    };
    request.onload = () => {
      setSubmitting(false);
      const result = JSON.parse(request.responseText || "{}") as CareerSubmitResult;
      if (request.status >= 200 && request.status < 300 && result.application) {
        setSuccess(result.application);
        setMessage("Application submitted successfully.");
        formRef.current?.reset();
        setProgress(100);
        return;
      }

      setMessage(result.message ?? "Please check the form and try again.");
    };
    request.onerror = () => {
      setSubmitting(false);
      setMessage("Network error. Please try again.");
    };
    request.send(new FormData(formRef.current));
  }

  return (
    <form ref={formRef} className="career-form" onSubmit={submitApplication}>
      <div className="form-title">
        <span className="card-icon">
          <UploadCloud size={22} />
        </span>
        <div>
          <h3>Apply online</h3>
          <p>Applications are sent securely to the hospital admin team.</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Full Name *
          <input name="fullName" required minLength={2} />
        </label>
        <label>
          Father&apos;s / Parent&apos;s Name *
          <input name="parentName" required minLength={2} />
        </label>
        <label>
          Email Address *
          <input name="email" type="email" required />
        </label>
        <label>
          Mobile Number *
          <input name="mobile" required minLength={10} />
        </label>
        <label className="span-2">
          Address *
          <input name="address" required minLength={5} />
        </label>
        <label>
          City *
          <input name="city" required />
        </label>
        <label>
          State *
          <input name="state" required />
        </label>
        <label>
          Pincode *
          <input name="pincode" required />
        </label>
        <label>
          Date of Birth *
          <input name="dateOfBirth" type="date" required />
        </label>
        <label>
          Gender *
          <select name="gender" required defaultValue="">
            <option value="" disabled>Select</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Highest Qualification *
          <input name="qualification" required />
        </label>
        <label>
          Experience *
          <input name="experience" required placeholder="Fresher, 2 years, 5+ years" />
        </label>
        <label>
          Position Applying For *
          <select name="position" required defaultValue="">
            <option value="" disabled>Select</option>
            {positions.map((position) => (
              <option key={position}>{position}</option>
            ))}
          </select>
        </label>
        <label>
          Expected Salary
          <input name="expectedSalary" />
        </label>
        <label>
          Upload Resume (PDF/DOC/DOCX) *
          <input name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
        </label>
        <label>
          Upload Passport Photo
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <label className="span-2">
          Additional Message
          <textarea name="message" />
        </label>
      </div>

      <label className="declaration-check">
        <input name="declarationAccepted" type="checkbox" value="true" required />
        <span>I confirm that the information provided is true and I allow N.P.N. Care Hospital to contact me about this application.</span>
      </label>

      <div className="upload-progress" aria-label="Upload progress">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className={success ? "success-note" : "form-helper"}>
        {success ? <CheckCircle2 size={17} /> : null}
        {success ? `Application ID: ${success.applicationId} | Status: ${success.status}` : message}
      </p>

      <button className="button button-primary form-submit" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
