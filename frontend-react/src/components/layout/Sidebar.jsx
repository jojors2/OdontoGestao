function Sidebar() {
    return (

        <aside className="sidebar">

            <nav className="sidebar-nav">

                <button className = "sidebar-item-active">
                    <span>Dashboard</span>
                </button>

                <button className = "sidebar-item">
                    <span>Agenda</span>
                </button>

                <button className = "sidebar-item">
                    <span>Consultas</span>
                </button>

                <button className = "sidebar-item">
                    <span>Lembrentes</span>
                </button>

                <button className = "sidebar-item">
                    <span>Orçamentos</span>
                </button>

                <button className = "sidebar-item">
                    <span>Pacientes</span>
                </button>

                <button className = "sidebar-item">
                    <span>Configurações</span>
                </button>

            </nav>

            <button className = "sidebar-item">
                <span>Sair</span>
            </button>

        </aside>
    );

}

export default Sidebar;