"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  Activity,
  AlertCircle,
  Calculator,
  Languages,
  Moon,
  Search,
  Stethoscope
} from "lucide-react";
import type { CmsContent } from "@/lib/cms";

type ExperienceToolsProps = {
  doctors: CmsContent["doctors"];
  hospital: CmsContent["hospital"];
  homepage: CmsContent["homepage"];
  treatments: CmsContent["treatments"];
};

export function ExperienceTools({ doctors, hospital, homepage, treatments }: ExperienceToolsProps) {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [doctorQuery, setDoctorQuery] = useState("");
  const [treatmentQuery, setTreatmentQuery] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [quiz, setQuiz] = useState("pain");

  const filteredDoctors = useMemo(() => {
    const query = doctorQuery.trim().toLowerCase();
    if (!query) return doctors.slice(0, 3);
    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialization, doctor.qualification, doctor.languages].join(" ").toLowerCase().includes(query)
    );
  }, [doctorQuery, doctors]);

  const filteredTreatments = useMemo(() => {
    const query = treatmentQuery.trim().toLowerCase();
    if (!query) return treatments.slice(0, 3);
    return treatments.filter((treatment) =>
      [treatment.title, treatment.summary, treatment.details].join(" ").toLowerCase().includes(query)
    );
  }, [treatmentQuery, treatments]);

  const bmi = useMemo(() => {
    const heightM = Number(height) / 100;
    const weightKg = Number(weight);
    if (!heightM || !weightKg) return null;
    return Number((weightKg / (heightM * heightM)).toFixed(1));
  }, [height, weight]);

  const bmiLabel = bmi == null ? "Enter details" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Needs doctor guidance";

  function toggleTheme() {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  }

  function toggleAccessibility() {
    const root = document.documentElement;
    root.dataset.accessibility = root.dataset.accessibility === "true" ? "false" : "true";
  }

  return (
    <section className="experience-tools" aria-label="Digital patient tools">
      <div className="tool-intro">
        <span className="eyebrow">
          <Activity size={17} />
          Digital Care Tools
        </span>
        <h2>{homepage.toolsTitle}</h2>
        <p>{homepage.toolsText}</p>
        <div className="tool-toggles" aria-label="Website preferences">
          <button className="chip-button" type="button" onClick={() => setLanguage(language === "en" ? "hi" : "en")}>
            <Languages size={17} />
            {language === "en" ? "English" : "Hindi"}
          </button>
          <button className="chip-button" type="button" onClick={toggleTheme}>
            <Moon size={17} />
            Dark Mode
          </button>
          <button className="chip-button" type="button" onClick={toggleAccessibility}>
            <Accessibility size={17} />
            Accessibility
          </button>
          <a className="chip-button urgent-chip" href={`tel:${hospital.emergency}`}>
            <AlertCircle size={17} />
            Emergency
          </a>
        </div>
      </div>

      <div className="tool-grid">
        <article className="tool-card">
          <span className="card-icon">
            <Stethoscope size={21} />
          </span>
          <h3>Doctor Search</h3>
          <input value={doctorQuery} onChange={(event) => setDoctorQuery(event.target.value)} placeholder="Search by doctor, language, specialty" />
          <div className="result-list">
            {filteredDoctors.map((doctor) => (
              <Link href="/doctors" key={doctor.name}>
                <strong>{doctor.name}</strong>
                <span>{doctor.specialization}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="tool-card">
          <span className="card-icon">
            <Search size={21} />
          </span>
          <h3>Treatment Finder</h3>
          <input value={treatmentQuery} onChange={(event) => setTreatmentQuery(event.target.value)} placeholder="Search joint pain, diabetes, thyroid" />
          <div className="result-list">
            {filteredTreatments.map((treatment) => (
              <Link href={`/treatments/${treatment.slug}`} key={treatment.slug}>
                <strong>{treatment.title}</strong>
                <span>{treatment.summary}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="tool-card">
          <span className="card-icon">
            <Calculator size={21} />
          </span>
          <h3>BMI Calculator</h3>
          <div className="mini-form">
            <input inputMode="numeric" value={height} onChange={(event) => setHeight(event.target.value)} placeholder="Height cm" />
            <input inputMode="numeric" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="Weight kg" />
          </div>
          <p className="tool-result">{bmi == null ? "BMI result appears here." : `BMI ${bmi} - ${bmiLabel}`}</p>
        </article>

        <article className="tool-card">
          <span className="card-icon">
            <Activity size={21} />
          </span>
          <h3>Health Assessment Quiz</h3>
          <select value={quiz} onChange={(event) => setQuiz(event.target.value)}>
            <option value="pain">Pain, stiffness, or mobility issue</option>
            <option value="metabolic">Diabetes, thyroid, weight, or digestion</option>
            <option value="breathing">Breathing, allergy, or weakness</option>
            <option value="wellness">General wellness and prevention</option>
          </select>
          <p className="tool-result">
            {quiz === "pain"
              ? "Recommended start: Pain Management consultation."
              : quiz === "metabolic"
                ? "Recommended start: Lifestyle Wellness consultation."
                : quiz === "breathing"
                  ? "Recommended start: Respiratory and immunity review."
                  : "Recommended start: Preventive Healthcare visit."}
          </p>
          <Link className="button button-primary" href="/#appointment">
            Book Appointment
          </Link>
        </article>
      </div>
    </section>
  );
}
