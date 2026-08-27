import {
  LayoutDashboard,  
  CalendarDays,  
  Stethoscope,  
  Bell,  
  Users,  
  ReceiptText,
  Settings,  
  LogOut  
} from "lucide-react";

function Sidebar({minimized, onToggle}) {
    return (

        <aside className={`sidebar ${minimized ? "sidebar-minimized" : ""}`}>

                <button
                    className="sidebar-toggle"
                    onClick={onToggle}
                    >
                    {minimized ? "»" : "«"}
                </button>

            <nav className="sidebar-nav">

                <button className = "sidebar-item">
                    <LayoutDashboard className="sidebar-icon" />
                    <span className = "sidebar-label">Dashboard</span>
                </button>

                <button className = "sidebar-item">
                    <CalendarDays className="sidebar-icon" />
                    <span className = "sidebar-label">Agenda</span>
                </button>

                <button className = "sidebar-item">
                    <Stethoscope className="sidebar-icon" />
                    <span className = "sidebar-label">Consultas</span>
                </button>

                <button className = "sidebar-item">
                    <Bell className="sidebar-icon" />
                    <span className = "sidebar-label">Lembrentes</span>
                </button>

                <button className = "sidebar-item">
                    <ReceiptText className="sidebar-icon" />
                    <span className = "sidebar-label">Orçamentos</span>
                </button>

                <button className = "sidebar-item">
                    <Users className="sidebar-icon" />
                    <span className = "sidebar-label">Pacientes</span>
                </button>

                <button className = "sidebar-item">
                    <Settings className="sidebar-icon" />
                    <span className = "sidebar-label">Configurações</span>
                </button>

            </nav>

            <button className = "sidebar-item">
                <LogOut className="sidebar-icon" />
                <span className = "sidebar-label">Sair</span>
            </button>

        </aside>
    );

}

export default Sidebar;