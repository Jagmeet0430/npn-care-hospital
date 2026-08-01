import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CalendarCheck, Download, FileHeart, PenLine, Printer, ReceiptText, UserRound } from "lucide-react";
import { getAgreements } from "@/lib/agreements";

export const metadata: Metadata = {
  title: "Patient Dashboard",
  description: "Patient dashboard for appointments, reports, prescriptions, invoices, and notifications."
};

const history = [
  { date: "28 Jul 2026", item: "Joint pain consultation", doctor: "Dr. Asha Mehta", status: "Completed" },
  { date: "05 Aug 2026", item: "Therapy follow-up", doctor: "Dr. Rohan Sharma", status: "Upcoming" },
  { date: "12 Aug 2026", item: "Nutrition review", doctor: "Care Team", status: "Scheduled" }
];

export const dynamic = "force-dynamic";

export default async function PatientPage() {
  const agreements = await getAgreements();

  return (
    <section className="dashboard-shell">
      <aside className="sidebar">
        <span className="brand">
          <span className="brand-mark">N</span>
          <span>
            <strong>Patient</strong>
            <small>Health dashboard</small>
          </span>
        </span>
        <nav aria-label="Patient navigation">
          {["Overview", "Agreements", "Appointments", "Medical Reports", "Prescriptions", "Profile", "Invoices", "Notifications"].map((item) => (
            <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-top">
          <div>
            <span className="eyebrow">Patient Dashboard</span>
            <h1>Your care, reports, and follow-ups in one place.</h1>
            <p className="lead">A simple, elderly-friendly dashboard for appointment history, prescriptions, reports, invoices, notifications, and profile details.</p>
          </div>
          <Link className="button button-primary" href="/agreement">
            <CalendarCheck size={18} />
            New Agreement
          </Link>
        </div>

        <div className="grid grid-4">
          {[
            { title: "Appointments", value: "03", icon: CalendarCheck },
            { title: "Agreements", value: String(agreements.length).padStart(2, "0"), icon: PenLine },
            { title: "Reports", value: "08", icon: FileHeart },
            { title: "Invoices", value: "04", icon: ReceiptText }
          ].map((item) => (
            <article className="dashboard-card" key={item.title}>
              <span className="module-icon">
                <item.icon size={22} />
              </span>
              <strong>{item.value}</strong>
              <p>{item.title}</p>
            </article>
          ))}
        </div>

        <section id="agreements" style={{ marginTop: 34 }}>
          <div className="section-heading">
            <span className="eyebrow">Agreement History</span>
            <h2>Digital agreements and review status</h2>
          </div>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Agreement ID</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th>Approval Date</th>
                  <th>Doctor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agreements.map((agreement) => (
                  <tr key={agreement.id}>
                    <td>{agreement.agreementNo}</td>
                    <td>
                      <span className="status">{agreement.status}</span>
                    </td>
                    <td>{new Date(agreement.submittedAt).toLocaleDateString("en-IN")}</td>
                    <td>{agreement.approvalDate ? new Date(agreement.approvalDate).toLocaleDateString("en-IN") : "Pending"}</td>
                    <td>{agreement.treatment.assignedDoctor}</td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-button" type="button" aria-label="Download agreement PDF">
                          <Download size={18} />
                        </button>
                        <button className="icon-button" type="button" aria-label="Print agreement">
                          <Printer size={18} />
                        </button>
                        {agreement.status !== "Approved" ? (
                          <Link className="icon-button" href="/agreement" aria-label="Edit agreement before approval">
                            <PenLine size={18} />
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: 34 }}>
          <div className="section-heading">
            <span className="eyebrow">Appointment History</span>
            <h2>Upcoming and previous visits</h2>
          </div>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Care Item</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.item}>
                    <td>{row.date}</td>
                    <td>{row.item}</td>
                    <td>{row.doctor}</td>
                    <td>
                      <span className="status">{row.status}</span>
                    </td>
                    <td>
                      <button className="icon-button" type="button" aria-label={`Download ${row.item}`}>
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: 34 }}>
          <div className="section-heading">
            <span className="eyebrow">Profile</span>
            <h2>Patient details</h2>
          </div>
          <div className="grid grid-3">
            <article className="card">
              <UserRound size={24} color="#0F172A" />
              <h3>Profile</h3>
              <p>Name, age, gender, phone, email, address, emergency contact, and preferred language.</p>
            </article>
            <article className="card">
              <FileHeart size={24} color="#0F172A" />
              <h3>Medical Reports</h3>
              <p>Upload and view lab reports, scans, prescriptions, discharge notes, and therapy summaries.</p>
            </article>
            <article className="card">
              <Bell size={24} color="#0F172A" />
              <h3>Notifications</h3>
              <p>Appointment reminders, report updates, payment alerts, and doctor follow-up notes.</p>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}
