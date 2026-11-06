import { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Search,
  Clock3,
  CalendarDays,
  UserRound,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";

import "./Lembretes.css";

function Lembretes() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [lembreteEditando, setLembreteEditando] = useState(null);
  const [lembretes, setLembretes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [formulario, setFormulario] = useState({
    titulo: "",
    paciente: "",
    data: new Date().toISOString().slice(0, 10),
    hora: "10:00",
    prioridade: "Média",
    descricao: "",
  });

  async function carregarLembretes() {
    try {
      setCarregando(true);
      const res = await fetch("http://localhost:3001/api/lembretes");
      if (res.ok) {
        const dados = await res.json();
        setLembretes(dados);
      }
    } catch (err) {
      console.error("Erro ao carregar lembretes:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLembretes();
  }, []);

  function formatarData(data) {
    if (!data) return "";
    const partes = data.split("-");
    if (partes.length === 3) {
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    }
    return data;
  }

  function abrirNovoLembrete() {
    setLembreteEditando(null);

    setFormulario({
      titulo: "",
      paciente: "",
      data: new Date().toISOString().slice(0, 10),
      hora: "10:00",
      prioridade: "Média",
      descricao: "",
    });

    setModalAberto(true);
  }

  function abrirEdicao(lembrete) {
    setLembreteEditando(lembrete);

    setFormulario({
      titulo: lembrete.titulo,
      paciente: lembrete.paciente || "",
      data: lembrete.data,
      hora: lembrete.hora || "",
      prioridade: lembrete.prioridade || "Média",
      descricao: lembrete.descricao || "",
    });

    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setLembreteEditando(null);
  }

  function atualizarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }));
  }

  async function salvarLembrete(event) {
    event.preventDefault();

    if (!formulario.titulo || !formulario.data || !formulario.hora) {
      return;
    }

    try {
      if (lembreteEditando) {
        const res = await fetch(`http://localhost:3001/api/lembretes/${lembreteEditando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formulario),
        });

        if (res.ok) {
          const atualizado = await res.json();
          setLembretes((lista) =>
            lista.map((l) => (l.id === atualizado.id ? atualizado : l))
          );
        }
      } else {
        const res = await fetch("http://localhost:3001/api/lembretes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formulario),
        });

        if (res.ok) {
          const novo = await res.json();
          setLembretes((lista) => [novo, ...lista]);
        }
      }

      fecharModal();
    } catch (err) {
      console.error("Erro ao salvar lembrete:", err);
    }
  }

  async function alternarConcluido(id) {
    try {
      const res = await fetch(`http://localhost:3001/api/lembretes/${id}/toggle`, {
        method: "PATCH",
      });

      if (res.ok) {
        const atualizado = await res.json();
        setLembretes((lista) =>
          lista.map((l) => (l.id === id ? { ...l, concluido: atualizado.concluido } : l))
        );
      }
    } catch (err) {
      console.error("Erro ao alternar status do lembrete:", err);
    }
  }

  async function excluirLembrete(id) {
    const confirmar = window.confirm("Deseja realmente excluir este lembrete?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:3001/api/lembretes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLembretes((lista) => lista.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir lembrete:", err);
    }
  }

  const lembretesFiltrados = lembretes.filter((lembrete) => {
    const textoBusca = busca.toLowerCase();
    const titulo = (lembrete.titulo || "").toLowerCase();
    const paciente = (lembrete.paciente || "").toLowerCase();
    const descricao = (lembrete.descricao || "").toLowerCase();

    const correspondeBusca =
      titulo.includes(textoBusca) ||
      paciente.includes(textoBusca) ||
      descricao.includes(textoBusca);

    const correspondeFiltro =
      filtro === "Todos" ||
      (filtro === "Pendentes" && !lembrete.concluido) ||
      (filtro === "Concluídos" && lembrete.concluido);

    return correspondeBusca && correspondeFiltro;
  });

  const pendentes = lembretes.filter((lembrete) => !lembrete.concluido).length;
  const concluidos = lembretes.filter((lembrete) => lembrete.concluido).length;
  const prioridadeAlta = lembretes.filter(
    (lembrete) => lembrete.prioridade === "Alta" && !lembrete.concluido
  ).length;

  return (
    <div className="lembretes-page">
      {/* CABEÇALHO */}
      <div className="lembretes-page-header">
        <div className="lembretes-page-title">
          <h1>Lembretes</h1>
          <p>Organize tarefas e acompanhe lembretes importantes salvos no banco de dados.</p>
        </div>

        <button className="lembretes-primary-button" onClick={abrirNovoLembrete}>
          <Plus size={19} />
          <span>Novo lembrete</span>
        </button>
      </div>

      {/* CARDS */}
      <div className="lembretes-stats">
        <div className="lembretes-stat-card">
          <div className="lembretes-stat-icon lembretes-icon-blue">
            <Bell size={22} />
          </div>

          <div className="lembretes-stat-info">
            <span>Total de lembretes</span>
            <strong>{lembretes.length}</strong>
          </div>
        </div>

        <div className="lembretes-stat-card">
          <div className="lembretes-stat-icon lembretes-icon-orange">
            <Clock3 size={22} />
          </div>

          <div className="lembretes-stat-info">
            <span>Pendentes</span>
            <strong>{pendentes}</strong>
          </div>
        </div>

        <div className="lembretes-stat-card">
          <div className="lembretes-stat-icon lembretes-icon-green">
            <CheckCircle2 size={22} />
          </div>

          <div className="lembretes-stat-info">
            <span>Concluídos</span>
            <strong>{concluidos}</strong>
          </div>
        </div>

        <div className="lembretes-stat-card">
          <div className="lembretes-stat-icon lembretes-icon-red">
            <AlertCircle size={22} />
          </div>

          <div className="lembretes-stat-info">
            <span>Prioridade alta</span>
            <strong>{prioridadeAlta}</strong>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <section className="lembretes-panel">
        <div className="lembretes-panel-header">
          <div>
            <h2>Meus lembretes</h2>
            <p>Visualize e organize as tarefas cadastradas.</p>
          </div>

          <span className="lembretes-total">
            {lembretesFiltrados.length} lembrete
            {lembretesFiltrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* PESQUISA E FILTRO */}
        <div className="lembretes-toolbar">
          <div className="lembretes-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Buscar por lembrete ou paciente..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <div className="lembretes-filter">
            {["Todos", "Pendentes", "Concluídos"].map((opcao) => (
              <button
                key={opcao}
                className={filtro === opcao ? "lembretes-filter-active" : ""}
                onClick={() => setFiltro(opcao)}
              >
                {opcao}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA */}
        <div className="lembretes-list">
          {lembretesFiltrados.length > 0 ? (
            lembretesFiltrados.map((lembrete) => (
              <article
                key={lembrete.id}
                className={`lembrete-item ${
                  lembrete.concluido ? "lembrete-item-concluido" : ""
                }`}
              >
                <button
                  className={`lembrete-check ${
                    lembrete.concluido ? "lembrete-check-active" : ""
                  }`}
                  onClick={() => alternarConcluido(lembrete.id)}
                  aria-label="Marcar lembrete como concluído"
                >
                  {lembrete.concluido ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div className="lembrete-main">
                  <div className="lembrete-main-header">
                    <div className="lembrete-title-area">
                      <div className="lembrete-title-line">
                        <h3>{lembrete.titulo}</h3>
                        <span
                          className={`lembrete-priority lembrete-priority-${(
                            lembrete.prioridade || "média"
                          ).toLowerCase()}`}
                        >
                          {lembrete.prioridade}
                        </span>
                      </div>
                      <p>{lembrete.descricao}</p>
                    </div>

                    <div className="lembrete-actions">
                      <button
                        className="lembrete-action-button"
                        title="Editar"
                        onClick={() => abrirEdicao(lembrete)}
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        className="lembrete-action-button lembrete-delete-button"
                        title="Excluir"
                        onClick={() => excluirLembrete(lembrete.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="lembrete-details">
                    {lembrete.paciente && (
                      <div className="lembrete-detail">
                        <UserRound size={16} />
                        <span>{lembrete.paciente}</span>
                      </div>
                    )}

                    <div className="lembrete-detail">
                      <CalendarDays size={16} />
                      <span>{formatarData(lembrete.data)}</span>
                    </div>

                    <div className="lembrete-detail">
                      <Clock3 size={16} />
                      <span>{lembrete.hora}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="lembretes-empty">
              <div className="lembretes-empty-icon">
                <Bell size={31} />
              </div>
              <h3>Nenhum lembrete encontrado</h3>
              <p>
                {carregando
                  ? "Carregando lembretes do banco..."
                  : "Não encontramos lembretes correspondentes aos filtros selecionados."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {modalAberto && (
        <div className="lembretes-modal-overlay" onMouseDown={fecharModal}>
          <div
            className="lembretes-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="lembretes-modal-header">
              <div>
                <h2>{lembreteEditando ? "Editar lembrete" : "Novo lembrete"}</h2>
                <p>
                  {lembreteEditando
                    ? "Atualize as informações do lembrete."
                    : "Cadastre uma nova tarefa ou lembrete."}
                </p>
              </div>

              <button className="lembretes-modal-close" onClick={fecharModal}>
                <X size={21} />
              </button>
            </div>

            <form className="lembretes-form" onSubmit={salvarLembrete}>
              <div className="lembretes-form-group lembretes-form-full">
                <label htmlFor="titulo">
                  Título <span>*</span>
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  placeholder="Ex: Confirmar consulta"
                  value={formulario.titulo}
                  onChange={atualizarFormulario}
                  required
                />
              </div>

              <div className="lembretes-form-group lembretes-form-full">
                <label htmlFor="paciente">Paciente</label>
                <input
                  id="paciente"
                  name="paciente"
                  type="text"
                  placeholder="Nome do paciente"
                  value={formulario.paciente}
                  onChange={atualizarFormulario}
                />
              </div>

              <div className="lembretes-form-row">
                <div className="lembretes-form-group">
                  <label htmlFor="data">
                    Data <span>*</span>
                  </label>
                  <input
                    id="data"
                    name="data"
                    type="date"
                    value={formulario.data}
                    onChange={atualizarFormulario}
                    required
                  />
                </div>

                <div className="lembretes-form-group">
                  <label htmlFor="hora">
                    Horário <span>*</span>
                  </label>
                  <input
                    id="hora"
                    name="hora"
                    type="time"
                    value={formulario.hora}
                    onChange={atualizarFormulario}
                    required
                  />
                </div>
              </div>

              <div className="lembretes-form-group lembretes-form-full">
                <label htmlFor="prioridade">Prioridade</label>
                <select
                  id="prioridade"
                  name="prioridade"
                  value={formulario.prioridade}
                  onChange={atualizarFormulario}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className="lembretes-form-group lembretes-form-full">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  rows="4"
                  placeholder="Digite uma descrição..."
                  value={formulario.descricao}
                  onChange={atualizarFormulario}
                />
              </div>

              <div className="lembretes-modal-footer">
                <button
                  type="button"
                  className="lembretes-cancel-button"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="lembretes-save-button">
                  {lembreteEditando ? "Salvar alterações" : "Criar lembrete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lembretes;
