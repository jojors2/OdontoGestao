import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Stethoscope,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Sidebar.css";

function Sidebar({
  minimized,
  onToggle,
  mobileOpen,
  onCloseMobile,
}) {
  const navigate = useNavigate();

  const location = useLocation();

  function irPara(rota) {
    navigate(rota);

    if (onCloseMobile) {
      onCloseMobile();
    }
  }

  function sair() {
    localStorage.removeItem("usuarioLogado");

    navigate("/", {
      replace: true,
    });
  }

  function itemAtivo(rota) {
    return location.pathname === rota;
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`sidebar ${
          minimized
            ? "sidebar-minimized"
            : ""
        } ${
          mobileOpen
            ? "sidebar-mobile-open"
            : ""
        }`}
      >
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-item ${
              itemAtivo("/dashboard")
                ? "active"
                : ""
            }`}
            onClick={() =>
              irPara("/dashboard")
            }
          >
            <LayoutDashboard size={20} />

            <span className="sidebar-label">
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${
              itemAtivo("/agenda")
                ? "active"
                : ""
            }`}
            onClick={() =>
              irPara("/agenda")
            }
          >
            <CalendarDays size={20} />

            <span className="sidebar-label">
              Agenda
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${
              itemAtivo("/lembretes")
                ? "active"
                : ""
            }`}
            onClick={() =>
              irPara("/lembretes")
            }
          >
            <Bell size={20} />

            <span className="sidebar-label">
              Lembretes
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${
              itemAtivo("/orcamentos")
                ? "active"
                : ""
            }`}
            onClick={() =>
              irPara("/orcamentos")
            }
          >
            <ClipboardList size={20} />

            <span className="sidebar-label">
              Orçamentos
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${
              itemAtivo("/pacientes")
                ? "active"
                : ""
            }`}
            onClick={() =>
              irPara("/pacientes")
            }
          >
            <Users size={20} />

            <span className="sidebar-label">
              Pacientes
            </span>
          </button>
          
          <button
            type="button"
            className={`sidebar-item ${
              itemAtivo("/consultas")
                ? "active"
                : ""
            }`}
            onClick={() =>
              irPara("/consultas")
            }
          >
            <Stethoscope size={20} />

            <span className="sidebar-label">
              Consultas
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${
              itemAtivo("/configuracoes")
                ? "active"
                : ""
            }`}
            onClick={() =>
              irPara("/configuracoes")
            }
          >
            <Settings size={20} />

            <span className="sidebar-label">
              Configurações
            </span>
          </button>
        </nav>

        <button
          type="button"
          className="sidebar-item sidebar-exit"
          onClick={sair}
        >
          <LogOut size={20} />

          <span className="sidebar-label">
            Sair
          </span>
        </button>
      </aside>
    </>
  );
}

export default Sidebar;