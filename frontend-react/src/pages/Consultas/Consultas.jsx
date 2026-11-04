import { useMemo, useState, useEffect } from "react";
import {
  CalendarDays,
  Clock3,
  Search,
  CheckCircle2,
  CircleAlert,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  Stethoscope,
  Plus,
  X,
} from "lucide-react";
import "./Consultas.css";

function Consultas() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [pacientes, setPacientes] = useState([]);

  const [form, setForm] = useState({
    paciente: "",
    procedimento: "",
    data: new Date().toISOString().slice(0, 10),
    horario: "09:00",
    status: "Agendada",
    observacoes: "",
  });

  async function carregarConsultas() {
    try {
      setCarregando(true);
      const res = await fetch("http://localhost:3001/api/consultas");
      if (res.ok) {
        const dados = await res.json();
        setConsultas(dados);
      }
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarPacientes() {
    try {
      const res = await fetch("http://localhost:3001/api/pacientes");
      if (res.ok) {
        const dados = await res.json();
        setPacientes(dados);
      }
    } catch (err) {
      console.error("Erro ao carregar pacientes:", err);
    }
  }

  useEffect(() => {
    carregarConsultas();
    carregarPacientes();
  }, []);

  const consultasFiltradas = useMemo(() => {
    return consultas.filter((consulta) => {
      const texto = busca.toLowerCase();
      const nomePaciente = (consulta.paciente || "").toLowerCase();
      const nomeProcedimento = (consulta.procedimento || "").toLowerCase();

      const correspondeBusca =
        nomePaciente.includes(texto) || nomeProcedimento.includes(texto);

      const correspondeStatus =
        filtroStatus === "Todos" || consulta.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, consultas]);

  const confirmadas = consultas.filter((c) => c.status === "Confirmada").length;
  const aguardando = consultas.filter((c) => c.status === "Agendada" || c.status === "Aguardando").length;
  const concluidas = consultas.filter((c) => c.status === "Concluída").length;
  const canceladas = consultas.filter((c) => c.status === "Cancelada").length;

  function getStatusClass(status) {
    switch (status) {
      case "Confirmada":
        return "consulta-status-confirmada";
      case "Aguardando":
      case "Agendada":
        return "consulta-status-aguardando";
      case "Concluída":
        return "consulta-status-concluida";
      case "Cancelada":
        return "consulta-status-cancelada";
      default:
        return "";
    }
  }

  async function excluirConsulta(id) {
    const confirmar = window.confirm("Deseja realmente excluir esta consulta?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:3001/api/consultas/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConsultas((atuais) => atuais.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir consulta:", err);
    }
  }

  async function salvarConsulta(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const nova = await res.json();
        setConsultas((atuais) => [nova, ...atuais]);
        setModalAberto(false);
        setForm({
          paciente: "",
          procedimento: "",
          data: new Date().toISOString().slice(0, 10),
          horario: "09:00",
          status: "Agendada",
          observacoes: "",
        });
      }
    } catch (err) {
      console.error("Erro ao salvar consulta:", err);
    }
  }

  return (
    <div className="consultas-page">
      {/* TOPO */}
      <header className="consultas-page-header">
        <div>
          <h1>Consultas</h1>
          <p>Gerencie e acompanhe as consultas dos seus pacientes salvas no banco de dados.</p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="btn-nova-consulta"
          style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={18} />
          Nova consulta
        </button>
      </header>

      {/* CARDS */}
      <section className="consultas-cards">
        <article className="consultas-card">
          <div className="consultas-card-icon consultas-icon-blue">
            <CalendarDays size={23} />
          </div>
          <div className="consultas-card-info">
            <span>Confirmadas</span>
            <strong>{confirmadas}</strong>
            <small>Consultas confirmadas</small>
          </div>
        </article>

        <article className="consultas-card">
          <div className="consultas-card-icon consultas-icon-orange">
            <CircleAlert size={23} />
          </div>
          <div className="consultas-card-info">
            <span>Agendadas</span>
            <strong>{aguardando}</strong>
            <small>Aguardando confirmação</small>
          </div>
        </article>

        <article className="consultas-card">
          <div className="consultas-card-icon consultas-icon-green">
            <CheckCircle2 size={23} />
          </div>
          <div className="consultas-card-info">
            <span>Concluídas</span>
            <strong>{concluidas}</strong>
            <small>Consultas realizadas</small>
          </div>
        </article>

        <article className="consultas-card">
          <div className="consultas-card-icon consultas-icon-red">
            <XCircle size={23} />
          </div>
          <div className="consultas-card-info">
            <span>Canceladas</span>
            <strong>{canceladas}</strong>
            <small>Consultas canceladas</small>
          </div>
        </article>
      </section>

      {/* LISTA */}
      <section className="consultas-lista">
        <div className="consultas-lista-topo">
          <div className="consultas-lista-titulo">
            <div className="consultas-lista-icon">
              <Stethoscope size={20} />
            </div>
            <div>
              <h2>Consultas cadastradas</h2>
              <p>Visualize e gerencie os atendimentos.</p>
            </div>
          </div>

          <div className="consultas-filtros">
            <div className="consultas-busca">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar paciente ou procedimento..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
            >
              <option value="Todos">Todos os status</option>
              <option value="Confirmada">Confirmadas</option>
              <option value="Agendada">Agendadas</option>
              <option value="Concluída">Concluídas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        {/* TABELA */}
        <div className="consultas-table-container">
          <table className="consultas-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Procedimento</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {consultasFiltradas.length > 0 ? (
                consultasFiltradas.map((consulta) => (
                  <tr key={consulta.id}>
                    <td>
                      <div className="consulta-paciente">
                        <div className="consulta-avatar">
                          {(consulta.paciente || "P").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{consulta.paciente}</strong>
                          <span>Paciente</span>
                        </div>
                      </div>
                    </td>

                    <td>{consulta.procedimento}</td>

                    <td>
                      <div className="consulta-data">
                        <CalendarDays size={16} />
                        {consulta.data}
                      </div>
                    </td>

                    <td>
                      <div className="consulta-data">
                        <Clock3 size={16} />
                        {consulta.horario}
                      </div>
                    </td>

                    <td>
                      <span className={`consulta-status ${getStatusClass(consulta.status)}`}>
                        {consulta.status}
                      </span>
                    </td>

                    <td>
                      <div className="consulta-acoes">
                        <button
                          className="consulta-action excluir"
                          title="Excluir"
                          onClick={() => excluirConsulta(consulta.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="consultas-sem-resultado">
                    <Search size={30} />
                    <strong>Nenhuma consulta encontrada</strong>
                    <span>
                      {carregando
                        ? "Carregando dados do banco..."
                        : "Tente pesquisar outro paciente ou cadastre uma nova consulta."}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL DE NOVA CONSULTA */}
      {modalAberto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#1e293b",
              color: "#f8fafc",
              padding: "24px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Nova Consulta</h2>
              <button
                onClick={() => setModalAberto(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarConsulta} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.875rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>
                  Paciente
                </label>
                {pacientes.length > 0 ? (
                  <input
                    list="lista-pacientes"
                    required
                    placeholder="Selecione ou digite o nome do paciente"
                    value={form.paciente}
                    onChange={(e) => setForm({ ...form, paciente: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "#0f172a",
                      color: "#fff",
                      border: "1px solid #334155",
                    }}
                  />
                ) : (
                  <input
                    required
                    placeholder="Nome do paciente"
                    value={form.paciente}
                    onChange={(e) => setForm({ ...form, paciente: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "#0f172a",
                      color: "#fff",
                      border: "1px solid #334155",
                    }}
                  />
                )}
                <datalist id="lista-pacientes">
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.nome} />
                  ))}
                </datalist>
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>
                  Procedimento
                </label>
                <input
                  required
                  placeholder="Ex: Limpeza, Restauração, Avaliação"
                  value={form.procedimento}
                  onChange={(e) => setForm({ ...form, procedimento: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "#0f172a",
                    color: "#fff",
                    border: "1px solid #334155",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "#0f172a",
                      color: "#fff",
                      border: "1px solid #334155",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.875rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>
                    Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={form.horario}
                    onChange={(e) => setForm({ ...form, horario: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "#0f172a",
                      color: "#fff",
                      border: "1px solid #334155",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "#0f172a",
                    color: "#fff",
                    border: "1px solid #334155",
                  }}
                >
                  <option value="Agendada">Agendada</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    background: "#334155",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Salvar Consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Consultas;
