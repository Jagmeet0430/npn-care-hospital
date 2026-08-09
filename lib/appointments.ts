import { supabase } from "@/lib/supabase";
import type { AppointmentStatus } from "@/lib/appointment-shared";

export type AppointmentRecord = {
  id: string;
  appointmentNumber?: string;

  name: string;
  age: number;
  gender: string;

  phone: string;
  email?: string;

  treatment: string;
  doctor: string;

  date: string;
  time: string;

  status: AppointmentStatus;
  paymentStatus: string;

  consentGiven: boolean;
  notes?: string;

  createdAt: string;
};

export async function getAppointments(): Promise<AppointmentRecord[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (
    data?.map((item) => ({
      id: item.id,
      appointmentNumber: item.appointment_number,

      name: item.patient_name,

      age: item.age,
      gender: item.gender,

      phone: item.phone,
      email: item.email,

      treatment: item.treatment_name,
      doctor: item.doctor_name,

      date: item.appointment_date,
      time: item.appointment_time,

      status: item.status,
      paymentStatus: item.payment_status,

      consentGiven: item.consent_given,

      notes: item.notes,

      createdAt: item.created_at,
    })) ?? []
  );
}

export async function addAppointment(
  appointment: Omit<
    AppointmentRecord,
    | "id"
    | "appointmentNumber"
    | "status"
    | "paymentStatus"
    | "createdAt"
  >
) {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_name: appointment.name,

      age: appointment.age,
      gender: appointment.gender,

      phone: appointment.phone,
      email: appointment.email,

      treatment_name: appointment.treatment,
      doctor_name: appointment.doctor,

      appointment_date: appointment.date,
      appointment_time: appointment.time,

      status: "received",
      payment_status: "Unpaid",

      consent_given: appointment.consentGiven,
      notes: appointment.notes,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    appointmentNumber: data.appointment_number,

    name: data.patient_name,

    age: data.age,
    gender: data.gender,

    phone: data.phone,
    email: data.email,

    treatment: data.treatment_name,
    doctor: data.doctor_name,

    date: data.appointment_date,
    time: data.appointment_time,

    status: data.status,
    paymentStatus: data.payment_status,

    consentGiven: data.consent_given,

    notes: data.notes,

    createdAt: data.created_at,
  };
}

export async function updateAppointment(
  id: string,
  update: Partial<{
    status: AppointmentStatus;
    doctor: string;
    treatment: string;
    date: string;
    time: string;
    notes: string;
  }>
) {
  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: update.status,

      doctor_name: update.doctor,
      treatment_name: update.treatment,

      appointment_date: update.date,
      appointment_time: update.time,

      notes: update.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return null;

  return {
    id: data.id,
    appointmentNumber: data.appointment_number,

    name: data.patient_name,

    age: data.age,
    gender: data.gender,

    phone: data.phone,
    email: data.email,

    treatment: data.treatment_name,
    doctor: data.doctor_name,

    date: data.appointment_date,
    time: data.appointment_time,

    status: data.status,
    paymentStatus: data.payment_status,

    consentGiven: data.consent_given,

    notes: data.notes,

    createdAt: data.created_at,
  };
}

export async function deleteAppointment(id: string) {
  const { data, error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) return null;

  return {
    id: data.id,
    appointmentNumber: data.appointment_number,

    name: data.patient_name,

    age: data.age,
    gender: data.gender,

    phone: data.phone,
    email: data.email,

    treatment: data.treatment_name,
    doctor: data.doctor_name,

    date: data.appointment_date,
    time: data.appointment_time,

    status: data.status,
    paymentStatus: data.payment_status,

    consentGiven: data.consent_given,

    notes: data.notes,

    createdAt: data.created_at,
  };
}