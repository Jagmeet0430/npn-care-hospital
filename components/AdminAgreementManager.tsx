"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, FileText, MessageCircle, Printer, Search, Send, XCircle } from "lucide-react";
import type { AgreementRecord } from "@/lib/agreements";
import { agreementStatusValues, type AgreementStatus } from "@/lib/agreement-shared";

type AdminAgreementManagerProps = {
  agreements: AgreementRecord[];
  doctors: Array<{ name: string }>;
  departments: Array<{ name: string }>;
};

export function AdminAgreementManager({ agreements: initialAgreements, doctors, departments }: AdminAgreementManagerProps) {
  const [agreements, setAgreements] = useState(initialAgreements);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [doctor, setDoctor] = useState("All");
  const [department, setDepartment] = useState("");
  const [note, setNote] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agreements.filter((agreement) => {
      const matchesQuery =
        !q ||
        [
          agreement.agreementNo,
          agreement.patient.fullName,
          agreement.patient.mobile,
          agreement.medical.disease,
          agreement.treatment.assignedDoctor
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesStatus = status === "All" || agreement.status === status;
      const matchesDoctor = doctor === "All" || agreement.treatment.assignedDoctor === doctor;
      return matchesQuery && matchesStatus && matchesDoctor;
    });
  }, [agreements, doctor, query, status]);

  const counts = {
    total: agreements.length,
    pending: agreements.filter((item) => item.status === "Submitted" || item.status === "Under Review").length,
    approved: agreements.filter((item) => item.status === "Approved").length,
    rejected: agreements.filter((item) => item.status === "Rejected").length,
    revision: agreements.filter((item) => item.status === "Need Revision").length,
    today: agreements.filter((item) => new Date(item.submittedAt).toDateString() === new Date().toDateString()).length
  };

  async function updateAgreement(id: string, nextStatus: AgreementStatus, assignedDoctor?: string) {
    const response = await fetch(`/api/agreements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        note,
        assignedDoctor,
        assignedDepartment: department,
        actor: "Admin"
      })
    });

    const result = (await response.json()) as { ok: boolean; agreement?: AgreementRecord };
    if (!response.ok) {
      window.alert(result.ok === false ? "Admin login expired. Please login again." : "Could not update agreement.");
      return;
    }

    if (result.agreement) {
      setAgreements((current) => current.map((agreement) => (agreement.id === result.agreement?.id ? result.agreement : agreement)));
      setNote("");
    }
  }

  return (
    <div className="agreement-admin">
      <div className="grid grid-6">
        {[
          ["Total Agreements", counts.total],
          ["Pending", counts.pending],
          ["Approved", counts.approved],
          ["Rejected", counts.rejected],
          ["Need Revision", counts.revision],
          ["Today's Agreements", counts.today]
        ].map(([label, value]) => (
          <article className="dashboard-card compact" key={label}>
            <span className="module-icon">
              <FileText size={21} />
            </span>
            <strong>{value}</strong>
            <p>{label}</p>
          </article>
        ))}
      </div>

      <div className="filter-bar">
        <label>
          <span className="eyebrow">
            <Search size={17} />
            Search
          </span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Agreement number, patient, disease, mobile" />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            {agreementStatusValues.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Doctor
          <select value={doctor} onChange={(event) => setDoctor(event.target.value)}>
            <option>All</option>
            {doctors.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          Assign Department
          <select value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="">Select</option>
            {departments.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="admin-note">
        Internal Notes / Patient Notification Message
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add review note, rejection reason, or requested changes" />
      </label>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Agreement ID</th>
              <th>Patient Name</th>
              <th>Mobile Number</th>
              <th>Disease</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((agreement) => (
              <tr key={agreement.id}>
                <td>
                  <Link className="card-link" href={`/admin/agreements/${agreement.agreementNo}`}>
                    {agreement.agreementNo}
                  </Link>
                </td>
                <td>{agreement.patient.fullName}</td>
                <td>{agreement.patient.mobile}</td>
                <td>{agreement.medical.disease}</td>
                <td>
                  <select
                    value={agreement.treatment.assignedDoctor}
                    onChange={(event) => void updateAgreement(agreement.id, agreement.status, event.target.value)}
                  >
                    {doctors.map((item) => (
                      <option key={item.name}>{item.name}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(agreement.submittedAt).toLocaleDateString("en-IN")}</td>
                <td>
                  <span className="status">{agreement.status}</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="icon-button"
                      disabled={agreement.status === "Approved"}
                      type="button"
                      title="Under Review"
                      onClick={() => void updateAgreement(agreement.id, "Under Review")}
                    >
                      <Search size={17} />
                    </button>
                    <button
                      className="icon-button"
                      disabled={agreement.status === "Approved"}
                      type="button"
                      title="Approve"
                      onClick={() => void updateAgreement(agreement.id, "Approved")}
                    >
                      <CheckCircle2 size={17} />
                    </button>
                    <button
                      className="icon-button"
                      disabled={agreement.status === "Approved"}
                      type="button"
                      title="Reject"
                      onClick={() => void updateAgreement(agreement.id, "Rejected")}
                    >
                      <XCircle size={17} />
                    </button>
                    <button
                      className="icon-button"
                      disabled={agreement.status === "Approved"}
                      type="button"
                      title="Request changes"
                      onClick={() => void updateAgreement(agreement.id, "Need Revision")}
                    >
                      <Send size={17} />
                    </button>
                    <button className="icon-button" type="button" title="Download PDF">
                      <Download size={17} />
                    </button>
                    <button className="icon-button" type="button" title="Print">
                      <Printer size={17} />
                    </button>
                    <a className="icon-button" title="WhatsApp" href={`https://wa.me/${agreement.patient.mobile.replace(/\D/g, "")}`}>
                      <MessageCircle size={17} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
