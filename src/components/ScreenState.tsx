import { RefreshCw } from "lucide-react";
export function ScreenState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  return (
    <div className="screen-state" aria-live="polite">
      {loading ? (
        <>
          <span className="spinner" />
          Carregando seus dados…
        </>
      ) : (
        <>
          <p role="alert">{error}</p>
          <button className="button secondary" onClick={retry}>
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </>
      )}
    </div>
  );
}
export function Feedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  return (
    <>
      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="feedback success" role="status">
          {success}
        </p>
      )}
    </>
  );
}
