import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  UserRound,
  CircleCheck,
  CircleAlert,
} from "lucide-react";

import "./Agenda.css";
import {Link} from "react-router-dom"

function Agenda() {
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );

  const [diaSelecionado, setDiaSelecionado] = useState(hoje);

  /*
    Dados temporários.
    Depois vamos buscar isso no backend/banco de dados.
  */
  const consultas = [
    {
      id: 1,
      paciente: "Maria Silva",
      data: "2026-08-29",
      horario: "08:30",
      procedimento: "Limpeza",
      status: "Confirmada",
    },
    {
      id: 2,
      paciente: "João Santos",
      data: "2026-08-29",
      horario: "10:00",
      procedimento: "Avaliação",
      status: "Aguardando",
    },
    {
      id: 3,
      paciente: "Ana Oliveira",
      data: "2026-08-29",
      horario: "14:30",
      procedimento: "Restauração",
      status: "Confirmada",
    },
    {
      id: 4,
      paciente: "Carlos Souza",
      data: "2026-08-31",
      horario: "09:30",
      procedimento: "Retorno",
      status: "Confirmada",
    },
    {
      id: 5,
      paciente: "Fernanda Lima",
      data: "2026-09-02",
      horario: "15:00",
      procedimento: "Clareamento",
      status: "Aguardando",
    },
  ];

  const diasSemana = [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
  ];

  function formatarData(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  function mesmoDia(data1, data2) {
    return (
      data1.getDate() === data2.getDate() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getFullYear() === data2.getFullYear()
    );
  }

  function mesAnterior() {
    setMesAtual(
      new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() - 1,
        1
      )
    );
  }

  function proximoMes() {
    setMesAtual(
      new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() + 1,
        1
      )
    );
  }

  function irParaHoje() {
    setMesAtual(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      )
    );

    setDiaSelecionado(hoje);
  }

  /*
    Gera sempre 42 posições.
    Assim o calendário fica com 6 semanas e não muda
    de tamanho dependendo do mês.
  */
  const diasCalendario = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();

    const primeiroDiaMes = new Date(ano, mes, 1);

    const primeiroDiaCalendario = new Date(
      ano,
      mes,
      1 - primeiroDiaMes.getDay()
    );

    const dias = [];

    for (let i = 0; i < 42; i++) {
      const data = new Date(primeiroDiaCalendario);

      data.setDate(primeiroDiaCalendario.getDate() + i);

      dias.push(data);
    }

    return dias;
  }, [mesAtual]);

  const consultasSelecionadas = consultas
    .filter(
      (consulta) =>
        consulta.data === formatarData(diaSelecionado)
    )
    .sort((a, b) =>
      a.horario.localeCompare(b.horario)
    );

  const consultasDoMes = consultas.filter((consulta) => {
    const [ano, mes] = consulta.data
      .split("-")
      .map(Number);

    return (
      ano === mesAtual.getFullYear() &&
      mes === mesAtual.getMonth() + 1
    );
  });

  const consultasConfirmadas =
    consultasDoMes.filter(
      (consulta) => consulta.status === "Confirmada"
    ).length;

  const consultasAguardando =
    consultasDoMes.filter(
      (consulta) => consulta.status === "Aguardando"
    ).length;

  function selecionarDia(data) {
    setDiaSelecionado(data);

    if (
      data.getMonth() !== mesAtual.getMonth() ||
      data.getFullYear() !== mesAtual.getFullYear()
    ) {
      setMesAtual(
        new Date(
          data.getFullYear(),
          data.getMonth(),
          1
        )
      );
    }
  }

  function quantidadeConsultas(data) {
    const dataFormatada = formatarData(data);

    return consultas.filter(
      (consulta) => consulta.data === dataFormatada
    ).length;
  }

  const nomeMes = mesAtual.toLocaleDateString(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    }
  );

  const tituloDiaSelecionado =
    diaSelecionado.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

  return (
    <div className="agenda-page">
      {/* TOPO */}
      <div className="agenda-header">
        <div>
          <h1>Agenda</h1>

          <p>
            Visualize e organize os atendimentos da clínica.
          </p>
        </div>

        <Link to="/consultas" className="btn-nova-consulta">
          Nova consulta
        </Link>
      </div>

      {/* RESUMO */}
      <div className="agenda-summary">
        <div className="agenda-summary-card">
          <div className="agenda-summary-icon agenda-icon-blue">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Consultas no mês</span>

            <strong>
              {consultasDoMes.length}
            </strong>
          </div>
        </div>

        <div className="agenda-summary-card">
          <div className="agenda-summary-icon agenda-icon-green">
            <CircleCheck size={22} />
          </div>

          <div>
            <span>Confirmadas</span>

            <strong>
              {consultasConfirmadas}
            </strong>
          </div>
        </div>

        <div className="agenda-summary-card">
          <div className="agenda-summary-icon agenda-icon-orange">
            <CircleAlert size={22} />
          </div>

          <div>
            <span>Aguardando</span>

            <strong>
              {consultasAguardando}
            </strong>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="agenda-layout">
        {/* CALENDÁRIO */}
        <section className="agenda-card agenda-calendar">
          <div className="agenda-calendar-header">
            <div>
              <span className="agenda-card-subtitle">
                Calendário
              </span>

              <h2>{nomeMes}</h2>
            </div>

            <div className="agenda-calendar-actions">
              <button
                className="agenda-today-button"
                onClick={irParaHoje}
              >
                Hoje
              </button>

              <button
                className="agenda-arrow-button"
                onClick={mesAnterior}
                aria-label="Mês anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                className="agenda-arrow-button"
                onClick={proximoMes}
                aria-label="Próximo mês"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="agenda-week-header">
            {diasSemana.map((dia) => (
              <div key={dia}>{dia}</div>
            ))}
          </div>

          <div className="agenda-calendar-grid">
            {diasCalendario.map((data) => {
              const foraDoMes =
                data.getMonth() !==
                mesAtual.getMonth();

              const selecionado =
                mesmoDia(
                  data,
                  diaSelecionado
                );

              const diaHoje =
                mesmoDia(data, hoje);

              const total =
                quantidadeConsultas(data);

              return (
                <button
                  type="button"
                  key={formatarData(data)}
                  className={`
                    agenda-calendar-day
                    ${
                      foraDoMes
                        ? "agenda-day-outside"
                        : ""
                    }
                    ${
                      selecionado
                        ? "agenda-day-selected"
                        : ""
                    }
                  `}
                  onClick={() =>
                    selecionarDia(data)
                  }
                >
                  <span
                    className={`
                      agenda-day-number
                      ${
                        diaHoje
                          ? "agenda-day-today"
                          : ""
                      }
                    `}
                  >
                    {data.getDate()}
                  </span>

                  {total > 0 && (
                    <div className="agenda-day-consultas">
                      <span />

                      <p>
                        {total}{" "}
                        {total === 1
                          ? "consulta"
                          : "consultas"}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* CONSULTAS DO DIA */}
        <aside className="agenda-card agenda-day-panel">
          <div className="agenda-day-panel-header">
            <span className="agenda-card-subtitle">
              Consultas do dia
            </span>

            <h2>
              {tituloDiaSelecionado}
            </h2>

            <p>
              {consultasSelecionadas.length}{" "}
              {consultasSelecionadas.length === 1
                ? "atendimento"
                : "atendimentos"}
            </p>
          </div>

          <div className="agenda-appointments">
            {consultasSelecionadas.length > 0 ? (
              consultasSelecionadas.map(
                (consulta) => (
                  <article
                    className="agenda-appointment"
                    key={consulta.id}
                  >
                    <div className="agenda-appointment-top">
                      <div className="agenda-time">
                        <Clock3 size={16} />

                        <span>
                          {consulta.horario}
                        </span>
                      </div>

                      <span
                        className={`agenda-status ${
                          consulta.status ===
                          "Confirmada"
                            ? "agenda-status-confirmada"
                            : "agenda-status-aguardando"
                        }`}
                      >
                        {consulta.status}
                      </span>
                    </div>

                    <div className="agenda-patient">
                      <div className="agenda-patient-avatar">
                        <UserRound size={20} />
                      </div>

                      <div>
                        <h3>
                          {consulta.paciente}
                        </h3>

                        <p>
                          {
                            consulta.procedimento
                          }
                        </p>
                      </div>
                    </div>
                  </article>
                )
              )
            ) : (
              <div className="agenda-empty">
                <div className="agenda-empty-icon">
                  <CalendarDays size={28} />
                </div>

                <h3>
                  Nenhuma consulta
                </h3>

                <p>
                  Não existem atendimentos
                  agendados para este dia.
                </p>

                <button className="agenda-empty-button">
                  <Plus size={17} />

                  Agendar consulta
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Agenda;