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

const seedAppointments: AppointmentRecord[] = [
  {
    id: "appt_seed_1",
    name: "Ramesh Kumar",
    age: 58,
    gender: "Male",
    phone: "9876543210",
    email: "ramesh@example.com",
    treatment: "Joint Pain",
    doctor: "Dr. Sukhwinder Singh",
    date: "2026-07-29",
    time: "Morning",
    status: "confirmed",
    createdAt: "2026-07-28T10:30:00.000Z"
  },
  {
    id: "appt_seed_2",
    name: "Meena Shah",
    age: 45,
    gender: "Female",
    phone: "9876543211",
    email: "meena@example.com",
    treatment: "Diabetes Care",
    doctor: "Dr. Raj Kumari",
    date: "2026-07-29",
    time: "Afternoon",
    status: "received",
    createdAt: "2026-07-28T12:00:00.000Z"
  }
];

export async function getAppointments(): Promise<AppointmentRecord[]> {
  try {
    const raw = await readFile(appointmentsPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isEncryptedPayload(parsed) ? decryptJson<AppointmentRecord[]>(parsed) : (parsed as AppointmentRecord[]);
  } catch {
    await saveAppointments(seedAppointments);
    return seedAppointments;
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
