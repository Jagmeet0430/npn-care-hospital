"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { appointmentStatusValues, type AppointmentStatus } from "@/lib/appointment-shared";
import type { AppointmentRecord } from "@/lib/appointments";

type AdminAppointmentManagerProps = {
  appointments: AppointmentRecord[];
  doctors: Array<{ name: string }>;
};

export function AdminAppointmentManager({ appointments: initialAppointments, doctors }: AdminAppointmentManagerProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [statusMessage, setStatusMessage] = useState("Admin can update appointment status, doctor, date, and time.");

  async function updateAppointment(id: string, update: Partial<Pick<AppointmentRecord, "status" | "doctor" | "date" | "time">>) {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update)
    });

    const result = (await response.json()) as { ok: boolean; appointment?: AppointmentRecord; message?: string };
    if (!response.ok || !result.appointment) {
      setStatusMessage(result.message ?? "Could not update appointment. Please login again.");
      return;
    }

    setAppointments((current) => current.map((appointment) => (appointment.id === result.appointment?.id ? result.appointment : appointment)));
    setStatusMessage("Appointment updated successfully.");
  }

  return (
    <div className="appointment-admin">
      <p className="success-note">
        <CheckCircle2 size={17} />
        {statusMessage}
      </p>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Treatment</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.name}</strong>
                  <br />
                  {row.phone}
                </td>
                <td>{row.treatment}</td>
                <td>
                  <select value={row.doctor} onChange={(event) => void updateAppointment(row.id, { doctor: event.target.value })}>
                    {doctors.map((doctor) => (
                      <option key={doctor.name}>{doctor.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input value={row.date} onChange={(event) => void updateAppointment(row.id, { date: event.target.value })} />
                </td>
                <td>
                  <input value={row.time} onChange={(event) => void updateAppointment(row.id, { time: event.target.value })} />
                </td>
                <td>
                  <select
                    value={row.status}
                    onChange={(event) => void updateAppointment(row.id, { status: event.target.value as AppointmentStatus })}
                  >
                    {appointmentStatusValues.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
