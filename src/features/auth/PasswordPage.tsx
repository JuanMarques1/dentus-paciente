import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useSession } from "../../app/SessionProvider";
import { useAction, useOnline } from "../../app/hooks";
import { Feedback } from "../../components/ScreenState";
export function PasswordPage({ required = false }: { required?: boolean }) {
  const { run, completePasswordChange, logout } = useSession(),
    navigate = useNavigate();
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState(""),
    [repeat, setRepeat] = useState("");
  const [visible, setVisible] = useState([false, false, false]);
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
    <section className="password-reference-page">
      {required ? (
        <button
          className="password-back"
          aria-label="Voltar ao login"
          onClick={logout}
        >
          <ArrowLeft size={22} />
        </button>
      ) : (
        <Link
          to="/perfil"
          className="password-back"
          aria-label="Voltar ao perfil"
        >
          <ArrowLeft size={22} />
        </Link>
      )}
      <div className="password-brand">
        <svg viewBox="0 0 64 64" aria-hidden="true" className="password-key">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M44 3a20 20 0 0 0-18 29L7 51v11h15v-8h8v-8l6-6A20 20 0 1 0 44 3Zm6 9a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"
          />
        </svg>
        <h1>Dentu’s Clinic</h1>
      </div>
      {required && (
        <p className="password-first-access">
          Troque a senha provisória para acessar seu espaço.
        </p>
      )}
      <form className="login-form password-reference-form" onSubmit={submit}>
        {[
          {
            label: required ? "Senha provisória" : "Senha atual",
            value: current,
            set: setCurrent,
          },
          { label: "Nova senha", value: next, set: setNext },
          { label: "Confirmar nova senha", value: repeat, set: setRepeat },
        ].map((field, index) => (
          <div key={index}>
            <label className="login-label" htmlFor={`change-password-${index}`}>
              {field.label}
            </label>
            <div className="login-field">
              <input
                id={`change-password-${index}`}
                type={visible[index] ? "text" : "password"}
                autoComplete={index === 0 ? "current-password" : "new-password"}
                minLength={index === 0 ? undefined : 8}
                placeholder="••••••••"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                required
                aria-describedby={index > 0 ? "password-length" : undefined}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={`${visible[index] ? "Ocultar" : "Mostrar"} ${field.label.toLowerCase()}`}
                onClick={() =>
                  setVisible((values) =>
                    values.map((value, i) => (i === index ? !value : value)),
                  )
                }
              >
                {visible[index] ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        ))}
        <p id="password-length" className="password-length">
          Use pelo menos 8 caracteres.
        </p>
        <Feedback error={action.error} />
        <button
          className="button login-submit"
          disabled={action.busy || !online}
        >
          <RotateCcw size={19} />
          {action.busy ? "Salvando…" : "Atualizar Senha"}
        </button>
      </form>
    </section>
  );
}
