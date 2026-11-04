const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================================

async function autenticarUsuario(req, res, next) {
  try {
    // Recupera o token armazenado no cookie
    const token = req.cookies.odontogestao_token;

    if (!token) {
      return res.status(401).json({
        erro: "Você precisa fazer login para acessar esta área.",
      });
    }

    // Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: Number(decoded.sub),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        cro: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário não encontrado.",
      });
    }

    // Disponibiliza os dados para as próximas rotas
    req.usuario = usuario;

    next();

  } catch (error) {
    return res.status(401).json({
      erro: "Sessão inválida ou expirada. Faça login novamente.",
    });
  }
}

// ==========================================
// MIDDLEWARE DE AUTORIZAÇÃO
// ==========================================

function permitirPerfis(...perfisPermitidos) {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        erro: "Você não tem permissão para realizar esta ação.",
      });
    }

    next();
  };
}

// Permite que o frontend converse com este backend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true 
  })
);

// Permite que o Express receba dados enviados no formato JSON
app.use(express.json());
app.use(cookieParser());
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

    // Verifica se os campos foram preenchidos
    if (!email || !senha) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios.",
      });
    }

    // Procura o usuário pelo e-mail
    const usuario = await prisma.usuario.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos.",
      });
    }

    // Verifica se a senha já está criptografada com bcrypt
    const senhaJaCriptografada = /^\$2[aby]\$/.test(usuario.senha);

    let senhaValida = false;

    if (senhaJaCriptografada) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      // Compatibilidade temporária com senhas antigas
      senhaValida = usuario.senha === senha;

      // Se a senha antiga estiver correta, atualiza para hash
      if (senhaValida) {
        const senhaHash = await bcrypt.hash(senha, 12);

        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { senha: senhaHash },
        });
      }
    }

    if (!senhaValida) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos.",
      });
    }

    // Gera o token de autenticação
    const token = jwt.sign(
      {
        perfil: usuario.perfil,
      },
      process.env.JWT_SECRET,
      {
        subject: String(usuario.id),
        expiresIn: "8h",
      }
    );

    // Guarda o token em um cookie protegido
    res.cookie("odontogestao_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    // Retorna os dados do usuário, sem a senha
    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      cro: usuario.cro,
    });

  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      erro: "Erro interno no servidor ao tentar fazer login.",
    });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("odontogestao_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json({
    mensagem: "Logout realizado com sucesso.",
  });
});

app.post(
  "/api/usuarios",
  autenticarUsuario,
  permitirPerfis("ADMIN"),
  async (req, res) => {
    try {
      const { nome, email, senha, perfil, cro } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          erro: "Nome, e-mail e senha são obrigatórios.",
        });
      }

      if (senha.length < 8) {
        return res.status(400).json({
          erro: "A senha deve ter pelo menos 8 caracteres.",
        });
      }

      const emailNormalizado = email.toLowerCase().trim();

      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: emailNormalizado },
      });

      if (usuarioExistente) {
        return res.status(400).json({
          erro: "Este e-mail já está cadastrado.",
        });
      }

      // Criptografa a senha antes de salvar
      const senhaHash = await bcrypt.hash(senha, 12);

      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email: emailNormalizado,
          senha: senhaHash,
          perfil: perfil || "RECEPCIONISTA",
          cro: cro || null,
        },
      });

      return res.status(201).json({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);

      return res.status(500).json({
        erro: "Erro ao cadastrar usuário.",
      });
    }
  }
);

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
    const config = await prisma.configuracao.findFirst();

    if (!config) {
      return res.json(null);
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
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}`);
});
