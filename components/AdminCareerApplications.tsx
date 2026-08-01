"use client";

import { useMemo, useState } from "react";
import { Download, Eye, FileDown, Trash2 } from "lucide-react";
import { careerStatusValues, type CareerApplicationRecord, type CareerStatus } from "@/lib/career-shared";

type AdminCareerApplicationsProps = {
  applications: CareerApplicationRecord[];
};

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function AdminCareerApplications({ applications: initialApplications }: AdminCareerApplicationsProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [selected, setSelected] = useState<CareerApplicationRecord | null>(initialApplications[0] ?? null);
  const [message, setMessage] = useState("Review, shortlist, interview, select, reject, export, and download applications.");

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = applications.filter((application) => {
      const matchesStatus = status === "All" || application.status === status;
      const haystack = `${application.applicationId} ${application.fullName} ${application.email} ${application.mobile} ${application.position}`.toLowerCase();
      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
    });

    return rows.sort((a, b) => {
      if (sort === "Name") return a.fullName.localeCompare(b.fullName);
      if (sort === "Position") return a.position.localeCompare(b.position);
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [applications, query, sort, status]);

  async function updateStatus(application: CareerApplicationRecord, nextStatus: CareerStatus) {
    const response = await fetch(`/api/careers/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, note: `Status changed to ${nextStatus}` })
    });
    const result = (await response.json()) as { ok: boolean; application?: CareerApplicationRecord; message?: string };
    if (!response.ok || !result.application) {
      setMessage(result.message ?? "Could not update application.");
      return;
    }
    setApplications((current) => current.map((item) => (item.id === result.application?.id ? result.application : item)));
    setSelected(result.application);
    setMessage(`Application moved to ${result.application.status}.`);
  }

  async function deleteApplication(application: CareerApplicationRecord) {
    const response = await fetch(`/api/careers/${application.id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Could not delete application.");
      return;
    }
    setApplications((current) => current.filter((item) => item.id !== application.id));
    setSelected(null);
    setMessage("Application deleted.");
  }

  function exportCsv() {
    const headers = ["Application ID", "Name", "Email", "Mobile", "Position", "Submitted", "Status", "City", "State"];
    const rows = filteredApplications.map((application) => [
      application.applicationId,
      application.fullName,
      application.email,
      application.mobile,
      application.position,
      application.submittedAt,
      application.status,
      application.city,
      application.state
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "career-applications.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="career-admin">
      <p className="success-note">{message}</p>
      <div className="filter-bar">
        <label>
          Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, mobile, position, application ID" />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            {careerStatusValues.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>Newest</option>
            <option>Name</option>
            <option>Position</option>
          </select>
        </label>
        <button className="button button-quiet" type="button" onClick={exportCsv}>
          <FileDown size={18} />
          Export CSV
        </button>
      </div>

      <div className="career-admin-layout">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <strong>{application.fullName}</strong>
                    <br />
                    {application.mobile}
                    <br />
                    {application.applicationId}
                  </td>
                  <td>{application.position}</td>
                  <td>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(application.submittedAt))}</td>
                  <td>
                    <select value={application.status} onChange={(event) => void updateStatus(application, event.target.value as CareerStatus)}>
                      {careerStatusValues.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-button" type="button" onClick={() => setSelected(application)} aria-label="View application">
                        <Eye size={17} />
                      </button>
                      <a className="icon-button" href={`/api/careers/${application.id}/files/resume`} aria-label="Download resume">
                        <Download size={17} />
                      </a>
                      <button className="icon-button" type="button" onClick={() => void deleteApplication(application)} aria-label="Delete application">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="career-detail-card">
          {selected ? (
            <>
              <span className="status">{selected.status}</span>
              <h3>{selected.fullName}</h3>
              <p>{selected.position} | {selected.qualification}</p>
              <div className="detail-list">
                <p><strong>Application ID</strong><span>{selected.applicationId}</span></p>
                <p><strong>Email</strong><span>{selected.email}</span></p>
                <p><strong>Mobile</strong><span>{selected.mobile}</span></p>
                <p><strong>Experience</strong><span>{selected.experience}</span></p>
                <p><strong>Expected Salary</strong><span>{selected.expectedSalary || "Not provided"}</span></p>
                <p><strong>Address</strong><span>{selected.address}, {selected.city}, {selected.state} - {selected.pincode}</span></p>
              </div>
              {selected.resume.mimeType === "application/pdf" ? (
                <iframe className="resume-preview" src={`/api/careers/${selected.id}/files/resume`} title="Resume preview" />
              ) : (
                <div className="resume-preview-placeholder">Resume preview is available after download for DOC/DOCX files.</div>
              )}
              <div className="hero-actions">
                <a className="button button-primary" href={`/api/careers/${selected.id}/files/resume`}>
                  <Download size={18} />
                  Download Resume
                </a>
                {careerStatusValues.map((item) => (
                  <button className="button button-quiet" type="button" key={item} onClick={() => void updateStatus(selected, item)}>
                    {item}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>Select an application to view details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
