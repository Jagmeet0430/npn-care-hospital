"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  Eye,
  FileDown,
  Filter,
  MessageCircle,
  Phone,
  Printer,
  Search,
  Stethoscope,
  Trash2,
  UserPlus,
  UsersRound,
  X
} from "lucide-react";
import { appointmentStatusValues, type AppointmentStatus } from "@/lib/appointment-shared";
import type { AppointmentRecord } from "@/lib/appointments";

type DoctorOption = {
  name: string;
  specialization?: string;
};

type AdminAppointmentManagerProps = {
  appointments: AppointmentRecord[];
  doctors: DoctorOption[];
};

type SortMode = "newest" | "oldest" | "alphabetical";
type PaymentStatus = "paid" | "pending" | "refunded";
type NewAppointmentField = keyof typeof emptyAppointmentForm;

const emptyAppointmentForm = {
  name: "",
  age: "35",
  gender: "Female",
  phone: "",
  email: "",
  treatment: "",
  doctor: "",
  date: "",
  time: "Morning"
};

const statusLabels: Record<AppointmentStatus, string> = {
  received: "Received",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  "follow-up": "Follow-up"
};

const nextStatus: Record<AppointmentStatus, AppointmentStatus> = {
  received: "pending",
  pending: "confirmed",
  confirmed: "completed",
  completed: "follow-up",
  "follow-up": "completed",
  cancelled: "received"
};

function paymentFor(row: AppointmentRecord): PaymentStatus {
  if (row.status === "cancelled") return "refunded";
  if (row.status === "confirmed" || row.status === "completed" || row.status === "follow-up") return "paid";
  return "pending";
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "P";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function thisMonthKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function AdminAppointmentManager({ appointments: initialAppointments, doctors }: AdminAppointmentManagerProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selected, setSelected] = useState<AppointmentRecord | null>(initialAppointments[0] ?? null);
  const [checked, setChecked] = useState<string[]>([]);
  const [drawerMode, setDrawerMode] = useState<"view" | "new" | null>(null);
  const [toast, setToast] = useState("Appointment ERP loaded.");
  const [clock, setClock] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [filters, setFilters] = useState({
    patient: "",
    phone: "",
    doctor: "All",
    department: "All",
    status: "All",
    date: "",
    time: "All",
    sort: "newest" as SortMode
  });
  const [newAppointment, setNewAppointment] = useState({
    ...emptyAppointmentForm,
    doctor: doctors[0]?.name ?? "",
    date: todayIso()
  });
  const [appointmentErrors, setAppointmentErrors] = useState<Partial<Record<NewAppointmentField, string>>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const departments = useMemo(() => Array.from(new Set(appointments.map((item) => item.treatment))).sort(), [appointments]);
  const today = todayIso();
  const currentMonth = thisMonthKey(today);

  const stats = useMemo(() => {
    const total = Math.max(appointments.length, 1);
    const count = (predicate: (row: AppointmentRecord) => boolean) => appointments.filter(predicate).length;
    return [
      { label: "Today's Appointments", value: count((row) => row.date === today), trend: "+12%", icon: CalendarDays },
      { label: "Upcoming", value: count((row) => row.date > today), trend: "+8%", icon: Clock3 },
      { label: "Pending Approval", value: count((row) => row.status === "pending" || row.status === "received"), trend: `${Math.round((count((row) => row.status === "pending" || row.status === "received") / total) * 100)}%`, icon: Bell },
      { label: "Confirmed", value: count((row) => row.status === "confirmed"), trend: "+6%", icon: CheckCircle2 },
      { label: "Completed", value: count((row) => row.status === "completed"), trend: "+4%", icon: Stethoscope },
      { label: "Cancelled", value: count((row) => row.status === "cancelled"), trend: "watch", icon: X }
    ];
  }, [appointments, today]);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((row) => {
        const patientMatch = row.name.toLowerCase().includes(filters.patient.toLowerCase());
        const phoneMatch = row.phone.includes(filters.phone);
        const doctorMatch = filters.doctor === "All" || row.doctor === filters.doctor;
        const departmentMatch = filters.department === "All" || row.treatment === filters.department;
        const statusMatch = filters.status === "All" || row.status === filters.status;
        const dateMatch = !filters.date || row.date === filters.date;
        const timeMatch = filters.time === "All" || row.time === filters.time;
        return patientMatch && phoneMatch && doctorMatch && departmentMatch && statusMatch && dateMatch && timeMatch;
      })
      .sort((a, b) => {
        if (filters.sort === "alphabetical") return a.name.localeCompare(b.name);
        if (filters.sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [appointments, filters]);

  const calendarDays = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));
    return days.map((day) => {
      const date = `${currentMonth}-${day}`;
      return {
        day,
        date,
        count: appointments.filter((row) => row.date === date).length
      };
    });
  }, [appointments, currentMonth]);

  async function updateAppointment(id: string, update: Partial<Pick<AppointmentRecord, "status" | "doctor" | "date" | "time">>) {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update)
    });

    const result = (await response.json()) as { ok: boolean; appointment?: AppointmentRecord; message?: string };
    if (!response.ok || !result.appointment) {
      setToast(result.message ?? "Could not update appointment. Please login again.");
      return;
    }

    const updatedAppointment = result.appointment;
    setAppointments((current) => current.map((appointment) => (appointment.id === updatedAppointment.id ? updatedAppointment : appointment)));
    setSelected((current) => (current?.id === updatedAppointment.id ? updatedAppointment : current));
    setToast("Appointment updated successfully.");
  }

  function updateNewAppointment(field: NewAppointmentField, value: string) {
    setNewAppointment((current) => ({ ...current, [field]: value }));
    setAppointmentErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validateNewAppointment() {
    const errors: Partial<Record<NewAppointmentField, string>> = {};
    const phoneDigits = newAppointment.phone.replace(/\D/g, "");
    const email = newAppointment.email.trim();

    if (newAppointment.name.trim().length < 2) errors.name = "Enter patient full name.";
    if (!Number.isFinite(Number(newAppointment.age)) || Number(newAppointment.age) < 1 || Number(newAppointment.age) > 120) errors.age = "Age must be 1 to 120.";
    if (phoneDigits.length < 10) errors.phone = "Enter a valid mobile number.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email or leave it blank.";
    if (newAppointment.treatment.trim().length < 2) errors.treatment = "Enter department or treatment.";
    if (!newAppointment.doctor) errors.doctor = "Select a doctor.";
    if (!newAppointment.date) errors.date = "Select appointment date.";
    if (!newAppointment.time) errors.time = "Select a time slot.";

    setAppointmentErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function createAppointment() {
    if (isCreating) return;
    if (!validateNewAppointment()) {
      setToast("Please correct the highlighted appointment fields.");
      return;
    }

    setIsCreating(true);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newAppointment,
        name: newAppointment.name.trim(),
        phone: newAppointment.phone.trim(),
        email: newAppointment.email.trim(),
        treatment: newAppointment.treatment.trim(),
        age: Number(newAppointment.age)
      })
    });

    const result = (await response.json()) as { ok: boolean; appointment?: AppointmentRecord; message?: string; errors?: Record<string, string[]> };
    setIsCreating(false);
    if (!response.ok || !result.appointment) {
      const apiErrors = result.errors ?? {};
      setAppointmentErrors({
        name: apiErrors.name?.[0],
        age: apiErrors.age?.[0],
        phone: apiErrors.phone?.[0],
        email: apiErrors.email?.[0],
        treatment: apiErrors.treatment?.[0],
        doctor: apiErrors.doctor?.[0],
        date: apiErrors.date?.[0],
        time: apiErrors.time?.[0]
      });
      setToast(result.message ?? "Could not create appointment. Check the highlighted fields.");
      return;
    }

    setAppointments((current) => [result.appointment as AppointmentRecord, ...current]);
    setSelected(result.appointment);
    setNewAppointment({ ...emptyAppointmentForm, doctor: doctors[0]?.name ?? "", date: todayIso() });
    setAppointmentErrors({});
    setDrawerMode("view");
    setToast("New appointment created.");
  }

  async function deleteAppointment(row: AppointmentRecord) {
    if (!window.confirm(`Delete appointment for ${row.name}?`)) return;
    const response = await fetch(`/api/appointments/${row.id}`, { method: "DELETE" });
    if (!response.ok) {
      setToast("Could not delete appointment.");
      return;
    }
    setAppointments((current) => current.filter((appointment) => appointment.id !== row.id));
    setChecked((current) => current.filter((id) => id !== row.id));
    setSelected(null);
    setDrawerMode(null);
    setToast("Appointment deleted.");
  }

  async function bulkStatus(status: AppointmentStatus) {
    await Promise.all(checked.map((id) => updateAppointment(id, { status })));
    setChecked([]);
    setToast(`Bulk action complete: ${statusLabels[status]}.`);
  }

  function exportCsv() {
    const rows = filteredAppointments.map((row) => [row.id, row.name, row.phone, row.email ?? "", row.treatment, row.doctor, row.date, row.time, row.status, paymentFor(row)]);
    const csv = [["Appointment ID", "Name", "Phone", "Email", "Department", "Doctor", "Date", "Time", "Status", "Payment"], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "appointments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("Export complete.");
  }

  function toggleChecked(id: string) {
    setChecked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <section className="erp-appointments">
      <div className="erp-topbar">
        <div>
          <span className="eyebrow">Hospital ERP</span>
          <h2>Appointment Management</h2>
          <p>Manage patient appointments, assign doctors, approve requests and track appointment status.</p>
        </div>
        <div className="erp-admin-tools">
          <span>{clock.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</span>
          <strong>{clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong>
          <button type="button" onClick={() => setShowNotifications((current) => !current)} aria-label="Notifications">
            <Bell size={18} />
            <em>{stats[2].value}</em>
          </button>
          <span className="erp-profile">Admin</span>
        </div>
      </div>

      {showNotifications ? (
        <div className="erp-notifications">
          {["Appointment Received", "Doctor Changed", "Reminder", "System Notification"].map((item, index) => (
            <article key={item}>
              <strong>{item}</strong>
              <span>{index === 0 ? `${stats[2].value} appointments require review` : "No critical issues"}</span>
            </article>
          ))}
        </div>
      ) : null}

      <div className="erp-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="erp-stat-card" key={stat.label}>
              <span><Icon size={20} /></span>
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
              <small>{stat.trend} trend</small>
            </article>
          );
        })}
      </div>

      <div className="erp-quick-actions">
        <button type="button" onClick={() => setDrawerMode("new")}><UserPlus size={18} /> New Appointment</button>
        <button type="button" onClick={() => setFilters((current) => ({ ...current, patient: "" }))}><Search size={18} /> Search Patient</button>
        <button type="button" onClick={exportCsv}><Download size={18} /> Export CSV</button>
        <button type="button" onClick={() => window.print()}><Printer size={18} /> Print</button>
        <button type="button" onClick={() => setFilters((current) => ({ ...current, date: today }))}><CalendarDays size={18} /> Calendar View</button>
        <button type="button" onClick={() => setFilters({ patient: "", phone: "", doctor: "All", department: "All", status: "All", date: "", time: "All", sort: "newest" })}><Filter size={18} /> Clear Filters</button>
      </div>

      <div className="erp-filters">
        <label><span>Search Patient</span><input value={filters.patient} onChange={(event) => setFilters({ ...filters, patient: event.target.value })} /></label>
        <label><span>Phone Number</span><input value={filters.phone} onChange={(event) => setFilters({ ...filters, phone: event.target.value })} /></label>
        <label><span>Doctor</span><select value={filters.doctor} onChange={(event) => setFilters({ ...filters, doctor: event.target.value })}><option>All</option>{doctors.map((doctor) => <option key={doctor.name}>{doctor.name}</option>)}</select></label>
        <label><span>Department</span><select value={filters.department} onChange={(event) => setFilters({ ...filters, department: event.target.value })}><option>All</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Status</span><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option>All</option>{appointmentStatusValues.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></label>
        <label><span>Date</span><input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} /></label>
        <label><span>Time Slot</span><select value={filters.time} onChange={(event) => setFilters({ ...filters, time: event.target.value })}><option>All</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
        <label><span>Sort By</span><select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as SortMode })}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="alphabetical">Alphabetical</option></select></label>
      </div>

      <div className="erp-calendar">
        {calendarDays.map((day) => (
          <button className={filters.date === day.date ? "active" : ""} type="button" key={day.date} onClick={() => setFilters({ ...filters, date: day.date })}>
            <strong>{day.day}</strong>
            <span>{day.count ? `${day.count} appt` : "free"}</span>
          </button>
        ))}
      </div>

      {checked.length ? (
        <div className="erp-bulkbar">
          <strong>{checked.length} selected</strong>
          <button type="button" onClick={() => void bulkStatus("confirmed")}>Approve</button>
          <button type="button" onClick={() => void bulkStatus("cancelled")}>Reject</button>
          <button type="button" onClick={() => window.print()}>Print</button>
          <button type="button" onClick={exportCsv}>Export</button>
        </div>
      ) : null}

      <div className="erp-table-card">
        {filteredAppointments.length ? (
          <table className="erp-table">
            <thead>
              <tr>
                <th><input aria-label="Select all appointments" type="checkbox" checked={checked.length === filteredAppointments.length} onChange={(event) => setChecked(event.target.checked ? filteredAppointments.map((row) => row.id) : [])} /></th>
                <th>Patient</th>
                <th>Appointment ID</th>
                <th>Department</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((row) => {
                const doctor = doctors.find((item) => item.name === row.doctor);
                const payment = paymentFor(row);
                return (
                  <tr key={row.id}>
                    <td><input aria-label={`Select ${row.name}`} type="checkbox" checked={checked.includes(row.id)} onChange={() => toggleChecked(row.id)} /></td>
                    <td>
                      <button className="erp-patient-cell" type="button" onClick={() => { setSelected(row); setDrawerMode("view"); }}>
                        <span>{initials(row.name)}</span>
                        <span>
                          <strong>{row.name}</strong>
                          <small>Age {row.age} • {row.gender}</small>
                          <small>Phone {row.phone}</small>
                          <small>{row.email || "No email"}</small>
                        </span>
                      </button>
                    </td>
                    <td><code>{row.id.slice(0, 8)}</code></td>
                    <td>{row.treatment}</td>
                    <td>
                      <label className="erp-doctor-cell">
                        <span>{initials(row.doctor)}</span>
                        <select value={row.doctor} onChange={(event) => void updateAppointment(row.id, { doctor: event.target.value })}>
                          {doctors.map((item) => <option key={item.name}>{item.name}</option>)}
                        </select>
                        <small>{doctor?.specialization ?? "Available • Next slot tomorrow"}</small>
                      </label>
                    </td>
                    <td><input type="date" value={row.date} onChange={(event) => void updateAppointment(row.id, { date: event.target.value })} /></td>
                    <td><select value={row.time} onChange={(event) => void updateAppointment(row.id, { time: event.target.value })}><option>Morning</option><option>Afternoon</option><option>Evening</option></select></td>
                    <td><button className={`erp-status ${row.status}`} type="button" onClick={() => void updateAppointment(row.id, { status: nextStatus[row.status] })}>{statusLabels[row.status]}</button></td>
                    <td><span className={`erp-payment ${payment}`}>{payment}</span></td>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>
                      <div className="erp-row-actions">
                        <button title="View" type="button" onClick={() => { setSelected(row); setDrawerMode("view"); }}><Eye size={16} /></button>
                        <button title="Edit" type="button" onClick={() => { setSelected(row); setDrawerMode("view"); }}><Edit3 size={16} /></button>
                        <button title="Print" type="button" onClick={() => window.print()}><Printer size={16} /></button>
                        <button title="Download" type="button" onClick={exportCsv}><FileDown size={16} /></button>
                        <a title="WhatsApp" href={`https://wa.me/${row.phone.replace(/\D/g, "")}`}><MessageCircle size={16} /></a>
                        <a title="Call" href={`tel:${row.phone}`}><Phone size={16} /></a>
                        <button title="Delete" type="button" onClick={() => void deleteAppointment(row)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="erp-empty">
            <UsersRound size={42} />
            <h3>No appointments available.</h3>
            <p>Create an appointment or clear filters to see the queue.</p>
            <button className="button button-primary" type="button" onClick={() => setDrawerMode("new")}>Create Appointment</button>
          </div>
        )}
      </div>

      <p className="erp-toast"><CheckCircle2 size={17} /> {toast}</p>

      {drawerMode ? (
        <div className="erp-drawer-backdrop" role="dialog" aria-modal="true" aria-label="Appointment details">
          <aside className="erp-drawer">
            <button className="icon-button" type="button" onClick={() => setDrawerMode(null)} aria-label="Close drawer"><X size={20} /></button>
            {drawerMode === "new" ? (
              <>
                <span className="eyebrow">New Appointment</span>
                <h2>Create Appointment</h2>
                <form className="erp-create-form" onSubmit={(event) => { event.preventDefault(); void createAppointment(); }}>
                  <label className={appointmentErrors.name ? "has-error" : ""}>
                    <span>Patient Name</span>
                    <input placeholder="Enter full name" value={newAppointment.name} onChange={(event) => updateNewAppointment("name", event.target.value)} />
                    {appointmentErrors.name ? <em>{appointmentErrors.name}</em> : null}
                  </label>
                  <label className={appointmentErrors.age ? "has-error" : ""}>
                    <span>Age</span>
                    <input inputMode="numeric" placeholder="35" value={newAppointment.age} onChange={(event) => updateNewAppointment("age", event.target.value)} />
                    {appointmentErrors.age ? <em>{appointmentErrors.age}</em> : null}
                  </label>
                  <label>
                    <span>Gender</span>
                    <select value={newAppointment.gender} onChange={(event) => updateNewAppointment("gender", event.target.value)}><option>Female</option><option>Male</option><option>Other</option></select>
                  </label>
                  <label className={appointmentErrors.phone ? "has-error" : ""}>
                    <span>Mobile Number</span>
                    <input inputMode="tel" placeholder="10 digit mobile number" value={newAppointment.phone} onChange={(event) => updateNewAppointment("phone", event.target.value)} />
                    {appointmentErrors.phone ? <em>{appointmentErrors.phone}</em> : null}
                  </label>
                  <label className={appointmentErrors.email ? "has-error" : ""}>
                    <span>Email Optional</span>
                    <input inputMode="email" placeholder="patient@example.com or leave blank" value={newAppointment.email} onChange={(event) => updateNewAppointment("email", event.target.value)} />
                    {appointmentErrors.email ? <em>{appointmentErrors.email}</em> : null}
                  </label>
                  <label className={appointmentErrors.treatment ? "has-error" : ""}>
                    <span>Department / Treatment</span>
                    <input placeholder="Joint Pain, Diabetes Care..." value={newAppointment.treatment} onChange={(event) => updateNewAppointment("treatment", event.target.value)} />
                    {appointmentErrors.treatment ? <em>{appointmentErrors.treatment}</em> : null}
                  </label>
                  <label className={appointmentErrors.doctor ? "has-error" : ""}>
                    <span>Doctor</span>
                    <select value={newAppointment.doctor} onChange={(event) => updateNewAppointment("doctor", event.target.value)}>{doctors.map((doctor) => <option key={doctor.name}>{doctor.name}</option>)}</select>
                    {appointmentErrors.doctor ? <em>{appointmentErrors.doctor}</em> : null}
                  </label>
                  <label className={appointmentErrors.date ? "has-error" : ""}>
                    <span>Appointment Date</span>
                    <input type="date" value={newAppointment.date} onChange={(event) => updateNewAppointment("date", event.target.value)} />
                    {appointmentErrors.date ? <em>{appointmentErrors.date}</em> : null}
                  </label>
                  <label className={appointmentErrors.time ? "has-error" : ""}>
                    <span>Time Slot</span>
                    <select value={newAppointment.time} onChange={(event) => updateNewAppointment("time", event.target.value)}><option>Morning</option><option>Afternoon</option><option>Evening</option></select>
                    {appointmentErrors.time ? <em>{appointmentErrors.time}</em> : null}
                  </label>
                  <button className="erp-submit-button" type="submit" disabled={isCreating}>{isCreating ? "Creating..." : "Create Appointment"}</button>
                </form>
              </>
            ) : selected ? (
              <>
                <span className="eyebrow">Appointment Details</span>
                <h2>{selected.name}</h2>
                <div className="erp-detail-grid">
                  <p><strong>Phone</strong>{selected.phone}</p>
                  <p><strong>Email</strong>{selected.email || "No email"}</p>
                  <p><strong>Medical History</strong>{selected.treatment} consultation requested.</p>
                  <p><strong>Previous Visits</strong>No previous visit connected.</p>
                  <p><strong>Uploaded Reports</strong>No report uploaded.</p>
                  <p><strong>Payment</strong>{paymentFor(selected)}</p>
                  <p><strong>Agreement</strong>Not linked yet.</p>
                  <p><strong>Doctor Notes</strong>Doctor notes can be added after consultation.</p>
                </div>
                <div className="erp-timeline">
                  {["Appointment Received", "Doctor Assigned", "Confirmed", "Patient Arrived", "Consultation", "Completed"].map((item, index) => (
                    <div key={item}><span>{index + 1}</span><strong>{item}</strong><ChevronRight size={16} /></div>
                  ))}
                </div>
                <div className="admin-blog-actions">
                  <button className="button button-primary" type="button" onClick={() => window.print()}><Printer size={18} /> Print</button>
                  <a className="button button-quiet" href={`tel:${selected.phone}`}><Phone size={18} /> Call</a>
                  <a className="button button-quiet" href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}><MessageCircle size={18} /> WhatsApp</a>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  );
}
