import { useState } from "react";

import {
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  Save,
  Settings,
  UserRound,
} from "lucide-react";

import "./Configurações.css";

function Configuracoes() {
  const [mensagem, setMensagem] = useState("");

  const [clinica, setClinica] = useState({
    nome: "OdontoGestão",
    telefone: "",
    email: "",
    endereco: "",
  });

  const [profissional, setProfissional] = useState({
    nome: "",
    cro: "",
    especialidade: "",
    telefone: "",
  });

  const [agenda, setAgenda] = useState({
    inicio: "08:00",
    fim: "18:00",
    intervaloInicio: "12:00",
    intervaloFim: "13:00",
    duracao: "30",
  });

  const [preferencias, setPreferencias] = useState({
    lembretes: true,
    confirmacaoConsulta: true,
    consultasCanceladas: false,
  });

  function handleClinicaChange(event) {
    const { name, value } = event.target;

    setClinica((dadosAnteriores) => ({
      ...dadosAnteriores,
      [name]: value,
    }));
  }

  function handleProfissionalChange(event) {
    const { name, value } = event.target;

    setProfissional((dadosAnteriores) => ({
      ...dadosAnteriores,
      [name]: value,
    }));
  }

  function handleAgendaChange(event) {
    const { name, value } = event.target;

    setAgenda((dadosAnteriores) => ({
      ...dadosAnteriores,
      [name]: value,
    }));
  }

  function handlePreferenciasChange(event) {
    const { name, checked } = event.target;

    setPreferencias((dadosAnteriores) => ({
      ...dadosAnteriores,
      [name]: checked,
    }));
  }

  function salvarConfiguracoes(event) {
    event.preventDefault();

    const configuracoes = {
      clinica,
      profissional,
      agenda,
      preferencias,
    };

    console.log("Configurações:", configuracoes);

    setMensagem("Configurações salvas com sucesso!");

    setTimeout(() => {
      setMensagem("");
    }, 3000);
  }

  return (
    <div className="configuracoes-page">
      {/* TOPO */}
      <div className="configuracoes-topo">
        <div className="configuracoes-titulo">
          

          <div>
            <h1>Configurações</h1>

            <p>
              Gerencie os dados da clínica e as preferências do sistema.
            </p>
          </div>
        </div>

        <button
          type="submit"
          form="configuracoes-form"
          className="configuracoes-salvar"
        >
          <Save size={18} />

          <span>Salvar alterações</span>
        </button>
      </div>

      {/* MENSAGEM */}
      {mensagem && (
        <div className="configuracoes-mensagem">
          <CheckCircle2 size={19} />

          <span>{mensagem}</span>
        </div>
      )}

      <form
        id="configuracoes-form"
        onSubmit={salvarConfiguracoes}
        className="configuracoes-grid"
      >
        {/* DADOS PROFISSIONAIS */}
        <section className="configuracoes-card">
          <div className="configuracoes-card-header">
            <div className="configuracoes-card-icon">
              <UserRound size={21} />
            </div>

            <div>
              <h2>Dados profissionais</h2>

              <p>Informações da dentista responsável.</p>
            </div>
          </div>

          <div className="configuracoes-form-grid">
            <div className="configuracoes-campo campo-completo">
              <label htmlFor="nomeProfissional">
                Nome completo
              </label>

              <input
                id="nomeProfissional"
                type="text"
                name="nome"
                placeholder="Nome da profissional"
                value={profissional.nome}
                onChange={handleProfissionalChange}
              />
            </div>

            <div className="configuracoes-campo">
              <label htmlFor="cro">
                CRO
              </label>

              <input
                id="cro"
                type="text"
                name="cro"
                placeholder="CRO-SP 00000"
                value={profissional.cro}
                onChange={handleProfissionalChange}
              />
            </div>

            <div className="configuracoes-campo">
              <label htmlFor="especialidade">
                Especialidade
              </label>

              <input
                id="especialidade"
                type="text"
                name="especialidade"
                placeholder="Ex: Clínica Geral"
                value={profissional.especialidade}
                onChange={handleProfissionalChange}
              />
            </div>

            <div className="configuracoes-campo campo-completo">
              <label htmlFor="telefoneProfissional">
                Telefone
              </label>

              <input
                id="telefoneProfissional"
                type="tel"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={profissional.telefone}
                onChange={handleProfissionalChange}
              />
            </div>
          </div>
        </section>

        {/* DADOS DA CLÍNICA */}
        <section className="configuracoes-card">
          <div className="configuracoes-card-header">
            <div className="configuracoes-card-icon">
              <Building2 size={21} />
            </div>

            <div>
              <h2>Dados da clínica</h2>

              <p>
                Informações principais do consultório.
              </p>
            </div>
          </div>

          <div className="configuracoes-form-grid">
            <div className="configuracoes-campo campo-completo">
              <label htmlFor="nomeClinica">
                Nome da clínica
              </label>

              <input
                id="nomeClinica"
                type="text"
                name="nome"
                placeholder="Nome da clínica"
                value={clinica.nome}
                onChange={handleClinicaChange}
              />
            </div>

            <div className="configuracoes-campo">
              <label htmlFor="telefoneClinica">
                Telefone
              </label>

              <input
                id="telefoneClinica"
                type="tel"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={clinica.telefone}
                onChange={handleClinicaChange}
              />
            </div>

            <div className="configuracoes-campo">
              <label htmlFor="emailClinica">
                E-mail
              </label>

              <input
                id="emailClinica"
                type="email"
                name="email"
                placeholder="clinica@email.com"
                value={clinica.email}
                onChange={handleClinicaChange}
              />
            </div>

            <div className="configuracoes-campo campo-completo">
              <label htmlFor="enderecoClinica">
                Endereço
              </label>

              <input
                id="enderecoClinica"
                type="text"
                name="endereco"
                placeholder="Rua, número, bairro e cidade"
                value={clinica.endereco}
                onChange={handleClinicaChange}
              />
            </div>
          </div>
        </section>

        {/* CONFIGURAÇÕES DA AGENDA */}
        <section className="configuracoes-card">
          <div className="configuracoes-card-header">
            <div className="configuracoes-card-icon">
              <Clock3 size={21} />
            </div>

            <div>
              <h2>Agenda</h2>

              <p>
                Configure os horários utilizados nos agendamentos.
              </p>
            </div>
          </div>

          <div className="configuracoes-form-grid">
            <div className="configuracoes-campo">
              <label htmlFor="inicio">
                Início do expediente
              </label>

              <input
                id="inicio"
                type="time"
                name="inicio"
                value={agenda.inicio}
                onChange={handleAgendaChange}
              />
            </div>

            <div className="configuracoes-campo">
              <label htmlFor="fim">
                Fim do expediente
              </label>

              <input
                id="fim"
                type="time"
                name="fim"
                value={agenda.fim}
                onChange={handleAgendaChange}
              />
            </div>

            <div className="configuracoes-campo">
              <label htmlFor="intervaloInicio">
                Início do intervalo
              </label>

              <input
                id="intervaloInicio"
                type="time"
                name="intervaloInicio"
                value={agenda.intervaloInicio}
                onChange={handleAgendaChange}
              />
            </div>

            <div className="configuracoes-campo">
              <label htmlFor="intervaloFim">
                Fim do intervalo
              </label>

              <input
                id="intervaloFim"
                type="time"
                name="intervaloFim"
                value={agenda.intervaloFim}
                onChange={handleAgendaChange}
              />
            </div>

            <div className="configuracoes-campo campo-completo">
              <label htmlFor="duracao">
                Duração padrão das consultas
              </label>

              <select
                id="duracao"
                name="duracao"
                value={agenda.duracao}
                onChange={handleAgendaChange}
              >
                <option value="15">15 minutos</option>

                <option value="30">30 minutos</option>

                <option value="45">45 minutos</option>

                <option value="60">1 hora</option>

                <option value="90">
                  1 hora e 30 minutos
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* PREFERÊNCIAS */}
        <section className="configuracoes-card">
          <div className="configuracoes-card-header">
            <div className="configuracoes-card-icon">
              <Bell size={21} />
            </div>

            <div>
              <h2>Preferências</h2>

              <p>
                Escolha como o sistema deve se comportar.
              </p>
            </div>
          </div>

          <div className="configuracoes-preferencias">
            <div className="preferencia-item">
              <div className="preferencia-texto">
                <strong>Lembretes de consultas</strong>

                <span>
                  Exibir lembretes para consultas próximas.
                </span>
              </div>

              <label className="config-switch">
                <input
                  type="checkbox"
                  name="lembretes"
                  checked={preferencias.lembretes}
                  onChange={handlePreferenciasChange}
                />

                <span className="config-slider"></span>
              </label>
            </div>

            <div className="preferencia-item">
              <div className="preferencia-texto">
                <strong>Confirmação de consultas</strong>

                <span>
                  Identificar consultas que ainda precisam ser confirmadas.
                </span>
              </div>

              <label className="config-switch">
                <input
                  type="checkbox"
                  name="confirmacaoConsulta"
                  checked={preferencias.confirmacaoConsulta}
                  onChange={handlePreferenciasChange}
                />

                <span className="config-slider"></span>
              </label>
            </div>

            <div className="preferencia-item">
              <div className="preferencia-texto">
                <strong>Mostrar consultas canceladas</strong>

                <span>
                  Manter consultas canceladas visíveis no sistema.
                </span>
              </div>

              <label className="config-switch">
                <input
                  type="checkbox"
                  name="consultasCanceladas"
                  checked={preferencias.consultasCanceladas}
                  onChange={handlePreferenciasChange}
                />

                <span className="config-slider"></span>
              </label>
            </div>
          </div>
        </section>
      </form>

      {/* BOTÃO MOBILE */}
      <button
        type="submit"
        form="configuracoes-form"
        className="configuracoes-salvar-mobile"
      >
        <Save size={18} />

        Salvar alterações
      </button>
    </div>
  );
}

export default Configuracoes;