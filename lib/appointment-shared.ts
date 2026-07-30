export const appointmentStatusValues = ["received", "confirmed", "completed", "cancelled", "follow-up"] as const;
export type AppointmentStatus = (typeof appointmentStatusValues)[number];
