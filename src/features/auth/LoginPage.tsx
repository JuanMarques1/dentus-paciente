import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, Mail, Eye, EyeOff } from "lucide-react";
import { useSession } from "../../app/SessionProvider";
import { useAction, useOnline } from "../../app/hooks";
import { Feedback } from "../../components/ScreenState";
export function LoginPage() {
  const { session, login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const action = useAction(),
    online = useOnline();
  if (session)
    return (
      <Navigate
        to={session.mustChangePassword ? "/nova-senha" : "/consultas"}
        replace
      />
    );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void action.execute(() => login(email.trim(), password, remember));
  };
  return (
    <section className="login-page">
      <div className="login-brand">
        <svg className="login-tooth" viewBox="0 0 48 56" aria-hidden="true">
          <path
            fill="currentColor"
            d="M24 8C17 5 15 1 10 3 3 6 0 13 3 21c3 6 5 9 6 19 1 8 2 13 5 13 4 0 4-10 7-17 1-3 5-3 6 0 3 7 3 17 7 17 3 0 4-5 5-13 1-10 3-13 6-19 3-8 0-15-7-18-5-2-8 0-11 3l6 6-9-4Z"
          />
        </svg>
        <p className="login-tagline">CLÍNICA ODONTOLÓGICA</p>
        <h1>Dentu’s Clinic</h1>
      </div>
      <form onSubmit={submit} className="login-form">
        <label className="login-label" htmlFor="login-email">
          E-mail
        </label>
        <div className="login-field">
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="usuario@dentusclinic.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Mail size={18} aria-hidden="true" />
        </div>
        <label className="login-label" htmlFor="login-password">
          Senha
        </label>
        <div className="login-field">
          <input
            id="login-password"
            type={show ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="icon-button"
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setShow(!show)}
          >
            {show ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <label className="remember-label">
          <input
            type="checkbox"
            role="switch"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span className="remember-switch" aria-hidden="true" />
          Manter Logado
        </label>
        <Feedback error={action.error} />
        <button
          className="button login-submit"
          disabled={action.busy || !online}
        >
          <LogIn size={18} />
          {action.busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </section>
  );
}
