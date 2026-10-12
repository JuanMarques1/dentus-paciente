import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import { Heart, WifiOff, ArrowLeft } from "lucide-react";
import type { PatientApi } from "../services/PatientApi";
import type { Session } from "../services/types";
import { SessionProvider, useSession } from "./SessionProvider";
import { useOnline } from "./hooks";
import { BottomNav } from "../components/BottomNav";
import { LoginPage } from "../features/auth/LoginPage";
import { PasswordPage } from "../features/auth/PasswordPage";
import { AppointmentsPage } from "../features/appointments/AppointmentsPage";
import { RecordsPage } from "../features/records/RecordsPage";
import { RecordDetailsPage } from "../features/records/RecordDetailsPage";
import { ProfilePage } from "../features/profile/ProfilePage";
function Protected({ allowPassword = false }: { allowPassword?: boolean }) {
  const { session } = useSession();
  if (!session) return <Navigate to="/entrar" replace />;
  if (session.mustChangePassword && !allowPassword)
    return <Navigate to="/nova-senha" replace />;
  return <Outlet />;
}
function Layout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
function ScrollAndFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo?.(0, 0);
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
    document.title = `${pathname.startsWith("/consultas") ? "Consultas" : pathname.startsWith("/prontuario") ? "Prontuário" : pathname.startsWith("/perfil") ? "Perfil" : "Seu espaço"} · Dentus`;
  }, [pathname]);
  return null;
}
function Help() {
  return (
    <section className="page">
      <Link className="back-link" to="/entrar">
        <ArrowLeft size={18} />
        Voltar ao login
      </Link>
      <h1>Seu primeiro acesso</h1>
      <p className="page-description">
        A clínica cuida da liberação do seu espaço.
      </p>
      <article className="details-card">
        <h2>1. Receba seu acesso</h2>
        <p>
          Peça à equipe da clínica o e-mail cadastrado e sua senha provisória.
        </p>
        <h2>2. Escolha uma nova senha</h2>
        <p>
          No primeiro login, você troca a senha provisória por uma senha
          pessoal.
        </p>
        <h2>3. Acompanhe seus cuidados</h2>
        <p>
          Veja suas consultas, confirme sua presença e acesse os registros
          compartilhados pela clínica.
        </p>
        <p>
          Esqueceu sua senha? Entre em contato com a clínica para recuperar o
          acesso.
        </p>
      </article>
    </section>
  );
}
function RouteTree() {
  const online = useOnline();
  const isLogin = useLocation().pathname === "/entrar";
  return (
    <div className={`app-shell ${isLogin ? "login-shell" : ""}`}>
      {!isLogin && (
        <header className="brand-header">
          <span className="brand-mark">
            <Heart size={20} strokeWidth={1.5} />
          </span>
          <span className="brand-word">
            dentus<span>CLÍNICA ODONTOLÓGICA</span>
          </span>
          <span className="portal-label">Portal do paciente</span>
        </header>
      )}
      {!online && (
        <div className="offline-banner" role="status">
          <WifiOff size={17} />
          Sem internet. Reconecte para acessar seus dados.
        </div>
      )}
      <main tabIndex={-1}>
        <ScrollAndFocus />
        <Routes>
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/ajuda" element={<Help />} />
          <Route element={<Protected allowPassword />}>
            <Route path="/nova-senha" element={<PasswordPage required />} />
          </Route>
          <Route element={<Protected />}>
            <Route element={<Layout />}>
              <Route path="/consultas" element={<AppointmentsPage />} />
              <Route path="/prontuario" element={<RecordsPage />} />
              <Route path="/prontuario/:id" element={<RecordDetailsPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/senha" element={<PasswordPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/consultas" replace />} />
        </Routes>
      </main>
    </div>
  );
}
export function AppRoutes({
  api,
  initialSession,
}: {
  api: PatientApi;
  initialSession?: Session;
}) {
  return (
    <SessionProvider api={api} initialSession={initialSession}>
      <RouteTree />
    </SessionProvider>
  );
}
