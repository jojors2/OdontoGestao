import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  CalendarDays,
} from "lucide-react";

import "./Pacientes.css";

function Pacientes() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState(null);

  const [pacientes, setPacientes] = useState([
    {
      id: 1,
      nome: "Ana Paula Silva",
      telefone: "(11) 99999-1234",
      email: "ana@email.com",
      nascimento: "1998-05-14",
      ultimaConsulta: "20/08/2026",
      status: "Ativo",
    },
    {
      id: 2,
      nome: "Carlos Henrique",
      telefone: "(11) 98888-4321",
      email: "carlos@email.com",
      nascimento: "1987-11-03",
      ultimaConsulta: "15/08/2026",
      status: "Ativo",
    },
    {
      id: 3,
      nome: "Mariana Souza",
      telefone: "(11) 97777-7890",
      email: "mariana@email.com",
      nascimento: "2001-01-22",
      ultimaConsulta: "02/07/2026",
      status: "Inativo",
    },
    {
      id: 4,
      nome: "João Pedro Santos",
      telefone: "(11) 96666-4567",
      email: "joao@email.com",
      nascimento: "1995-09-10",
      ultimaConsulta: "28/08/2026",
      status: "Ativo",
    },
  ]);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    nascimento: "",
    status: "Ativo",
  });

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return pacientes.filter((paciente) => {
      const correspondeBusca =
        paciente.nome.toLowerCase().includes(termo) ||
        paciente.telefone.toLowerCase().includes(termo) ||
        paciente.email.toLowerCase().includes(termo);

      const correspondeStatus =
        filtroStatus === "Todos" ||
        paciente.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, pacientes]);

  const totalAtivos = pacientes.filter(
    (paciente) => paciente.status === "Ativo"
  ).length;

  const totalInativos = pacientes.filter(
    (paciente) => paciente.status === "Inativo"
  ).length;

  function abrirNovoPaciente() {
    setPacienteEditando(null);

    setForm({
      nome: "",
      telefone: "",
      email: "",
      nascimento: "",
      status: "Ativo",
    });

    setModalAberto(true);
  }

  function abrirEdicao(paciente) {
    setPacienteEditando(paciente);

    setForm({
      nome: paciente.nome,
      telefone: paciente.telefone,
      email: paciente.email,
      nascimento: paciente.nascimento,
      status: paciente.status,
    });

    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setPacienteEditando(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }));
  }

  function salvarPaciente(event) {
    event.preventDefault();

    if (pacienteEditando) {
      setPacientes((pacientesAnteriores) =>
        pacientesAnteriores.map((paciente) =>
          paciente.id === pacienteEditando.id
            ? {
                ...paciente,
                ...form,
              }
            : paciente
        )
      );
    } else {
      const novoPaciente = {
        id: Date.now(),
        ...form,
        ultimaConsulta: "Nenhuma",
      };

      setPacientes((pacientesAnteriores) => [
        ...pacientesAnteriores,
        novoPaciente,
      ]);
    }

    fecharModal();
  }

  function excluirPaciente(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este paciente?"
    );

    if (!confirmar) return;

    setPacientes((pacientesAnteriores) =>
      pacientesAnteriores.filter(
        (paciente) => paciente.id !== id
      )
    );
  }

  function pegarIniciais(nome) {
    const partes = nome.trim().split(" ");

    if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }

    return (
      partes[0][0] + partes[partes.length - 1][0]
    ).toUpperCase();
  }

  function formatarNascimento(data) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  return (
    <div className="pacientes-page">

      {/* CABEÇALHO */}

      <div className="pacientes-topo">
        <div>
          <h1>Pacientes</h1>
          <p>
            Gerencie os pacientes cadastrados na clínica.
          </p>
        </div>

        <button
          className="pacientes-novo-btn"
          onClick={abrirNovoPaciente}
        >
          <Plus size={19} />

          Novo paciente
        </button>
      </div>

      {/* CARDS */}

      <div className="pacientes-cards">

        <div className="pacientes-card">
          <div className="pacientes-card-icon total">
            <Users size={23} />
          </div>

          <div className="pacientes-card-info">
            <span>Total de pacientes</span>

            <strong>{pacientes.length}</strong>
          </div>
        </div>

        <div className="pacientes-card">
          <div className="pacientes-card-icon ativo">
            <UserCheck size={23} />
          </div>

          <div className="pacientes-card-info">
            <span>Pacientes ativos</span>

            <strong>{totalAtivos}</strong>
          </div>
        </div>

        <div className="pacientes-card">
          <div className="pacientes-card-icon inativo">
            <UserX size={23} />
          </div>

          <div className="pacientes-card-info">
            <span>Pacientes inativos</span>

            <strong>{totalInativos}</strong>
          </div>
        </div>

      </div>

      {/* LISTAGEM */}

      <div className="pacientes-lista">

        <div className="pacientes-lista-header">

          <div>
            <h2>Lista de pacientes</h2>

            <p>
              Visualize e gerencie os pacientes da clínica.
            </p>
          </div>

          <span className="pacientes-quantidade">
            {pacientesFiltrados.length} pacientes
          </span>

        </div>

        {/* FILTROS */}

        <div className="pacientes-filtros">

          <div className="pacientes-busca">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar paciente..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />
          </div>

          <select
            className="pacientes-filtro-status"
            value={filtroStatus}
            onChange={(event) =>
              setFiltroStatus(event.target.value)
            }
          >
            <option value="Todos">Todos</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
          </select>

        </div>

        {/* TABELA */}

        <div className="pacientes-tabela-container">

          <table className="pacientes-tabela">

            <thead>
              <tr>
                <th>Paciente</th>
                <th>Contato</th>
                <th>Nascimento</th>
                <th>Última consulta</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>

              {pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((paciente) => (

                  <tr key={paciente.id}>

                    {/* PACIENTE */}

                    <td>
                      <div className="paciente-identidade">

                        <div className="paciente-avatar">
                          {pegarIniciais(paciente.nome)}
                        </div>

                        <div className="paciente-nome">
                          <strong>{paciente.nome}</strong>

                          <span>
                            Paciente #{paciente.id}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* CONTATO */}

                    <td>
                      <div className="paciente-contato">

                        <span>
                          <Phone size={14} />

                          {paciente.telefone}
                        </span>

                        <span>
                          <Mail size={14} />

                          {paciente.email}
                        </span>

                      </div>
                    </td>

                    {/* NASCIMENTO */}

                    <td>
                      <div className="paciente-data">
                        <CalendarDays size={15} />

                        {formatarNascimento(
                          paciente.nascimento
                        )}
                      </div>
                    </td>

                    {/* CONSULTA */}

                    <td>
                      {paciente.ultimaConsulta}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`paciente-status ${
                          paciente.status === "Ativo"
                            ? "paciente-status-ativo"
                            : "paciente-status-inativo"
                        }`}
                      >
                        {paciente.status}
                      </span>
                    </td>

                    {/* AÇÕES */}

                    <td>
                      <div className="paciente-acoes">

                        <button
                          className="paciente-editar"
                          onClick={() =>
                            abrirEdicao(paciente)
                          }
                          title="Editar paciente"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="paciente-excluir"
                          onClick={() =>
                            excluirPaciente(paciente.id)
                          }
                          title="Excluir paciente"
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
                    className="pacientes-vazio"
                  >
                    <Users size={35} />

                    <strong>
                      Nenhum paciente encontrado
                    </strong>

                    <span>
                      Tente alterar sua busca ou filtro.
                    </span>
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}

      {modalAberto && (

        <div
          className="paciente-modal-overlay"
          onMouseDown={fecharModal}
        >

          <div
            className="paciente-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="paciente-modal-header">

              <div>
                <h2>
                  {pacienteEditando
                    ? "Editar paciente"
                    : "Novo paciente"}
                </h2>

                <p>
                  Preencha os dados do paciente.
                </p>
              </div>

              <button
                className="paciente-modal-fechar"
                onClick={fecharModal}
                type="button"
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={salvarPaciente}>

              <div className="paciente-form-group">

                <label>Nome completo</label>

                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Digite o nome do paciente"
                  required
                />

              </div>

              <div className="paciente-form-grid">

                <div className="paciente-form-group">

                  <label>Telefone</label>

                  <input
                    type="text"
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    required
                  />

                </div>

                <div className="paciente-form-group">

                  <label>Data de nascimento</label>

                  <input
                    type="date"
                    name="nascimento"
                    value={form.nascimento}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              <div className="paciente-form-group">

                <label>E-mail</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="paciente@email.com"
                />

              </div>

              <div className="paciente-form-group">

                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Ativo">
                    Ativo
                  </option>

                  <option value="Inativo">
                    Inativo
                  </option>
                </select>

              </div>

              <div className="paciente-modal-actions">

                <button
                  type="button"
                  className="paciente-cancelar-btn"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="paciente-salvar-btn"
                >
                  {pacienteEditando
                    ? "Salvar alterações"
                    : "Cadastrar paciente"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Pacientes;