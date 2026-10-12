import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, Mail, Eye, EyeOff } from "lucide-react";
import { useSession } from "../../app/SessionProvider";
import { useAction, useOnline } from "../../app/hooks";
import { Feedback } from "../../components/ScreenState";
import { ToothLogo } from "../../components/ToothLogo";
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
        <ToothLogo className="login-tooth" />
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
