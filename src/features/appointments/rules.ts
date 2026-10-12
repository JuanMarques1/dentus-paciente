import type { Appointment } from "../../services/types";
export function canCancelAt(startsAt: string, now: number): boolean {
  return Date.parse(startsAt) - now >= 24 * 60 * 60 * 1000;
}
export function formatAppointmentDate(appointment: Appointment): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: appointment.clinicTimeZone,
  }).format(new Date(appointment.startsAt));
}
export function formatAppointmentTime(appointment: Appointment): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: appointment.clinicTimeZone,
  }).format(new Date(appointment.startsAt));
}
