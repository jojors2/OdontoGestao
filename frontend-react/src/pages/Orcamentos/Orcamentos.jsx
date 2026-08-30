import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Clock3,
  CircleDollarSign,
  BadgeCheck,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import "./Orcamentos.css";

function Orcamentos() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);

  const [orcamentos, setOrcamentos] = useState([
    {
      id: 1,
      paciente: "Ana Souza",
      procedimento: "Clareamento dental",
      data: "29/08/2026",
      valor: 850,
      status: "Pendente",
    },
    {
      id: 2,
      paciente: "Carlos Mendes",
      procedimento: "Implante dentário",
      data: "28/08/2026",
      valor: 3200,
      status: "Aprovado",
    },
    {
      id: 3,
      paciente: "Mariana Lima",
      procedimento: "Tratamento de canal",
      data: "27/08/2026",
      valor: 1200,
      status: "Recusado",
    },
    {
      id: 4,
      paciente: "João Pereira",
      procedimento: "Limpeza",
      data: "26/08/2026",
      valor: 250,
      status: "Aprovado",
    },
  ]);

  const [novoOrcamento, setNovoOrcamento] = useState({
    paciente: "",
    procedimento: "",
    data: "",
    valor: "",
    status: "Pendente",
  });

  const formatarValor = (valor) => {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const orcamentosFiltrados = useMemo(() => {
    return orcamentos.filter((orcamento) => {
      const textoBusca = busca.toLowerCase();

      const correspondeBusca =
        orcamento.paciente.toLowerCase().includes(textoBusca) ||
        orcamento.procedimento.toLowerCase().includes(textoBusca);

      const correspondeStatus =
        filtroStatus === "Todos" ||
        orcamento.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [orcamentos, busca, filtroStatus]);

  const totalOrcamentos = orcamentos.length;

  const pendentes = orcamentos.filter(
    (orcamento) => orcamento.status === "Pendente"
  ).length;

  const aprovados = orcamentos.filter(
    (orcamento) => orcamento.status === "Aprovado"
  ).length;

  const valorAprovado = orcamentos
    .filter((orcamento) => orcamento.status === "Aprovado")
    .reduce((total, orcamento) => total + Number(orcamento.valor), 0);

  const abrirModal = () => {
    setNovoOrcamento({
      paciente: "",
      procedimento: "",
      data: "",
      valor: "",
      status: "Pendente",
    });

    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setNovoOrcamento((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const salvarOrcamento = (event) => {
    event.preventDefault();

    const novo = {
      ...novoOrcamento,
      id: Date.now(),
      valor: Number(novoOrcamento.valor),
      data: new Date(
        `${novoOrcamento.data}T00:00:00`
      ).toLocaleDateString("pt-BR"),
    };

    setOrcamentos((anteriores) => [novo, ...anteriores]);

    fecharModal();
  };

  const excluirOrcamento = (id) => {
    setOrcamentos((anteriores) =>
      anteriores.filter((orcamento) => orcamento.id !== id)
    );
  };

  return (
    <div className="orcamentos-page">
      {/* =========================
          TÍTULO
      ========================== */}

      <div className="orcamentos-page-header">
        <div>
          <h1>Orçamentos</h1>

          <p>
            Crie e acompanhe os orçamentos dos seus pacientes.
          </p>
        </div>

        <button
          className="orcamentos-btn-primary"
          onClick={abrirModal}
        >
          <Plus size={19} />

          Novo orçamento
        </button>
      </div>

      {/* =========================
          CARDS
      ========================== */}

      <section className="orcamentos-cards">
        <article className="orcamentos-card">
          <div className="orcamentos-card-icon azul">
            <FileText size={22} />
          </div>

          <div className="orcamentos-card-info">
            <span>Total de orçamentos</span>
            <strong>{totalOrcamentos}</strong>
          </div>
        </article>

        <article className="orcamentos-card">
          <div className="orcamentos-card-icon amarelo">
            <Clock3 size={22} />
          </div>

          <div className="orcamentos-card-info">
            <span>Pendentes</span>
            <strong>{pendentes}</strong>
          </div>
        </article>

        <article className="orcamentos-card">
          <div className="orcamentos-card-icon verde">
            <BadgeCheck size={22} />
          </div>

          <div className="orcamentos-card-info">
            <span>Aprovados</span>
            <strong>{aprovados}</strong>
          </div>
        </article>

        <article className="orcamentos-card">
          <div className="orcamentos-card-icon roxo">
            <CircleDollarSign size={22} />
          </div>

          <div className="orcamentos-card-info">
            <span>Valor aprovado</span>
            <strong>{formatarValor(valorAprovado)}</strong>
          </div>
        </article>
      </section>

      {/* =========================
          LISTAGEM
      ========================== */}

      <section className="orcamentos-lista">
        <div className="orcamentos-lista-header">
          <div>
            <h2>Lista de orçamentos</h2>
            <p>
              Consulte e gerencie os orçamentos cadastrados.
            </p>
          </div>

          <div className="orcamentos-filtros">
            <div className="orcamentos-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar paciente..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(event) =>
                setFiltroStatus(event.target.value)
              }
            >
              <option value="Todos">Todos</option>
              <option value="Pendente">Pendentes</option>
              <option value="Aprovado">Aprovados</option>
              <option value="Recusado">Recusados</option>
            </select>
          </div>
        </div>

        <div className="orcamentos-table-wrapper">
          <table className="orcamentos-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Procedimento</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {orcamentosFiltrados.length > 0 ? (
                orcamentosFiltrados.map((orcamento) => (
                  <tr key={orcamento.id}>
                    <td data-label="Paciente">
                      <div className="orcamentos-paciente">
                        <div className="orcamentos-avatar">
                          {orcamento.paciente
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>{orcamento.paciente}</span>
                      </div>
                    </td>

                    <td data-label="Procedimento">
                      {orcamento.procedimento}
                    </td>

                    <td data-label="Data">
                      {orcamento.data}
                    </td>

                    <td
                      data-label="Valor"
                      className="orcamentos-valor"
                    >
                      {formatarValor(orcamento.valor)}
                    </td>

                    <td data-label="Status">
                      <span
                        className={`orcamentos-status ${orcamento.status.toLowerCase()}`}
                      >
                        {orcamento.status}
                      </span>
                    </td>

                    <td data-label="Ações">
                      <div className="orcamentos-acoes">
                        <button
                          className="orcamentos-acao visualizar"
                          title="Visualizar"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="orcamentos-acao editar"
                          title="Editar"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="orcamentos-acao excluir"
                          title="Excluir"
                          onClick={() =>
                            excluirOrcamento(orcamento.id)
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="orcamentos-vazio"
                  >
                    <FileText size={36} />

                    <strong>
                      Nenhum orçamento encontrado
                    </strong>

                    <span>
                      Tente alterar os filtros ou cadastrar um
                      novo orçamento.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================
          MODAL
      ========================== */}

      {modalAberto && (
        <div
          className="orcamentos-modal-overlay"
          onMouseDown={fecharModal}
        >
          <div
            className="orcamentos-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="orcamentos-modal-header">
              <div>
                <h2>Novo orçamento</h2>
                <p>
                  Preencha os dados do novo orçamento.
                </p>
              </div>

              <button
                className="orcamentos-modal-close"
                onClick={fecharModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="orcamentos-form"
              onSubmit={salvarOrcamento}
            >
              <div className="orcamentos-form-group full">
                <label>Paciente</label>

                <input
                  type="text"
                  name="paciente"
                  placeholder="Nome do paciente"
                  value={novoOrcamento.paciente}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="orcamentos-form-group full">
                <label>Procedimento</label>

                <input
                  type="text"
                  name="procedimento"
                  placeholder="Ex: Clareamento dental"
                  value={novoOrcamento.procedimento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="orcamentos-form-group">
                <label>Data</label>

                <input
                  type="date"
                  name="data"
                  value={novoOrcamento.data}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="orcamentos-form-group">
                <label>Valor</label>

                <input
                  type="number"
                  name="valor"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={novoOrcamento.valor}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="orcamentos-form-group full">
                <label>Status</label>

                <select
                  name="status"
                  value={novoOrcamento.status}
                  onChange={handleChange}
                >
                  <option value="Pendente">
                    Pendente
                  </option>

                  <option value="Aprovado">
                    Aprovado
                  </option>

                  <option value="Recusado">
                    Recusado
                  </option>
                </select>
              </div>

              <div className="orcamentos-modal-footer">
                <button
                  type="button"
                  className="orcamentos-btn-secondary"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="orcamentos-btn-primary"
                >
                  <Save size={18} />

                  Salvar orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orcamentos;