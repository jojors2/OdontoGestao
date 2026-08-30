import { Menu } from "lucide-react";

import "./Header.css";

function Header({ onMenuClick }) {
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
            <strong>Dr(a). Dentista</strong>

            <span>Administrador</span>
          </div>

          <div className="user-avatar">
            DD
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;