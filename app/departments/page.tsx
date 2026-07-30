import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { CmsIcon } from "@/components/CmsIcon";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Departments",
  description: "Ayurveda, Naturopathy, Electro Homeopathy, Pain Management, Lifestyle Disorders, and Family Health departments."
};

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const { departments, homepage } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Departments</span>
          <h1>{homepage.departmentsTitle}</h1>
          <p className="lead">{homepage.departmentsText}</p>
        </div>
      </section>

      <Section title="Departments">
        <div className="grid grid-3">
          {departments.map((department) => (
            <article className="card" key={department.name}>
              <span className="card-icon">
                <CmsIcon iconKey={department.iconKey} />
              </span>
              <h3>{department.name}</h3>
              <p>{department.summary}</p>
              <Link className="button button-quiet" href="/#appointment">
                <CalendarCheck size={18} />
                Book Appointment
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
