import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppointmentStatus } from "@/lib/appointment-shared";
import { decryptJson, encryptJson, isEncryptedPayload } from "@/lib/secure-json-store";

export type AppointmentRecord = {
  id: string;
  status: AppointmentStatus;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  treatment: string;
  doctor: string;
  date: string;
  time: string;
  createdAt: string;
};

const appointmentsPath = path.join(process.cwd(), "data", "appointments.json");

export async function getAppointments(): Promise<AppointmentRecord[]> {
  try {
    const raw = await readFile(appointmentsPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const appointments = isEncryptedPayload(parsed) ? decryptJson<AppointmentRecord[]>(parsed) : (parsed as AppointmentRecord[]);
    const liveAppointments = appointments.filter((appointment) => !appointment.id.startsWith("appt_seed_"));

    if (liveAppointments.length !== appointments.length) {
      await saveAppointments(liveAppointments);
    }

    return liveAppointments;
  } catch {
    await saveAppointments([]);
    return [];
  }
}

export async function saveAppointments(appointments: AppointmentRecord[]) {
  await mkdir(path.dirname(appointmentsPath), { recursive: true });
  await writeFile(appointmentsPath, `${JSON.stringify(encryptJson(appointments), null, 2)}\n`, "utf8");
}

export async function addAppointment(appointment: Omit<AppointmentRecord, "id" | "status" | "createdAt">) {
  const appointments = await getAppointments();
  const nextAppointment: AppointmentRecord = {
    id: crypto.randomUUID(),
    status: "received",
    createdAt: new Date().toISOString(),
    ...appointment
  };

  await saveAppointments([nextAppointment, ...appointments]);
  return nextAppointment;
}

export async function updateAppointment(
  id: string,
  update: Partial<Pick<AppointmentRecord, "status" | "doctor" | "date" | "time">>
) {
  const appointments = await getAppointments();
  const index = appointments.findIndex((appointment) => appointment.id === id);
  if (index === -1) return null;

  const updatedAppointment: AppointmentRecord = { ...appointments[index], ...update };
  const nextAppointments = appointments.with(index, updatedAppointment);
  await saveAppointments(nextAppointments);
  return updatedAppointment;
}

export async function deleteAppointment(id: string) {
  const appointments = await getAppointments();
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return null;

  await saveAppointments(appointments.filter((item) => item.id !== id));
  return appointment;
}
