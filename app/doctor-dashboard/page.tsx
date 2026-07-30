import type { Metadata } from "next";
import { CalendarCheck, FileHeart, MessageCircle, Stethoscope, Users } from "lucide-react";
import { getAppointments } from "@/lib/appointments";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Doctor Dashboard",
  description: "Doctor dashboard for appointments, patient notes, treatment plans, and follow-up tasks."
};

export const dynamic = "force-dynamic";

export default async function DoctorDashboardPage() {
  const { doctors, treatments } = await getCmsContent();
  const appointments = await getAppointments();

  return (
    <section className="dashboard-shell">
      <aside className="sidebar">
        <span className="brand">
          <span className="brand-mark">N</span>
          <span>
            <strong>Doctor</strong>
            <small>Care workspace</small>
          </span>
        </span>
        <nav aria-label="Doctor navigation">
          {["Overview", "Today Appointments", "Patients", "Treatment Plans", "Follow-ups", "Messages"].map((item) => (
            <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-top">
          <div>
            <span className="eyebrow">Doctor Dashboard</span>
            <h1>Clinical follow-up without confusion.</h1>
            <p className="lead">Appointments, patient notes, care plans, and follow-up reminders are organized for the doctor team.</p>
          </div>
        </div>

        <div className="grid grid-4">
          {[
            { title: "Doctors", value: String(doctors.length), icon: Stethoscope },
            { title: "Appointments", value: String(appointments.length), icon: CalendarCheck },
            { title: "Treatments", value: String(treatments.length), icon: FileHeart },
            { title: "Messages", value: "12", icon: MessageCircle }
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

        <section className="admin-section" id="today-appointments">
          <div className="section-heading">
            <span className="eyebrow">Today Appointments</span>
            <h2>Patient queue</h2>
          </div>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Treatment</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 8).map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.name}</td>
                    <td>{appointment.treatment}</td>
                    <td>{appointment.doctor}</td>
                    <td>
                      <span className="status">{appointment.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section" id="patients">
          <div className="grid grid-3">
            {["Patient notes", "Treatment plans", "Recovery support"].map((item) => (
              <article className="card" key={item}>
                <Users size={22} color="#227a59" />
                <h3>{item}</h3>
                <p>Ready for secure login, prescription uploads, progress notes, and follow-up workflows.</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
