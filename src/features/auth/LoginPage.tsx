import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useSession } from "../../app/SessionProvider";
import { useAction, useOnline } from "../../app/hooks";
import { Feedback } from "../../components/ScreenState";
export function LoginPage() {
  const { session, login } = useSession();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false);
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
    void action.execute(() => login(email.trim(), password));
  };
  return (
    <section className="auth-page">
      <div className="auth-emblem">
        <LockKeyhole size={27} strokeWidth={1.5} />
      </div>
      <p className="eyebrow">SEU ESPAÇO DE CUIDADO</p>
      <h1>Bem-vindo de volta</h1>
      <p className="page-description">
        Suas consultas e seu histórico,
        <br />
        sempre perto de você.
      </p>
      <form onSubmit={submit} className="form auth-form">
        <label>
          E-mail
          <input
            type="email"
            name="email"
            autoComplete="username"
            placeholder="Seu e-mail cadastrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <span className="password-field">
            <input
              type={show ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Sua senha"
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
              {show ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </span>
        </label>
        <Feedback error={action.error} />
        <button className="button primary" disabled={action.busy || !online}>
          {action.busy ? "Entrando…" : "Entrar"}
          <ArrowRight size={18} />
        </button>
      </form>
      <p className="auth-help">
        Seu acesso é liberado pela clínica.
        <br />
        Se precisar de uma senha, entre em contato com a equipe.
      </p>
      <Link className="quiet-link" to="/ajuda">
        Como acessar meu espaço
      </Link>
    </section>
  );
}
