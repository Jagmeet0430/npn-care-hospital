export const appointmentStatusValues = ["received", "pending", "confirmed", "completed", "cancelled", "follow-up"] as const;
export type AppointmentStatus = (typeof appointmentStatusValues)[number];
