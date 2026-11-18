
import { useMemo, useState, useEffect } from "react";

import {
  CalendarDays,
  Clock3,
  Search,
  CheckCircle2,
  CircleAlert,
  XCircle,
  Stethoscope,
  Plus,
  X,
  Trash2,
} from "lucide-react";

import { apiFetch } from "../../services/api";
import "./Consultas.css";

const formularioInicial = () => ({
  pacienteId: "",
  procedimento: "",
  data: new Date().toISOString().slice(0, 10),
  horario: "09:00",
  status: "Agendada",
  observacoes: "",
  dentistaId: "",
});

function Consultas() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const [pacientes, setPacientes] = useState([]);
  const [dentistas, setDentistas] = useState([]);
  const [usuario, setUsuario] = useState(null);

  const [form, setForm] = useState(formularioInicial);

  const podeSelecionarDentista =
    ["ADMIN", "SECRETARIA"].includes(usuario?.perfil);

  async function carregarDados() {
    try {
      setCarregando(true);

      const [resConsultas, resPacientes, resUsuario] =
        await Promise.all([
          apiFetch("/api/consultas"),
          apiFetch("/api/pacientes"),
          apiFetch("/api/usuarios/me"),
        ]);

      if (!resConsultas.ok) {
        throw new Error("Erro ao carregar consultas.");
      }

      if (!resPacientes.ok) {
        throw new Error("Erro ao carregar pacientes.");
      }

      if (!resUsuario.ok) {
        throw new Error("Erro ao identificar usuário.");
      }

      const [dadosConsultas, dadosPacientes, dadosUsuario] =
        await Promise.all([
          resConsultas.json(),
          resPacientes.json(),
          resUsuario.json(),
        ]);

      setConsultas(dadosConsultas);
      setPacientes(dadosPacientes);
      setUsuario(dadosUsuario);

      if (
        ["ADMIN", "SECRETARIA", "DENTISTA"].includes(
          dadosUsuario.perfil
        )
      ) {
        const resDentistas = await apiFetch("/api/dentistas");

        if (!resDentistas.ok) {
          throw new Error("Erro ao carregar dentistas.");
        }

        setDentistas(await resDentistas.json());
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      alert(err.message || "Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const consultasFiltradas = useMemo(() => {
    return consultas.filter((consulta) => {
      const texto = busca.toLowerCase();

      const nomePaciente = (consulta.paciente || "").toLowerCase();
      const nomeProcedimento = (
        consulta.procedimento || ""
      ).toLowerCase();

      const nomeDentista = (
        consulta.dentista || ""
      ).toLowerCase();

      const correspondeBusca =
        nomePaciente.includes(texto) ||
        nomeProcedimento.includes(texto) ||
        nomeDentista.includes(texto);

      const correspondeStatus =
        filtroStatus === "Todos" ||
        consulta.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, consultas]);

  const confirmadas = consultas.filter(
    (c) => c.status === "Confirmada"
  ).length;

  const aguardando = consultas.filter(
    (c) =>
      c.status === "Agendada" ||
      c.status === "Aguardando"
  ).length;

  const concluidas = consultas.filter(
    (c) => c.status === "Concluída"
  ).length;

  const canceladas = consultas.filter(
    (c) => c.status === "Cancelada"
  ).length;

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

  function abrirModal() {
    setForm(formularioInicial());
    setModalAberto(true);
  }

  async function excluirConsulta(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta consulta?"
    );

    if (!confirmar) return;

    try {
      const res = await apiFetch(`/api/consultas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const erro = await res.json().catch(() => ({}));
        throw new Error(erro.erro || "Erro ao excluir consulta.");
      }

      setConsultas((atuais) =>
        atuais.filter((c) => c.id !== id)
      );
    } catch (err) {
      console.error("Erro ao excluir consulta:", err);
      alert(err.message || "Não foi possível excluir a consulta.");
    }
  }

  async function salvarConsulta(e) {
    e.preventDefault();

    if (!form.pacienteId) {
      alert("Selecione um paciente.");
      return;
    }

    if (
      podeSelecionarDentista &&
      !form.dentistaId
    ) {
      alert("Selecione o dentista responsável.");
      return;
    }

    try {
      setSalvando(true);

      const dadosEnvio = {
        ...form,
        pacienteId: Number(form.pacienteId),
        dentistaId: podeSelecionarDentista
          ? form.dentistaId
          : undefined,
      };

      const res = await apiFetch("/api/consultas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosEnvio),
      });

      if (!res.ok) {
        const erro = await res.json().catch(() => ({}));
        throw new Error(erro.erro || "Erro ao salvar consulta.");
      }

      const nova = await res.json();

      setConsultas((atuais) => [nova, ...atuais]);
      setModalAberto(false);
      setForm(formularioInicial());
    } catch (err) {
      console.error("Erro ao salvar consulta:", err);
      alert(err.message || "Não foi possível salvar a consulta.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="consultas-page">
      <header className="consultas-page-header">
        <div>
          <h1>Consultas</h1>
          <p>
            Gerencie e acompanhe as consultas dos seus pacientes
            salvas no banco de dados.
          </p>
        </div>

        {["ADMIN", "SECRETARIA", "DENTISTA"].includes(
          usuario?.perfil
        ) && (
          <button
            onClick={abrirModal}
            className="btn-nova-consulta"
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Plus size={18} />
            Nova consulta
          </button>
        )}
      </header>

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
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="Todos">Todos os status</option>
              <option value="Confirmada">Confirmadas</option>
              <option value="Agendada">Agendadas</option>
              <option value="Concluída">Concluídas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        <div className="consultas-table-container">
          <table className="consultas-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Procedimento</th>
                <th>Dentista</th>
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
                          {(consulta.paciente || "P")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>{consulta.paciente}</strong>
                          <span>Paciente</span>
                        </div>
                      </div>
                    </td>

                    <td>{consulta.procedimento}</td>
                    <td>{consulta.dentista || "—"}</td>

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
                      <span
                        className={`consulta-status ${getStatusClass(
                          consulta.status
                        )}`}
                      >
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
                  <td colSpan="7" className="consultas-sem-resultado">
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
            padding: "16px",
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
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                Nova Consulta
              </h2>

              <button
                type="button"
                onClick={() => setModalAberto(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={salvarConsulta}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div>
                <label style={estiloLabel}>Paciente</label>
                <select
                  required
                  value={form.pacienteId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pacienteId: e.target.value,
                    })
                  }
                  style={estiloCampo}
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              {podeSelecionarDentista && (
                <div>
                  <label style={estiloLabel}>
                    Dentista responsável
                  </label>
                  <select
                    required
                    value={form.dentistaId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dentistaId: e.target.value,
                      })
                    }
                    style={estiloCampo}
                  >
                    <option value="">
                      Selecione o dentista
                    </option>
                    {dentistas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {usuario?.perfil === "DENTISTA" && (
                <p style={{ color: "#93c5fd", fontSize: "0.85rem" }}>
                  A consulta será associada automaticamente ao seu usuário.
                </p>
              )}

              <div>
                <label style={estiloLabel}>Procedimento</label>
                <input
                  required
                  placeholder="Ex: Limpeza, Restauração, Avaliação"
                  value={form.procedimento}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      procedimento: e.target.value,
                    })
                  }
                  style={estiloCampo}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={estiloLabel}>Data</label>
                  <input
                    type="date"
                    required
                    value={form.data}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        data: e.target.value,
                      })
                    }
                    style={estiloCampo}
                  />
                </div>

                <div>
                  <label style={estiloLabel}>Horário</label>
                  <input
                    type="time"
                    required
                    value={form.horario}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        horario: e.target.value,
                      })
                    }
                    style={estiloCampo}
                  />
                </div>
              </div>

              <div>
                <label style={estiloLabel}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                  style={estiloCampo}
                >
                  <option value="Agendada">Agendada</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label style={estiloLabel}>Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      observacoes: e.target.value,
                    })
                  }
                  placeholder="Observações sobre a consulta..."
                  rows={3}
                  style={{
                    ...estiloCampo,
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  style={estiloBotaoCancelar}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={estiloBotaoSalvar}
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar Consulta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const estiloLabel = {
  fontSize: "0.875rem",
  color: "#cbd5e1",
  display: "block",
  marginBottom: "4px",
};

const estiloCampo = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  background: "#0f172a",
  color: "#fff",
  border: "1px solid #334155",
  boxSizing: "border-box",
};

const estiloBotaoCancelar = {
  padding: "8px 16px",
  borderRadius: "6px",
  background: "#334155",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const estiloBotaoSalvar = {
  padding: "8px 16px",
  borderRadius: "6px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

export default Consultas;
