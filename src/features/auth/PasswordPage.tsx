import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useSession } from "../../app/SessionProvider";
import { useAction, useOnline } from "../../app/hooks";
import { Feedback } from "../../components/ScreenState";
export function PasswordPage({ required = false }: { required?: boolean }) {
  const { run, completePasswordChange, logout } = useSession(),
    navigate = useNavigate();
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState(""),
    [repeat, setRepeat] = useState("");
  const action = useAction(),
    online = useOnline();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (next !== repeat) {
      action.setError("As novas senhas precisam ser iguais.");
      return;
    }
    if (next === current) {
      action.setError("Escolha uma senha diferente da atual.");
      return;
    }
    void action.execute(async () => {
      await run((api) => api.changePassword(current, next));
      completePasswordChange();
      navigate(required ? "/consultas" : "/perfil", { replace: true });
    });
  };
  return (
    <section className="page password-page">
      {!required && (
        <Link to="/perfil" className="back-link">
          <ArrowLeft size={17} />
          Voltar ao perfil
        </Link>
      )}
      <span className="section-symbol">
        <KeyRound size={25} />
      </span>
      <h1>{required ? "Crie sua nova senha" : "Alterar senha"}</h1>
      <p className="page-description">
        {required
          ? "Troque a senha provisória fornecida pela clínica para acessar seu espaço."
          : "Escolha uma senha que só você conheça."}
      </p>
      <form className="form" onSubmit={submit}>
        <label>
          {required ? "Senha provisória" : "Senha atual"}
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </label>
        <label>
          Nova senha
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
        </label>
        <p className="field-hint">Use pelo menos 8 caracteres.</p>
        <label>
          Repita a nova senha
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            required
          />
        </label>
        <Feedback error={action.error} />
        <button className="button primary" disabled={action.busy || !online}>
          {action.busy ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
      {required && (
        <button className="text-button" onClick={logout}>
          Voltar ao login
        </button>
      )}
    </section>
  );
}
