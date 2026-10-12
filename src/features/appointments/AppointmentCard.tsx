import { CalendarDays, Clock3, UserRound, Check } from "lucide-react";
import type { Appointment } from "../../services/types";
import {
  canCancelAt,
  formatAppointmentDate,
  formatAppointmentTime,
} from "./rules";
const statusLabels = {
  pending: "Aguardando confirmação",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Concluída",
};
export function AppointmentCard({
  appointment,
  busy,
  online,
  now,
  onConfirm,
  onCancel,
}: {
  appointment: Appointment;
  busy: boolean;
  online: boolean;
  now: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const active =
    appointment.status === "pending" || appointment.status === "confirmed";
  const cancelAllowed =
    appointment.canCancel && canCancelAt(appointment.startsAt, now);
  return (
    <article
      className={`appointment-card ${appointment.status === "pending" ? "highlight" : ""} ${!active ? "inactive" : ""}`}
    >
      <div className="card-heading">
        <h2>{appointment.procedure}</h2>
        {appointment.status === "confirmed" && <Check size={20} />}
      </div>
      <span className={`status-pill ${appointment.status}`}>
        {statusLabels[appointment.status]}
      </span>
      <div className="appointment-meta">
        <div>
          <UserRound size={20} />
          <span>
            <small>Dentista</small>
            <strong>{appointment.dentist}</strong>
          </span>
        </div>
        <div>
          <Clock3 size={20} />
          <span>
            <small>Horário</small>
            <strong>{formatAppointmentTime(appointment)}</strong>
          </span>
        </div>
      </div>
      <div className="appointment-date">
        <CalendarDays size={33} strokeWidth={1.8} />
        <span>
          <small>Data</small>
          <strong>{formatAppointmentDate(appointment)}</strong>
        </span>
      </div>
      {active && (
        <div className="button-row">
          {cancelAllowed && (
            <button
              className="button secondary"
              onClick={onCancel}
              disabled={busy || !online}
            >
              Cancelar
            </button>
          )}
          {appointment.canConfirm && (
            <button
              className="button primary"
              onClick={onConfirm}
              disabled={busy || !online}
            >
              {busy ? "Aguarde…" : "Confirmar"}
            </button>
          )}
        </div>
      )}
      {active && !cancelAllowed && (
        <p className="card-note">
          O cancelamento pelo app encerra 24 horas antes. Entre em contato com a
          clínica.
        </p>
      )}
    </article>
  );
}
