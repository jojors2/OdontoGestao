import {
  CalendarDays,
  Users,
  ClipboardList,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {Link} from "react-router-dom"
import "./Dashboard.css";
import Agenda from "../Agenda/Agenda";

function Dashboard() {
  const consultas = [
    {
      id: 1,
      horario: "08:00",
      paciente: "Mariana Silva",
      procedimento: "Limpeza",
      status: "Confirmada",
    },
    {
      id: 2,
      horario: "10:30",
      paciente: "Carlos Henrique",
      procedimento: "Avaliação",
      status: "Cancelada",
    },
    {
      id: 3,
      horario: "14:00",
      paciente: "Ana Beatriz",
      procedimento: "Restauração",
      status: "Confirmada",
    },
    {
      id: 4,
      horario: "16:30",
      paciente: "Lucas Souza",
      procedimento: "Retorno",
      status: "Aguardando",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>Visão geral da clínica</p>
        </div>

        <div className="dashboard-date">
          <CalendarDays size={20} />

          <span>Hoje</span>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">
            <CalendarDays size={25} />
          </div>

          <div>
            <span>Consultas</span>
            <strong>8</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <Users size={25} />
          </div>

          <div>
            <span>Pacientes</span>
            <strong>124</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <ClipboardList size={25} />
          </div>

          <div>
            <span>Orçamentos pendentes</span>
            <strong>6</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <Bell size={25} />
          </div>

          <div>
            <span>Lembretes</span>
            <strong>3</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Próximas consultas</h2>

              <p>
                Consultas agendadas para hoje
              </p>
            </div>

            <Link to="/agenda" className="btn-ver-agenda">
              Ver agenda
            </Link>
          </div>

          <div className="consultas-list">
            {consultas.map((consulta) => (
              <div
                className="consulta-item"
                key={consulta.id}
              >
                <div className="consulta-horario">
                  <Clock size={18} />

                  <strong>
                    {consulta.horario}
                  </strong>
                </div>

                <div className="consulta-paciente">
                  <strong>
                    {consulta.paciente}
                  </strong>

                  <span>
                    {consulta.procedimento}
                  </span>
                </div>

                <span
                  className={`consulta-status ${
                    consulta.status === "Confirmada"
                      ? "status-confirmada"
                      : consulta.status === "Cancelada"
                      ? "status-cancelada"
                      : "status-aguardando"
                  }`}
                >
                  {consulta.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Resumo de hoje</h2>

              <p>
                Situação dos atendimentos
              </p>
            </div>
          </div>

          <div className="resumo-list">
            <div className="resumo-item">
              <div className="resumo-icon">
                <CheckCircle size={20} />
              </div>

              <div>
                <strong>3</strong>
                <span>Concluídas</span>
              </div>
            </div>

            <div className="resumo-item">
              <div className="resumo-icon">
                <Clock size={20} />
              </div>

              <div>
                <strong>5</strong>
                <span>Agendadas</span>
              </div>
            </div>

            <div className="resumo-item">
              <div className="resumo-icon">
                <XCircle size={20} />
              </div>

              <div>
                <strong>1</strong>
                <span>Cancelada</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;