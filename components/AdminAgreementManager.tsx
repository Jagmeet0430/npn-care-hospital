"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileDown,
  FileText,
  Filter,
  History,
  MessageSquareText,
  PenLine,
  Printer,
  RefreshCcw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  XCircle
} from "lucide-react";
import type { AgreementRecord } from "@/lib/agreements";
import { agreementStatusValues, type AgreementStatus } from "@/lib/agreement-shared";

type AdminAgreementManagerProps = {
  agreements: AgreementRecord[];
  doctors: Array<{ name: string; specialization?: string }>;
  departments: Array<{ name: string }>;
};

type SortMode = "newest" | "oldest" | "patient";
type DrawerMode = "view" | "notes" | null;

const statusOrder: AgreementStatus[] = ["Submitted", "Under Review", "Doctor Review", "Need Revision", "Approved", "Rejected", "Expired"];

const statusMeta: Record<AgreementStatus, { label: string; className: string; next: AgreementStatus }> = {
  Submitted: { label: "Pending", className: "pending", next: "Under Review" },
  "Under Review": { label: "Under Review", className: "review", next: "Doctor Review" },
  "Doctor Review": { label: "Doctor Review", className: "doctor", next: "Need Revision" },
  Approved: { label: "Approved", className: "approved", next: "Approved" },
  Rejected: { label: "Rejected", className: "rejected", next: "Submitted" },
  "Need Revision": { label: "Need Revision", className: "revision", next: "Under Review" },
  Expired: { label: "Expired", className: "expired", next: "Submitted" }
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "P";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function diseaseDepartment(agreement: AgreementRecord, departments: Array<{ name: string }>) {
  if (agreement.assignedDepartment) return agreement.assignedDepartment;
  const disease = agreement.medical.disease.toLowerCase();
  return departments.find((department) => disease.includes(department.name.toLowerCase()))?.name ?? agreement.treatment.recommendedTherapy;
}

export function AdminAgreementManager({ agreements: initialAgreements, doctors, departments }: AdminAgreementManagerProps) {
  const [agreements, setAgreements] = useState(initialAgreements);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<AgreementRecord | null>(initialAgreements[0] ?? null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(initialAgreements[0] ? "view" : null);
  const [toast, setToast] = useState("Secure agreement dashboard ready.");
  const [clock, setClock] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [reviewNote, setReviewNote] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    doctor: "All",
    department: "All",
    disease: "",
    dateFrom: "",
    dateTo: "",
    createdBy: "All",
    reviewer: "All",
    type: "All",
    sort: "newest" as SortMode
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const counts = useMemo(() => {
    const today = todayIso();
    return {
      total: agreements.length,
      pending: agreements.filter((item) => item.status === "Submitted" || item.status === "Under Review" || item.status === "Doctor Review").length,
      approved: agreements.filter((item) => item.status === "Approved").length,
      rejected: agreements.filter((item) => item.status === "Rejected").length,
      revision: agreements.filter((item) => item.status === "Need Revision").length,
      today: agreements.filter((item) => item.submittedAt.slice(0, 10) === today).length
    };
  }, [agreements]);

  const filtered = useMemo(() => {
    return agreements
      .filter((agreement) => {
        const combined = [
          agreement.agreementNo,
          agreement.patient.fullName,
          agreement.patient.mobile,
          agreement.patient.email,
          agreement.patient.city,
          agreement.medical.disease,
          agreement.treatment.assignedDoctor,
          agreement.treatment.recommendedTherapy,
          agreement.assignedDepartment
        ]
          .join(" ")
          .toLowerCase();
        const submittedTime = new Date(agreement.submittedAt).getTime();
        const fromMatch = !filters.dateFrom || submittedTime >= new Date(filters.dateFrom).getTime();
        const toMatch = !filters.dateTo || submittedTime <= new Date(`${filters.dateTo}T23:59:59`).getTime();
        const department = diseaseDepartment(agreement, departments);

        return (
          (!debouncedQuery || combined.includes(debouncedQuery)) &&
          (filters.status === "All" || agreement.status === filters.status) &&
          (filters.doctor === "All" || agreement.treatment.assignedDoctor === filters.doctor) &&
          (filters.department === "All" || department === filters.department) &&
          (!filters.disease || agreement.medical.disease.toLowerCase().includes(filters.disease.toLowerCase())) &&
          fromMatch &&
          toMatch
        );
      })
      .sort((a, b) => {
        if (filters.sort === "patient") return a.patient.fullName.localeCompare(b.patient.fullName);
        if (filters.sort === "oldest") return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
  }, [agreements, debouncedQuery, departments, filters]);

  const activity = useMemo(() => {
    return agreements
      .flatMap((agreement) =>
        agreement.auditLog.slice(0, 2).map((item) => ({
          id: `${agreement.id}-${item.at}`,
          title: `${agreement.agreementNo} ${item.action}`,
          detail: item.note,
          at: item.at
        }))
      )
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5);
  }, [agreements]);

  const selectedSet = new Set(selectedIds);
  const selectedAgreements = agreements.filter((agreement) => selectedSet.has(agreement.id));

  async function updateAgreement(id: string, nextStatus: AgreementStatus, assignedDoctor?: string, assignedDepartment?: string) {
    const response = await fetch(`/api/agreements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        note: reviewNote,
        assignedDoctor,
        assignedDepartment,
        actor: "Admin"
      })
    });

    const result = (await response.json()) as { ok: boolean; agreement?: AgreementRecord; message?: string };
    if (!response.ok || !result.agreement) {
      setToast(result.message ?? "Could not update agreement. Please login again.");
      return;
    }

    const updatedAgreement = result.agreement;
    setAgreements((current) => current.map((agreement) => (agreement.id === updatedAgreement.id ? updatedAgreement : agreement)));
    setSelected((current) => (current?.id === updatedAgreement.id ? updatedAgreement : current));
    setReviewNote("");
    setToast(`${updatedAgreement.agreementNo} moved to ${updatedAgreement.status}.`);
  }

  async function deleteAgreement(agreement: AgreementRecord) {
    if (!window.confirm(`Soft delete agreement ${agreement.agreementNo}?`)) return;

    const response = await fetch(`/api/agreements/${agreement.id}`, { method: "DELETE" });
    if (!response.ok) {
      setToast("Could not delete agreement.");
      return;
    }

    setAgreements((current) => current.filter((item) => item.id !== agreement.id));
    setSelectedIds((current) => current.filter((id) => id !== agreement.id));
    setSelected(null);
    setDrawerMode(null);
    setToast(`${agreement.agreementNo} deleted from active queue.`);
  }

  async function bulkStatus(status: AgreementStatus) {
    await Promise.all(selectedAgreements.map((agreement) => updateAgreement(agreement.id, status)));
    setSelectedIds([]);
    setToast(`Bulk workflow completed for ${selectedAgreements.length} agreements.`);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function exportCsv() {
    const rows = filtered.map((agreement) => [
      agreement.agreementNo,
      agreement.patient.fullName,
      agreement.patient.mobile,
      agreement.patient.email ?? "",
      agreement.medical.disease,
      diseaseDepartment(agreement, departments),
      agreement.treatment.assignedDoctor,
      agreement.status,
      agreement.submittedAt
    ]);
    const csv = [["Agreement ID", "Patient", "Mobile", "Email", "Disease", "Department", "Doctor", "Status", "Submitted"], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `npn-agreements-${todayIso()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Agreement CSV exported.");
  }

  function openDrawer(agreement: AgreementRecord, mode: DrawerMode = "view") {
    setSelected(agreement);
    setDrawerMode(mode);
  }

  function clearFilters() {
    setQuery("");
    setFilters({
      status: "All",
      doctor: "All",
      department: "All",
      disease: "",
      dateFrom: "",
      dateTo: "",
      createdBy: "All",
      reviewer: "All",
      type: "All",
      sort: "newest"
    });
    setToast("Filters cleared.");
  }

  return (
    <section className="agreement-erp">
      <div className="agreement-erp-header">
        <div>
          <div className="agreement-breadcrumb">Dashboard / Agreements</div>
          <h2>Digital Agreement Management</h2>
          <p>Review, approve, reject, print, and manage patient agreements from one secure dashboard.</p>
        </div>
        <div className="agreement-header-tools">
          <span><CalendarDays size={16} /> {formatDate(clock.toISOString())}</span>
          <span><Clock3 size={16} /> {clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          <button type="button" onClick={() => setShowNotifications((value) => !value)} title="Notifications">
            <Bell size={18} />
            {counts.pending > 0 ? <b>{counts.pending}</b> : null}
          </button>
          <span className="agreement-profile"><UserRound size={16} /> Admin</span>
        </div>
      </div>

      {showNotifications ? (
        <aside className="agreement-notifications">
          <strong>Notification Center</strong>
          <p>{counts.pending} agreements need review.</p>
          <p>{counts.revision} revision requests are open.</p>
          <p>{counts.today} agreements submitted today.</p>
        </aside>
      ) : null}

      <div className="agreement-stats-grid">
        {[
          { label: "Total Agreements", value: counts.total, detail: "All active digital records", change: "+18%", icon: FileText },
          { label: "Pending Review", value: counts.pending, detail: "Needs admin or doctor action", change: "+9%", icon: Clock3 },
          { label: "Approved", value: counts.approved, detail: "Locked and immutable", change: "+12%", icon: CheckCircle2 },
          { label: "Rejected", value: counts.rejected, detail: "Closed after review", change: "-3%", icon: XCircle },
          { label: "Need Revision", value: counts.revision, detail: "Returned to patient", change: "+4%", icon: Send },
          { label: "Today's Agreements", value: counts.today, detail: "Submitted in current day", change: "live", icon: Activity }
        ].map((card, index) => {
          const Icon = card.icon;
          const progress = Math.min(100, Math.max(12, counts.total ? Math.round((card.value / counts.total) * 100) : 12));
          return (
            <article className="agreement-stat-card" key={card.label} style={{ animationDelay: `${index * 45}ms` }}>
              <div>
                <span><Icon size={20} /></span>
                <small>{card.change}</small>
              </div>
              <strong>{card.value}</strong>
              <p>{card.label}</p>
              <em>{card.detail}</em>
              <i><b style={{ width: `${progress}%` }} /></i>
            </article>
          );
        })}
      </div>

      <div className="agreement-action-bar">
        <Link href="/agreement" title="Create Agreement"><FileCheck2 size={17} /> Create Agreement</Link>
        <button type="button" title="Review Queue" onClick={() => setFilters((current) => ({ ...current, status: "Submitted" }))}><ClipboardCheck size={17} /> Review Queue</button>
        <button type="button" title="Print" onClick={() => window.print()}><Printer size={17} /> Print</button>
        <button type="button" title="Export Excel" onClick={exportCsv}><Download size={17} /> Export Excel</button>
        <button type="button" title="Download PDF" onClick={() => window.print()}><FileDown size={17} /> Download PDF</button>
        <button type="button" title="Refresh" onClick={() => window.location.reload()}><RefreshCcw size={17} /> Refresh</button>
      </div>

      <div className="agreement-workspace">
        <main>
          <div className="agreement-search-card">
            <label>
              <Search size={19} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search agreement number, patient, mobile, disease, doctor, city, email"
              />
            </label>
            <button type="button" onClick={() => setShowFilters((value) => !value)}>
              <Filter size={17} /> Filters
            </button>
          </div>

          {showFilters ? (
            <div className="agreement-filter-panel">
              <label>Status<select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option>All</option>{agreementStatusValues.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Doctor<select value={filters.doctor} onChange={(event) => setFilters((current) => ({ ...current, doctor: event.target.value }))}><option>All</option>{doctors.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
              <label>Department<select value={filters.department} onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}><option>All</option>{departments.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
              <label>Disease<input value={filters.disease} onChange={(event) => setFilters((current) => ({ ...current, disease: event.target.value }))} placeholder="Joint pain, diabetes..." /></label>
              <label>Date From<input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
              <label>Date To<input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
              <label>Created By<select value={filters.createdBy} onChange={(event) => setFilters((current) => ({ ...current, createdBy: event.target.value }))}><option>All</option><option>Patient</option><option>Admin</option></select></label>
              <label>Reviewer<select value={filters.reviewer} onChange={(event) => setFilters((current) => ({ ...current, reviewer: event.target.value }))}><option>All</option><option>Admin</option><option>Doctor</option></select></label>
              <label>Type<select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}><option>All</option><option>Digital</option><option>Printed</option></select></label>
              <label>Sort<select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value as SortMode }))}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="patient">Patient A-Z</option></select></label>
              <button type="button" onClick={clearFilters}>Clear Filters</button>
              <button type="button" onClick={() => setToast("Filters applied.")}>Apply Filters</button>
            </div>
          ) : null}

          {selectedIds.length ? (
            <div className="agreement-bulkbar">
              <strong>{selectedIds.length} selected</strong>
              <button type="button" onClick={() => void bulkStatus("Approved")}>Approve Selected</button>
              <button type="button" onClick={() => void bulkStatus("Rejected")}>Reject Selected</button>
              <button type="button" onClick={exportCsv}>Export</button>
              <button type="button" onClick={() => window.print()}>Print</button>
              <button type="button" onClick={() => setSelectedIds([])}>Clear</button>
            </div>
          ) : null}

          <div className="agreement-table-card">
            {filtered.length ? (
              <table className="agreement-table">
                <thead>
                  <tr>
                    <th><input aria-label="Select all agreements" type="checkbox" checked={filtered.length > 0 && filtered.every((item) => selectedIds.includes(item.id))} onChange={(event) => setSelectedIds(event.target.checked ? filtered.map((item) => item.id) : [])} /></th>
                    <th>Agreement ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Disease</th>
                    <th>Department</th>
                    <th>Submission Date</th>
                    <th>Current Status</th>
                    <th>Assigned Reviewer</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((agreement) => {
                    const meta = statusMeta[agreement.status];
                    const department = diseaseDepartment(agreement, departments);
                    const lastUpdated = agreement.auditLog[0]?.at ?? agreement.submittedAt;
                    return (
                      <tr key={agreement.id}>
                        <td><input aria-label={`Select ${agreement.agreementNo}`} type="checkbox" checked={selectedIds.includes(agreement.id)} onChange={() => toggleSelected(agreement.id)} /></td>
                        <td><button className="agreement-id-button" type="button" onClick={() => openDrawer(agreement)}>{agreement.agreementNo}<ChevronRight size={14} /></button></td>
                        <td>
                          <button className="agreement-patient-cell" type="button" onClick={() => openDrawer(agreement)}>
                            <span>{initials(agreement.patient.fullName)}</span>
                            <span><strong>{agreement.patient.fullName}</strong><small>{agreement.patient.age} / {agreement.patient.gender} • {agreement.patient.mobile}</small><small>{agreement.patient.email || "No email"}</small></span>
                          </button>
                        </td>
                        <td>
                          <div className="agreement-doctor-cell">
                            <span>{initials(agreement.treatment.assignedDoctor)}</span>
                            <label>
                              <select value={agreement.treatment.assignedDoctor} disabled={agreement.status === "Approved"} onChange={(event) => void updateAgreement(agreement.id, agreement.status, event.target.value, agreement.assignedDepartment)}>
                                {doctors.map((item) => <option key={item.name}>{item.name}</option>)}
                              </select>
                              <small>{doctors.find((item) => item.name === agreement.treatment.assignedDoctor)?.specialization ?? "Available"}</small>
                            </label>
                          </div>
                        </td>
                        <td>{agreement.medical.disease}</td>
                        <td>
                          <select value={department} disabled={agreement.status === "Approved"} onChange={(event) => void updateAgreement(agreement.id, agreement.status, agreement.treatment.assignedDoctor, event.target.value)}>
                            {[department, ...departments.map((item) => item.name)].filter((item, index, array) => item && array.indexOf(item) === index).map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </td>
                        <td><strong>{formatDate(agreement.submittedAt)}</strong><small>{formatTime(agreement.submittedAt)}</small></td>
                        <td><button className={`agreement-status ${meta.className}`} type="button" disabled={agreement.status === "Approved"} onClick={() => void updateAgreement(agreement.id, meta.next)}>{meta.label}</button></td>
                        <td>Admin Review</td>
                        <td>{formatDate(lastUpdated)}</td>
                        <td>
                          <div className="agreement-row-actions">
                            <button type="button" title="View" onClick={() => openDrawer(agreement)}><Eye size={16} /></button>
                            <button type="button" title="Edit notes" disabled={agreement.status === "Approved"} onClick={() => openDrawer(agreement, "notes")}><PenLine size={16} /></button>
                            <button type="button" title="Approve" disabled={agreement.status === "Approved"} onClick={() => void updateAgreement(agreement.id, "Approved")}><CheckCircle2 size={16} /></button>
                            <button type="button" title="Reject" disabled={agreement.status === "Approved"} onClick={() => void updateAgreement(agreement.id, "Rejected")}><XCircle size={16} /></button>
                            <button type="button" title="Print" onClick={() => window.print()}><Printer size={16} /></button>
                            <button type="button" title="Download PDF" onClick={() => window.print()}><FileDown size={16} /></button>
                            <a title="Share" href={`https://wa.me/${agreement.patient.mobile.replace(/\D/g, "")}`}><Share2 size={16} /></a>
                            <button type="button" title="Delete" onClick={() => void deleteAgreement(agreement)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="agreement-empty">
                <FileText size={38} />
                <h3>No Agreements Found</h3>
                <p>No records match the current filters. Create a new agreement or reset the filters.</p>
                <div>
                  <Link href="/agreement">Create Agreement</Link>
                  <button type="button" onClick={clearFilters}>Reset Filters</button>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="agreement-activity-panel">
          <strong><History size={18} /> Recent Activity</strong>
          {activity.length ? activity.map((item) => (
            <article key={item.id}>
              <span />
              <div>
                <b>{item.title}</b>
                <p>{item.detail}</p>
                <small>{formatDate(item.at)} • {formatTime(item.at)}</small>
              </div>
            </article>
          )) : <p>No recent activity yet.</p>}
        </aside>
      </div>

      {drawerMode && selected ? (
        <div className="agreement-drawer-backdrop" role="presentation" onClick={() => setDrawerMode(null)}>
          <aside className="agreement-drawer" role="dialog" aria-modal="true" aria-label="Agreement preview" onClick={(event) => event.stopPropagation()}>
            <div className="agreement-drawer-head">
              <div>
                <span>{selected.agreementNo}</span>
                <h3>{drawerMode === "notes" ? "Review Notes" : "Agreement Preview"}</h3>
                <p>{selected.patient.fullName} • {selected.medical.disease}</p>
              </div>
              <button type="button" onClick={() => setDrawerMode(null)}><X size={18} /></button>
            </div>

            <div className="agreement-drawer-actions">
              <button type="button" disabled={selected.status === "Approved"} onClick={() => void updateAgreement(selected.id, "Approved")}><CheckCircle2 size={16} /> Approve</button>
              <button type="button" disabled={selected.status === "Approved"} onClick={() => void updateAgreement(selected.id, "Rejected")}><XCircle size={16} /> Reject</button>
              <button type="button" disabled={selected.status === "Approved"} onClick={() => void updateAgreement(selected.id, "Need Revision")}><Send size={16} /> Request Revision</button>
              <button type="button" onClick={() => window.print()}><Printer size={16} /> Print</button>
              <button type="button" onClick={() => window.print()}><Download size={16} /> PDF</button>
            </div>

            <div className="agreement-preview-document">
              <div className="agreement-print-sheet">
                <header>
                  <p>Reg. No.: U86903UP2023PTC178984</p>
                  <h4>N.P.N. CARE HOSPITAL INDIA PVT. LTD.</h4>
                  <strong>डिजिटल मरीज सहमति एवं उपचार अनुबंध</strong>
                </header>
                <section>
                  <b>Agreement ID:</b> {selected.agreementNo}<br />
                  <b>Patient:</b> {selected.patient.fullName}, {selected.patient.age} years, {selected.patient.gender}<br />
                  <b>Guardian:</b> {selected.patient.guardianName}<br />
                  <b>Mobile:</b> {selected.patient.mobile} | <b>Email:</b> {selected.patient.email || "N/A"}<br />
                  <b>Address:</b> {selected.patient.address}, {selected.patient.city}, {selected.patient.state} - {selected.patient.pinCode}
                </section>
                <section>
                  <h5>Medical Details</h5>
                  <p><b>Disease:</b> {selected.medical.disease}</p>
                  <p><b>Symptoms:</b> {selected.medical.symptoms}</p>
                  <p><b>Duration:</b> {selected.medical.duration}</p>
                  <p><b>Previous Treatment:</b> {selected.medical.previousTreatment}</p>
                  <p><b>Current Medicines:</b> {selected.medical.currentMedicines}</p>
                  <p><b>Allergies:</b> {selected.medical.allergies}</p>
                </section>
                <section>
                  <h5>घोषणा</h5>
                  <p>मैं घोषणा करता/करती हूं कि ऊपर दी गई जानकारी मेरी जानकारी के अनुसार सही है। अस्पताल द्वारा बताए गए उपचार, नियम, दस्तावेज और आवश्यक निर्देशों को समझकर मैं अपनी सहमति देता/देती हूं।</p>
                  <p>मैं जानता/जानती हूं कि किसी भी उपचार, लाभ, शुल्क, दस्तावेज, बीमा या योजना से संबंधित अंतिम पुष्टि अस्पताल काउंटर पर लिखित रूप में प्राप्त करना आवश्यक है।</p>
                </section>
                <footer>
                  <span>Patient Signature<br /><b>{selected.signature.typedName || selected.patient.fullName}</b></span>
                  <span>Doctor / Reviewer Signature<br /><b>{selected.treatment.assignedDoctor}</b></span>
                  <span>Hospital Stamp</span>
                </footer>
              </div>
            </div>

            <div className="agreement-detail-grid">
              <article>
                <strong><UserRound size={17} /> Patient Details</strong>
                <p>{selected.patient.fullName}</p>
                <small>{selected.patient.mobile} • {selected.patient.city}</small>
              </article>
              <article>
                <strong><FileText size={17} /> Uploaded Documents</strong>
                {selected.documents.map((document) => <p key={`${document.label}-${document.name}`}>{document.label}: {document.name}</p>)}
              </article>
              <article>
                <strong><ShieldCheck size={17} /> Doctor Assignment</strong>
                <p>{selected.treatment.assignedDoctor}</p>
                <small>{diseaseDepartment(selected, departments)}</small>
              </article>
              <article>
                <strong><MessageSquareText size={17} /> Review Notes</strong>
                <textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Internal note, patient message, doctor message, revision reason" />
              </article>
            </div>

            <div className="agreement-timeline">
              <strong>Workflow Timeline</strong>
              {[
                { action: "Agreement Submitted", at: selected.submittedAt, user: "Patient" },
                { action: "Documents Uploaded", at: selected.submittedAt, user: "Patient" },
                ...selected.auditLog.map((item) => ({ action: item.action, at: item.at, user: item.actor }))
              ].slice(0, 9).map((item, index) => (
                <article key={`${item.action}-${item.at}-${index}`}>
                  <span />
                  <div>
                    <b>{item.action}</b>
                    <p>{formatDate(item.at)} • {formatTime(item.at)} • {item.user}</p>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      <div className="agreement-toast">{toast}</div>
    </section>
  );
}
