import { Link } from "react-router-dom";
import { FileText, ChevronRight, ClipboardList } from "lucide-react";
import { useResource } from "../../app/hooks";
import { ScreenState } from "../../components/ScreenState";
export function recordDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
export function RecordsPage() {
  const records = useResource((api) => api.listRecords()),
    profile = useResource((api) => api.getProfile());
  return (
    <section className="page">
      <p className="eyebrow">SEU HISTÓRICO DE CUIDADOS</p>
      <h1>Meu prontuário</h1>
      <p className="page-description">
        Seu histórico de cuidados, em um só lugar.
      </p>
      {profile.data && (
        <div className="patient-summary">
          <strong>{profile.data.name}</strong>
          <span>Registros compartilhados pela clínica</span>
        </div>
      )}
      {records.loading || records.error ? (
        <ScreenState
          loading={records.loading}
          error={records.error}
          retry={records.retry}
        />
      ) : (
        <>
          <div className="section-heading">
            <h2>Atendimentos</h2>
            <span>{records.data?.length ?? 0} registros</span>
          </div>
          <div className="card-list">
            {records.data?.map((record) => (
              <article key={record.id} className="record-card">
                <p className="record-date">
                  {recordDate(record.date)}
                  <span>·</span>Concluído
                </p>
                <h2>{record.title}</h2>
                <p className="record-dentist">Dentista {record.dentist}</p>
                <p className="record-description">{record.summary}</p>
                <Link className="record-link" to={`/prontuario/${record.id}`}>
                  <FileText size={16} />
                  {record.id === "1"
                    ? "Orientações do atendimento"
                    : "Plano e orientações"}
                  <ChevronRight size={16} />
                </Link>
              </article>
            ))}
          </div>
          {!records.data?.length ? (
            <div className="empty-state">
              <ClipboardList size={35} />
              <h2>Seu histórico começa aqui</h2>
              <p>
                Os registros disponibilizados pela clínica aparecerão nesta
                tela.
              </p>
            </div>
          ) : (
            <p className="end-note">Você está vendo todos os seus registros.</p>
          )}
        </>
      )}
    </section>
  );
}
