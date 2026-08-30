import { useMemo, useState } from "react";

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
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Consultas.css";

function Consultas() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const [consultas, setConsultas] = useState([
    {
      id: 1,
      paciente: "Ana Souza",
      procedimento: "Limpeza",
      data: "29/08/2026",
      horario: "09:00",
      status: "Confirmada",
    },
    {
      id: 2,
      paciente: "Carlos Oliveira",
      procedimento: "Avaliação",
      data: "29/08/2026",
      horario: "10:30",
      status: "Aguardando",
    },
    {
      id: 3,
      paciente: "Mariana Santos",
      procedimento: "Restauração",
      data: "29/08/2026",
      horario: "14:00",
      status: "Concluída",
    },
    {
      id: 4,
      paciente: "Lucas Ferreira",
      procedimento: "Consulta de retorno",
      data: "30/08/2026",
      horario: "08:30",
      status: "Confirmada",
    },
    {
      id: 5,
      paciente: "Fernanda Lima",
      procedimento: "Clareamento",
      data: "30/08/2026",
      horario: "15:30",
      status: "Cancelada",
    },
  ]);

  const consultasFiltradas = useMemo(() => {
    return consultas.filter((consulta) => {
      const texto = busca.toLowerCase();

      const correspondeBusca =
        consulta.paciente.toLowerCase().includes(texto) ||
        consulta.procedimento.toLowerCase().includes(texto);

      const correspondeStatus =
        filtroStatus === "Todos" ||
        consulta.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, consultas]);

  const confirmadas = consultas.filter(
    (consulta) => consulta.status === "Confirmada"
  ).length;

  const aguardando = consultas.filter(
    (consulta) => consulta.status === "Aguardando"
  ).length;

  const concluidas = consultas.filter(
    (consulta) => consulta.status === "Concluída"
  ).length;

  const canceladas = consultas.filter(
    (consulta) => consulta.status === "Cancelada"
  ).length;

  function getStatusClass(status) {
    switch (status) {
      case "Confirmada":
        return "consulta-status-confirmada";

      case "Aguardando":
        return "consulta-status-aguardando";

      case "Concluída":
        return "consulta-status-concluida";

      case "Cancelada":
        return "consulta-status-cancelada";

      default:
        return "";
    }
  }

  function excluirConsulta(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta consulta?"
    );

    if (!confirmar) {
      return;
    }

    setConsultas((consultasAtuais) =>
      consultasAtuais.filter(
        (consulta) => consulta.id !== id
      )
    );
  }

  return (
    <div className="consultas-page">

      {/* TOPO */}

      <header className="consultas-page-header">
        <div>
          <h1>Consultas</h1>

          <p>
            Gerencie e acompanhe as consultas dos seus pacientes.
          </p>
        </div>

        <Link
          to="/consultas"
          className="btn-nova-consulta"
        >
          Nova consulta
        </Link>
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
            <span>Aguardando</span>

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

              <p>
                Visualize e gerencie os atendimentos.
              </p>
            </div>

          </div>

          <div className="consultas-filtros">

            <div className="consultas-busca">

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
              value={filtroStatus}
              onChange={(event) =>
                setFiltroStatus(event.target.value)
              }
            >
              <option value="Todos">
                Todos os status
              </option>

              <option value="Confirmada">
                Confirmadas
              </option>

              <option value="Aguardando">
                Aguardando
              </option>

              <option value="Concluída">
                Concluídas
              </option>

              <option value="Cancelada">
                Canceladas
              </option>
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
                          {consulta.paciente
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {consulta.paciente}
                          </strong>

                          <span>Paciente</span>
                        </div>

                      </div>

                    </td>

                    <td>
                      {consulta.procedimento}
                    </td>

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
                          className="consulta-action visualizar"
                          title="Visualizar"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="consulta-action editar"
                          title="Editar"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="consulta-action excluir"
                          title="Excluir"
                          onClick={() =>
                            excluirConsulta(consulta.id)
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
                    className="consultas-sem-resultado"
                  >

                    <Search size={30} />

                    <strong>
                      Nenhuma consulta encontrada
                    </strong>

                    <span>
                      Tente pesquisar outro paciente
                      ou alterar o filtro.
                    </span>

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default Consultas;