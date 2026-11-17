
import { Menu, CircleUserRound } from "lucide-react";

import "./Header.css";

function Header({ onMenuClick, usuario }) {
  const perfis = {
    ADMIN: "Administrador",
    DENTISTA: "Dentista",
    SECRETARIA: "Secretária",
    RECEPCIONISTA: "Recepcionista",
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="header-menu-button"
          onClick={onMenuClick}
          aria-label="Abrir ou minimizar menu"
          title="Menu"
        >
          <Menu size={26} />
        </button>

        <div className="header-logo">
          <h2>OdontoGestão</h2>
        </div>
      </div>

      <div className="header-right">
        <div className="header-user">
          <div className="user-info">
            <strong>{usuario?.nome || "Usuário"}</strong>
            <span>{perfis[usuario?.perfil] || "Perfil"}</span>
          </div>

          <div className="user-avatar">
            <CircleUserRound size={34} strokeWidth={1.7} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
