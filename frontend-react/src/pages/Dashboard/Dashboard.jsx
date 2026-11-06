import { useState, useEffect } from "react";
import {
  CalendarDays,
  Users,
  ClipboardList,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    consultasHoje: 0,
    totalConsultas: 0,
    totalOrcamentos: 0,
    lembretesPendentes: 0,
    proximasConsultas: [],
    resumoHoje: { concluidas: 0, agendadas: 0, canceladas: 0 },
  });

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/api/dashboard");
        if (res.ok) {
          const dados = await res.json();
          setStats(dados);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  const consultas = stats.proximasConsultas || [];
  const resumo = stats.resumoHoje || { concluidas: 0, agendadas: 0, canceladas: 0 };

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
            <span>Consultas hoje</span>
            <strong>{stats.consultasHoje}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <Users size={25} />
          </div>
          <div>
            <span>Pacientes</span>
            <strong>{stats.totalPacientes}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <ClipboardList size={25} />
          </div>
          <div>
            <span>Orçamentos pendentes</span>
            <strong>{stats.totalOrcamentos}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <Bell size={25} />
          </div>
          <div>
            <span>Lembretes pendentes</span>
            <strong>{stats.lembretesPendentes}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Próximas consultas</h2>
              <p>Consultas agendadas no sistema</p>
            </div>

            <Link to="/agenda" className="btn-ver-agenda">
              Ver agenda
            </Link>
          </div>

          <div className="consultas-list">
            {consultas.length === 0 ? (
              <p style={{ padding: "16px", color: "#6b7280" }}>
                {loading ? "Carregando consultas..." : "Nenhuma consulta agendada para hoje."}
              </p>
            ) : (
              consultas.map((consulta) => (
                <div className="consulta-item" key={consulta.id}>
                  <div className="consulta-horario">
                    <Clock size={18} />
                    <strong>{consulta.horario}</strong>
                  </div>

                  <div className="consulta-paciente">
                    <strong>{consulta.paciente}</strong>
                    <span>{consulta.procedimento}</span>
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
              ))
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Resumo de hoje</h2>
              <p>Situação dos atendimentos</p>
            </div>
          </div>

          <div className="resumo-list">
            <div className="resumo-item">
              <div className="resumo-icon">
                <CheckCircle size={20} />
              </div>
              <div>
                <strong>{resumo.concluidas}</strong>
                <span>Concluídas</span>
              </div>
            </div>

            <div className="resumo-item">
              <div className="resumo-icon">
                <Clock size={20} />
              </div>
              <div>
                <strong>{resumo.agendadas}</strong>
                <span>Agendadas</span>
              </div>
            </div>

            <div className="resumo-item">
              <div className="resumo-icon">
                <XCircle size={20} />
              </div>
              <div>
                <strong>{resumo.canceladas}</strong>
                <span>Canceladas</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
