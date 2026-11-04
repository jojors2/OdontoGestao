const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Permite que o frontend converse com este backend
app.use(cors());

// Permite que o Express receba dados enviados no formato JSON
app.use(express.json());

// ==========================================
// ROTA DE STATUS / TESTE
// ==========================================
app.get("/", (req, res) => {
  res.json({ mensagem: "API do OdontoGestão conectada ao banco de dados com sucesso! 🚀" });
});

// ==========================================
// AUTENTICAÇÃO / LOGIN & USUÁRIOS
// ==========================================
app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      cro: usuario.cro,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ erro: "Erro interno no servidor ao tentar logar." });
  }
});

app.post("/api/usuarios", async (req, res) => {
  try {
    const { nome, email, senha, perfil, cro } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email: email.toLowerCase().trim(),
        senha,
        perfil: perfil || "RECEPCIONISTA",
        cro: cro || null,
      },
    });

    res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      perfil: novoUsuario.perfil,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
});

// ==========================================
// ROTAS DE PACIENTES (CRUD)
// ==========================================
app.get("/api/pacientes", async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      orderBy: { id: "desc" },
      include: {
        _count: {
          select: { consultas: true, orcamentos: true },
        },
      },
    });
    res.json(pacientes);
  } catch (error) {
    console.error("Erro ao listar pacientes:", error);
    res.status(500).json({ erro: "Erro ao buscar pacientes no banco de dados." });
  }
});

app.post("/api/pacientes", async (req, res) => {
  try {
    const { nome, telefone, email, nascimento, status } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ erro: "Nome e telefone são obrigatórios." });
    }

    const novoPaciente = await prisma.paciente.create({
      data: {
        nome,
        telefone,
        email: email || null,
        nascimento: nascimento || null,
        status: status || "Ativo",
      },
    });

    res.status(201).json(novoPaciente);
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    res.status(500).json({ erro: "Erro ao salvar paciente no banco de dados." });
  }
});

app.put("/api/pacientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, nascimento, status } = req.body;

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: Number(id) },
      data: {
        nome,
        telefone,
        email,
        nascimento,
        status,
      },
    });

    res.json(pacienteAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);
    res.status(500).json({ erro: "Erro ao atualizar dados do paciente." });
  }
});

app.delete("/api/pacientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.paciente.delete({
      where: { id: Number(id) },
    });

    res.json({ mensagem: "Paciente removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar paciente:", error);
    res.status(500).json({ erro: "Erro ao excluir paciente." });
  }
});

// ==========================================
// ROTAS DE CONSULTAS (CRUD)
// ==========================================
app.get("/api/consultas", async (req, res) => {
  try {
    const { data } = req.query;
    const where = data ? { data } : {};

    const consultas = await prisma.consulta.findMany({
      where,
      orderBy: [{ data: "asc" }, { horario: "asc" }],
      include: {
        paciente: {
          select: { id: true, nome: true, telefone: true, email: true },
        },
      },
    });

    // Mapeia para incluir tanto paciente.nome quanto campo paciente direto para compatibilidade
    const consultasFormatadas = consultas.map((c) => ({
      ...c,
      paciente: c.paciente?.nome || "Paciente",
      pacienteObj: c.paciente,
    }));

    res.json(consultasFormatadas);
  } catch (error) {
    console.error("Erro ao listar consultas:", error);
    res.status(500).json({ erro: "Erro ao buscar consultas." });
  }
});

app.post("/api/consultas", async (req, res) => {
  try {
    let { pacienteId, paciente, pacienteNome, data, horario, duracao, procedimento, observacoes, status } = req.body;

    if (!data || !horario || !procedimento) {
      return res.status(400).json({ erro: "Data, horário e procedimento são obrigatórios." });
    }

    const nomeBusca = pacienteNome || (typeof paciente === "string" ? paciente : null);

    if (!pacienteId && nomeBusca) {
      let p = await prisma.paciente.findFirst({
        where: { nome: { contains: nomeBusca } },
      });
      if (!p) {
        p = await prisma.paciente.create({
          data: { nome: nomeBusca, telefone: "Não informado", status: "Ativo" },
        });
      }
      pacienteId = p.id;
    }

    if (!pacienteId) {
      const primeiro = await prisma.paciente.findFirst();
      if (primeiro) {
        pacienteId = primeiro.id;
      } else {
        const novo = await prisma.paciente.create({
          data: { nome: "Paciente Geral", telefone: "Não informado" },
        });
        pacienteId = novo.id;
      }
    }

    const novaConsulta = await prisma.consulta.create({
      data: {
        pacienteId: Number(pacienteId),
        data,
        horario,
        duracao: duracao || "30",
        procedimento,
        observacoes: observacoes || null,
        status: status || "Agendada",
      },
      include: {
        paciente: {
          select: { id: true, nome: true, telefone: true },
        },
      },
    });

    res.status(201).json({
      ...novaConsulta,
      paciente: novaConsulta.paciente?.nome || "Paciente",
      pacienteObj: novaConsulta.paciente,
    });
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    res.status(500).json({ erro: "Erro ao agendar consulta." });
  }
});

app.put("/api/consultas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { pacienteId, data, horario, duracao, procedimento, observacoes, status } = req.body;

    const consultaAtualizada = await prisma.consulta.update({
      where: { id: Number(id) },
      data: {
        ...(pacienteId ? { pacienteId: Number(pacienteId) } : {}),
        data,
        horario,
        duracao,
        procedimento,
        observacoes,
        status,
      },
      include: {
        paciente: {
          select: { id: true, nome: true, telefone: true },
        },
      },
    });

    res.json({
      ...consultaAtualizada,
      paciente: consultaAtualizada.paciente?.nome || "Paciente",
      pacienteObj: consultaAtualizada.paciente,
    });
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);
    res.status(500).json({ erro: "Erro ao atualizar consulta." });
  }
});

app.delete("/api/consultas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.consulta.delete({
      where: { id: Number(id) },
    });

    res.json({ mensagem: "Consulta removida com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar consulta:", error);
    res.status(500).json({ erro: "Erro ao cancelar consulta." });
  }
});

// ==========================================
// ROTAS DE ORÇAMENTOS (CRUD)
// ==========================================
app.get("/api/orcamentos", async (req, res) => {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      orderBy: { id: "desc" },
      include: {
        paciente: {
          select: { id: true, nome: true, telefone: true },
        },
      },
    });

    const orcamentosFormatados = orcamentos.map((o) => ({
      ...o,
      paciente: o.paciente?.nome || "Paciente",
      pacienteObj: o.paciente,
    }));

    res.json(orcamentosFormatados);
  } catch (error) {
    console.error("Erro ao listar orçamentos:", error);
    res.status(500).json({ erro: "Erro ao buscar orçamentos." });
  }
});

app.post("/api/orcamentos", async (req, res) => {
  try {
    let { pacienteId, paciente, pacienteNome, procedimento, valor, data, status, observacoes } = req.body;

    if (!procedimento || valor === undefined || !data) {
      return res.status(400).json({ erro: "Procedimento, valor e data são obrigatórios." });
    }

    const nomeBusca = pacienteNome || (typeof paciente === "string" ? paciente : null);

    if (!pacienteId && nomeBusca) {
      let p = await prisma.paciente.findFirst({
        where: { nome: { contains: nomeBusca } },
      });
      if (!p) {
        p = await prisma.paciente.create({
          data: { nome: nomeBusca, telefone: "Não informado", status: "Ativo" },
        });
      }
      pacienteId = p.id;
    }

    if (!pacienteId) {
      const primeiro = await prisma.paciente.findFirst();
      if (primeiro) {
        pacienteId = primeiro.id;
      } else {
        const novo = await prisma.paciente.create({
          data: { nome: "Paciente Geral", telefone: "Não informado" },
        });
        pacienteId = novo.id;
      }
    }

    const novoOrcamento = await prisma.orcamento.create({
      data: {
        pacienteId: Number(pacienteId),
        procedimento,
        valor: parseFloat(valor),
        data: String(data),
        status: status || "Pendente",
        observacoes: observacoes || null,
      },
      include: {
        paciente: {
          select: { id: true, nome: true },
        },
      },
    });

    res.status(201).json({
      ...novoOrcamento,
      paciente: novoOrcamento.paciente?.nome || "Paciente",
      pacienteObj: novoOrcamento.paciente,
    });
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    res.status(500).json({ erro: "Erro ao salvar orçamento." });
  }
});

app.put("/api/orcamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { pacienteId, procedimento, valor, data, status, observacoes } = req.body;

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: Number(id) },
      data: {
        ...(pacienteId ? { pacienteId: Number(pacienteId) } : {}),
        procedimento,
        valor: valor !== undefined ? parseFloat(valor) : undefined,
        data,
        status,
        observacoes,
      },
      include: {
        paciente: {
          select: { id: true, nome: true },
        },
      },
    });

    res.json({
      ...orcamentoAtualizado,
      paciente: orcamentoAtualizado.paciente?.nome || "Paciente",
      pacienteObj: orcamentoAtualizado.paciente,
    });
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    res.status(500).json({ erro: "Erro ao atualizar orçamento." });
  }
});

app.delete("/api/orcamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.orcamento.delete({
      where: { id: Number(id) },
    });

    res.json({ mensagem: "Orçamento removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar orçamento:", error);
    res.status(500).json({ erro: "Erro ao excluir orçamento." });
  }
});

// ==========================================
// ROTAS DE LEMBRETES (CRUD)
// ==========================================
app.get("/api/lembretes", async (req, res) => {
  try {
    const lembretes = await prisma.lembrete.findMany({
      orderBy: { id: "desc" },
    });
    res.json(lembretes);
  } catch (error) {
    console.error("Erro ao listar lembretes:", error);
    res.status(500).json({ erro: "Erro ao buscar lembretes." });
  }
});

app.post("/api/lembretes", async (req, res) => {
  try {
    const { titulo, descricao, paciente, data, hora, prioridade, concluido } = req.body;

    if (!titulo || !data) {
      return res.status(400).json({ erro: "Título e data são obrigatórios." });
    }

    const novoLembrete = await prisma.lembrete.create({
      data: {
        titulo,
        descricao: descricao || null,
        paciente: paciente || null,
        data,
        hora: hora || null,
        prioridade: prioridade || "Média",
        concluido: Boolean(concluido),
      },
    });

    res.status(201).json(novoLembrete);
  } catch (error) {
    console.error("Erro ao criar lembrete:", error);
    res.status(500).json({ erro: "Erro ao salvar lembrete." });
  }
});

app.put("/api/lembretes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, paciente, data, hora, prioridade, concluido } = req.body;

    const lembreteAtualizado = await prisma.lembrete.update({
      where: { id: Number(id) },
      data: {
        titulo,
        descricao,
        paciente,
        data,
        hora,
        prioridade,
        concluido: concluido !== undefined ? Boolean(concluido) : undefined,
      },
    });

    res.json(lembreteAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar lembrete:", error);
    res.status(500).json({ erro: "Erro ao atualizar lembrete." });
  }
});

app.patch("/api/lembretes/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const lembrete = await prisma.lembrete.findUnique({
      where: { id: Number(id) },
    });

    if (!lembrete) {
      return res.status(404).json({ erro: "Lembrete não encontrado." });
    }

    const atualizado = await prisma.lembrete.update({
      where: { id: Number(id) },
      data: { concluido: !lembrete.concluido },
    });

    res.json(atualizado);
  } catch (error) {
    console.error("Erro ao alterar status do lembrete:", error);
    res.status(500).json({ erro: "Erro ao alternar conclusão do lembrete." });
  }
});

app.delete("/api/lembretes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.lembrete.delete({
      where: { id: Number(id) },
    });

    res.json({ mensagem: "Lembrete removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar lembrete:", error);
    res.status(500).json({ erro: "Erro ao excluir lembrete." });
  }
});

// ==========================================
// ROTAS DE CONFIGURAÇÃO DA CLÍNICA
// ==========================================
app.get("/api/configuracoes", async (req, res) => {
  try {
    let config = await prisma.configuracao.findFirst();
    if (!config) {
      config = await prisma.configuracao.create({
        data: {
          nomeClinica: "OdontoGestão",
          agendaInicio: "08:00",
          agendaFim: "18:00",
          duracaoConsulta: "30",
          lembretesAtivos: true,
          confirmacaoConsulta: true,
        },
      });
    }
    res.json(config);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    res.status(500).json({ erro: "Erro ao buscar configurações." });
  }
});

app.put("/api/configuracoes", async (req, res) => {
  try {
    let config = await prisma.configuracao.findFirst();
    const dados = req.body;

    if (!config) {
      config = await prisma.configuracao.create({ data: dados });
    } else {
      config = await prisma.configuracao.update({
        where: { id: config.id },
        data: dados,
      });
    }

    res.json(config);
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    res.status(500).json({ erro: "Erro ao salvar configurações." });
  }
});

// ==========================================
// ROTA DO DASHBOARD (Estatísticas e Resumo)
// ==========================================
app.get("/api/dashboard", async (req, res) => {
  try {
    const hojeStr = new Date().toISOString().slice(0, 10);

    const [
      totalPacientes,
      consultasHoje,
      totalConsultas,
      totalOrcamentos,
      lembretesPendentes,
      proximasConsultas,
      consultasConcluidas,
      consultasAgendadas,
      consultasCanceladas,
    ] = await Promise.all([
      prisma.paciente.count({ where: { status: "Ativo" } }),
      prisma.consulta.count({ where: { data: hojeStr } }),
      prisma.consulta.count(),
      prisma.orcamento.count({ where: { status: "Pendente" } }),
      prisma.lembrete.count({ where: { concluido: false } }),
      prisma.consulta.findMany({
        where: { data: { gte: hojeStr } },
        orderBy: [{ data: "asc" }, { horario: "asc" }],
        take: 5,
        include: { paciente: { select: { id: true, nome: true } } },
      }),
      prisma.consulta.count({ where: { data: hojeStr, status: "Concluída" } }),
      prisma.consulta.count({ where: { data: hojeStr, status: { in: ["Agendada", "Confirmada"] } } }),
      prisma.consulta.count({ where: { data: hojeStr, status: "Cancelada" } }),
    ]);

    const formatadas = proximasConsultas.map((c) => ({
      id: c.id,
      horario: c.horario,
      paciente: c.paciente?.nome || "Paciente",
      procedimento: c.procedimento,
      status: c.status,
    }));

    res.json({
      totalPacientes,
      consultasHoje,
      totalConsultas,
      totalOrcamentos,
      lembretesPendentes,
      proximasConsultas: formatadas,
      resumoHoje: {
        concluidas: consultasConcluidas,
        agendadas: consultasAgendadas,
        canceladas: consultasCanceladas,
      },
    });
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    res.status(500).json({ erro: "Erro ao carregar dashboard." });
  }
});

// ==========================================
// SEED AUTOMÁTICO DE DADOS INICIAIS
// ==========================================
async function inicializarDadosPadrao() {
  try {
    const totalUsuarios = await prisma.usuario.count();
    if (totalUsuarios === 0) {
      await prisma.usuario.create({
        data: {
          nome: "Administrador",
          email: "admin@odontogestao.com",
          senha: "admin",
          perfil: "ADMIN",
        },
      });
      console.log("✔ Usuário inicial criado: admin@odontogestao.com (senha: admin)");
    }

    const totalConfig = await prisma.configuracao.count();
    if (totalConfig === 0) {
      await prisma.configuracao.create({
        data: {
          nomeClinica: "OdontoGestão",
          profissionalNome: "Dr. João Silva",
          cro: "CRO-SP 123456",
          especialidade: "Clínico Geral & Ortodontia",
          telefoneClinica: "(11) 98888-7777",
          emailClinica: "contato@odontogestao.com",
          enderecoClinica: "Av. Paulista, 1000 - São Paulo, SP",
          agendaInicio: "08:00",
          agendaFim: "18:00",
          duracaoConsulta: "30",
        },
      });
      console.log("✔ Configuração inicial da clínica criada.");
    }

    const totalPacientes = await prisma.paciente.count();
    if (totalPacientes === 0) {
      const hoje = new Date().toISOString().slice(0, 10);

      const p1 = await prisma.paciente.create({
        data: {
          nome: "Mariana Silva",
          telefone: "(11) 98765-4321",
          email: "mariana.silva@email.com",
          nascimento: "1992-05-14",
          status: "Ativo",
        },
      });

      const p2 = await prisma.paciente.create({
        data: {
          nome: "Carlos Henrique",
          telefone: "(11) 97654-3210",
          email: "carlos.h@email.com",
          nascimento: "1988-11-20",
          status: "Ativo",
        },
      });

      const p3 = await prisma.paciente.create({
        data: {
          nome: "Ana Beatriz",
          telefone: "(11) 96543-2109",
          email: "ana.beatriz@email.com",
          nascimento: "1999-03-08",
          status: "Ativo",
        },
      });

      await prisma.consulta.createMany({
        data: [
          {
            pacienteId: p1.id,
            data: hoje,
            horario: "09:00",
            duracao: "45",
            procedimento: "Limpeza e Profilaxia",
            status: "Confirmada",
          },
          {
            pacienteId: p2.id,
            data: hoje,
            horario: "10:30",
            duracao: "30",
            procedimento: "Avaliação Inicial",
            status: "Agendada",
          },
          {
            pacienteId: p3.id,
            data: hoje,
            horario: "14:00",
            duracao: "60",
            procedimento: "Restauração Estética",
            status: "Confirmada",
          },
        ],
      });

      await prisma.orcamento.createMany({
        data: [
          {
            pacienteId: p1.id,
            procedimento: "Clareamento Dental a Laser",
            valor: 850.0,
            data: hoje,
            status: "Aprovado",
          },
          {
            pacienteId: p2.id,
            procedimento: "Implante Unitário",
            valor: 3200.0,
            data: hoje,
            status: "Pendente",
          },
        ],
      });

      await prisma.lembrete.createMany({
        data: [
          {
            titulo: "Confirmar consultas de amanhã",
            descricao: "Enviar mensagem via WhatsApp para pacientes agendados",
            data: hoje,
            hora: "16:00",
            prioridade: "Alta",
            concluido: false,
          },
          {
            titulo: "Receber material de moldagem",
            descricao: "Verificar entrega da distribuidora odontológica",
            data: hoje,
            hora: "11:00",
            prioridade: "Média",
            concluido: true,
          },
        ],
      });

      console.log("✔ Dados de exemplo criados com sucesso.");
    }
  } catch (err) {
    console.error("Aviso ao inicializar dados padrão:", err.message);
  }
}

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}`);
  await inicializarDadosPadrao();
});
