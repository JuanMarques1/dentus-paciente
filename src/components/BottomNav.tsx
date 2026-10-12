import { NavLink } from "react-router-dom";
import { CalendarDays, Clipboard, UserRound } from "lucide-react";
export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {[
        { path: "/consultas", label: "Consultas", Icon: CalendarDays },
        { path: "/prontuario", label: "Prontuário", Icon: Clipboard },
        { path: "/perfil", label: "Perfil", Icon: UserRound },
      ].map(({ path, label, Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">
            <Icon size={23} strokeWidth={1.7} />
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
