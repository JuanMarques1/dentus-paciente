import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { useResource } from "../../app/hooks";
import { ScreenState } from "../../components/ScreenState";
import { recordDate } from "./RecordsPage";
export function RecordDetailsPage() {
  const { id = "" } = useParams();
  const record = useResource((api) => api.getRecord(id), id);
  return (
    <section className="page">
      <Link to="/prontuario" className="back-link">
        <ArrowLeft size={17} />
        Voltar ao prontuário
      </Link>
      {record.loading || record.error ? (
        <ScreenState
          loading={record.loading}
          error={record.error}
          retry={record.retry}
        />
      ) : (
        record.data && (
          <>
            <span className="section-symbol">
              <FileText size={25} />
            </span>
            <h1>{record.data.title}</h1>
            <p className="page-description">
              {recordDate(record.data.date)} · Dentista {record.data.dentist}
            </p>
            <article className="details-card">
              <h2>Sobre o atendimento</h2>
              <p>{record.data.summary}</p>
              <h2>Orientações do atendimento</h2>
              <p>
                {record.data.instructions ||
                  "Nenhuma orientação foi disponibilizada para este atendimento."}
              </p>
              <h2>Plano de tratamento</h2>
              <p>
                {record.data.treatmentPlan ||
                  "Nenhum plano foi disponibilizado para este atendimento."}
              </p>
            </article>
            <p className="end-note">
              Informações disponibilizadas pela sua clínica.
            </p>
          </>
        )
      )}
    </section>
  );
}
