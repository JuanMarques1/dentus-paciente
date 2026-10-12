import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useResource, useAction, useOnline } from "../../app/hooks";
import { useSession } from "../../app/SessionProvider";
import { ScreenState, Feedback } from "../../components/ScreenState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AppointmentCard } from "./AppointmentCard";
import { canCancelAt } from "./rules";
import type { Appointment } from "../../services/types";
export function AppointmentsPage() {
  const resource = useResource((api) => api.listAppointments()),
    action = useAction(),
    online = useOnline(),
    { run } = useSession();
  const [selected, setSelected] = useState<Appointment | null>(null),
    [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);
  const update = async (
    appointment: Appointment,
    kind: "confirm" | "cancel",
  ) => {
    if (!online) return;
    const ok = await action.execute(
      async () => {
        if (kind === "cancel" && !canCancelAt(appointment.startsAt, Date.now()))
          throw new Error(
            "O prazo para cancelar terminou. Entre em contato com a clínica.",
          );
        const result = await run((api) =>
          kind === "cancel"
            ? api.cancelAppointment(appointment.id)
            : api.confirmAppointment(appointment.id),
        );
        resource.setData(
          (current) =>
            current?.map((item) => (item.id === result.id ? result : item)) ??
            null,
        );
      },
      kind === "cancel" ? "Consulta cancelada." : "Consulta confirmada.",
    );
    if (ok) setSelected(null);
  };
  return (
    <section className="page">
      <p className="eyebrow">SUA PRÓXIMA VISITA</p>
      <h1>Consultas</h1>
      <p className="page-description">Seus cuidados, na hora certa.</p>
      {resource.loading || resource.error ? (
        <ScreenState
          loading={resource.loading}
          error={resource.error}
          retry={resource.retry}
        />
      ) : (
        <>
          <div className="section-heading">
            <h2>Consultas agendadas</h2>
            <span>
              {resource.data?.filter(
                (a) => a.status === "pending" || a.status === "confirmed",
              ).length ?? 0}{" "}
              consultas
            </span>
          </div>
          <Feedback
            success={action.success}
            error={selected ? undefined : action.error}
          />
          <div className="card-list">
            {resource.data?.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                now={now}
                busy={action.busy}
                online={online}
                onConfirm={() => void update(appointment, "confirm")}
                onCancel={() => {
                  action.setError("");
                  setNow(Date.now());
                  setSelected(appointment);
                }}
              />
            ))}
          </div>
          {!resource.data?.length ? (
            <div className="empty-state">
              <CalendarDays size={35} />
              <h2>Sua agenda está livre</h2>
              <p>Os agendamentos feitos pela clínica aparecerão aqui.</p>
            </div>
          ) : (
            <p className="end-note">Você está vendo todas as suas consultas.</p>
          )}
          <div className="info-note">
            <CalendarDays size={18} />
            <p>
              Precisa cancelar? Faça isso com pelo menos{" "}
              <strong>24 horas de antecedência.</strong>
            </p>
          </div>
        </>
      )}
      {selected && (
        <ConfirmDialog
          title="Cancelar consulta?"
          description={`Seu agendamento de ${selected.procedure.toLowerCase()} será cancelado automaticamente. Para marcar outra data, fale com a clínica.`}
          busy={action.busy}
          error={action.error}
          onClose={() => {
            setSelected(null);
            action.setError("");
          }}
          onConfirm={() => void update(selected, "cancel")}
        />
      )}
    </section>
  );
}
