
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  FRONTEND_URL,
  PORT = 3001,
  NODE_ENV = "development",
} = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Configure SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY."
  );
}

// CLIENTES SUPABASE

const supabaseAuth = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// CORS

const origensPermitidas = [
  "http://localhost:5173",
  "https://odontogestao-pjgyqllog-joelle6.vercel.app",
  FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas sem Origin, como algumas requisições servidor-servidor.
    if (!origin || origensPermitidas.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origem não permitida pelo CORS."));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// CONFIGURAÇÃO DO COOKIE

const COOKIE_NAME = "odontogestao_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
};

const COOKIE_CLEAR_OPTIONS = {
  httpOnly: COOKIE_OPTIONS.httpOnly,
  secure: COOKIE_OPTIONS.secure,
  sameSite: COOKIE_OPTIONS.sameSite,
  path: COOKIE_OPTIONS.path,
};

// TRATAMENTO DE ERROS

function enviarErro(res, error, mensagem, status = 500) {
  console.error(mensagem, error);

  return res.status(status).json({
    erro: mensagem,
  });
}

// AUTENTICAÇÃO

async function autenticarUsuario(req, res, next) {
  try {
    const token =
      req.cookies[COOKIE_NAME] ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({
        erro: "Você precisa fazer login.",
      });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        erro: "Sessão inválida ou expirada.",
      });
    }

    const { data: usuario, error: usuarioError } =
      await supabaseAdmin
        .from("Usuario")
        .select("id, nome, email, perfil, cro")
        .eq("id", data.user.id)
        .maybeSingle();

    if (usuarioError) throw usuarioError;

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário não encontrado.",
      });
    }

    req.usuario = usuario;
    req.accessToken = token;

    next();
  } catch (error) {
    return enviarErro(
      res,
      error,
      "Erro ao validar sessão.",
      401
    );
  }
}

// CONTROLE DE PERMISSÕES

function permitirPerfis(...perfisPermitidos) {
  return (req, res, next) => {
    if (
      !req.usuario ||
      !perfisPermitidos.includes(req.usuario.perfil)
    ) {
      return res.status(403).json({
        erro: "Você não tem permissão para esta ação.",
      });
    }

    next();
  };
}

// RELACIONAMENTO COM PACIENTES

async function anexarPaciente(registros) {
  const lista = Array.isArray(registros)
    ? registros
    : [registros];

  const ids = [
    ...new Set(
      lista
        .map((item) => item.pacienteId)
        .filter((id) => id !== null && id !== undefined)
    ),
  ];

  if (ids.length === 0) {
    const resultado = lista.map((item) => ({
      ...item,
      paciente: "Paciente",
      pacienteObj: null,
    }));

    return Array.isArray(registros)
      ? resultado
      : resultado[0];
  }

  const { data: pacientes, error } = await supabaseAdmin
    .from("Paciente")
    .select("id, nome, telefone, email")
    .in("id", ids);

  if (error) throw error;

  const mapa = new Map(
    (pacientes || []).map((p) => [String(p.id), p])
  );

  const resultado = lista.map((item) => {
    const paciente = mapa.get(String(item.pacienteId)) || null;

    return {
      ...item,
      paciente: paciente?.nome || "Paciente",
      pacienteObj: paciente,
    };
  });

  return Array.isArray(registros)
    ? resultado
    : resultado[0];
}

// DATA NO FUSO DE SÃO PAULO

function dataSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function proximoDia(data) {
  const [ano, mes, dia] = data.split("-").map(Number);

  const proximaData = new Date(
    Date.UTC(ano, mes - 1, dia + 1)
  );

  return proximaData.toISOString().slice(0, 10);
}

// ROTA INICIAL

app.get("/", (_req, res) => {
  res.json({
    mensagem: "API do OdontoGestão conectada ao Supabase!",
  });
});

// LOGIN

app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    if (!email || !senha) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios.",
      });
    }

    const { data: loginData, error: loginError } =
      await supabaseAuth.auth.signInWithPassword({
        email: String(email).trim().toLowerCase(),
        password: senha,
      });

    if (
      loginError ||
      !loginData.user ||
      !loginData.session
    ) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos.",
      });
    }

    const { data: usuario, error: usuarioError } =
      await supabaseAdmin
        .from("Usuario")
        .select("id, nome, email, perfil, cro")
        .eq("id", loginData.user.id)
        .maybeSingle();

    if (usuarioError) throw usuarioError;

    if (!usuario) {
      return res.status(403).json({
        erro: "Usuário não cadastrado na clínica.",
      });
    }

    res.cookie(
      COOKIE_NAME,
      loginData.session.access_token,
      COOKIE_OPTIONS
    );

    return res.json(usuario);
  } catch (error) {
    return enviarErro(
      res,
      error,
      "Erro ao realizar login."
    );
  }
});

// LOGOUT

app.post("/api/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_CLEAR_OPTIONS);

  return res.json({
    mensagem: "Logout realizado com sucesso.",
  });
});

// USUÁRIO LOGADO

app.get(
  "/api/usuarios/me",
  autenticarUsuario,
  (req, res) => {
    res.json(req.usuario);
  }
);

// LISTAR USUÁRIOS

app.get(
  "/api/usuarios",
  autenticarUsuario,
  permitirPerfis("ADMIN"),
  async (_req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("Usuario")
        .select("id, nome, email, perfil, cro, criadoEm, atualizadoEm")
        .order("nome", { ascending: true });

      if (error) throw error;

      return res.json(data || []);
    } catch (error) {
      return enviarErro(
        res,
        error,
        "Erro ao listar usuários."
      );
    }
  }
);

// CADASTRAR USUÁRIO

app.post(
  "/api/usuarios",
  autenticarUsuario,
  permitirPerfis("ADMIN"),
  async (req, res) => {
    let authUserId = null;

    try {
      const { nome, email, senha, perfil, cro } = req.body || {};

      if (!nome || !email || !senha) {
        return res.status(400).json({
          erro: "Nome, e-mail e senha são obrigatórios.",
        });
      }

      if (String(senha).length < 8) {
        return res.status(400).json({
          erro: "A senha deve ter pelo menos 8 caracteres.",
        });
      }

      const perfisPermitidos = [
        "ADMIN",
        "DENTISTA",
        "SECRETARIA",
        "RECEPCIONISTA",
      ];

      const perfilFinal = perfil || "RECEPCIONISTA";

      if (!perfisPermitidos.includes(perfilFinal)) {
        return res.status(400).json({
          erro: "Perfil inválido.",
        });
      }

      const emailNormalizado = String(email)
        .trim()
        .toLowerCase();

      const { data: existente, error: consultaError } =
        await supabaseAdmin
          .from("Usuario")
          .select("id")
          .eq("email", emailNormalizado)
          .maybeSingle();

      if (consultaError) throw consultaError;

      if (existente) {
        return res.status(409).json({
          erro: "E-mail já cadastrado.",
        });
      }

      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: emailNormalizado,
          password: senha,
          email_confirm: true,
        });

      if (authError) throw authError;

      authUserId = authData.user.id;

      const { data: novoUsuario, error: insertError } =
        await supabaseAdmin
          .from("Usuario")
          .insert({
            id: authUserId,
            nome: String(nome).trim(),
            email: emailNormalizado,
            perfil: perfilFinal,
            cro: cro || null,
          })
          .select("id, nome, email, perfil, cro, criadoEm, atualizadoEm")
          .single();

      if (insertError) throw insertError;

      return res.status(201).json(novoUsuario);
    } catch (error) {
      if (authUserId) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      }

      return enviarErro(
        res,
        error,
        "Erro ao cadastrar usuário."
      );
    }
  }
);

// DASHBOARD

app.get(
  "/api/dashboard",
  autenticarUsuario,
  async (_req, res) => {
    try {
      const hoje = dataSaoPaulo();
      const amanha = proximoDia(hoje);

      // Total de pacientes
      const { count: totalPacientes, error: pacientesError } =
        await supabaseAdmin
          .from("Paciente")
          .select("*", { count: "exact", head: true });

      if (pacientesError) throw pacientesError;

      // Total de consultas
      const { count: totalConsultas, error: totalConsultasError } =
        await supabaseAdmin
          .from("Consulta")
          .select("*", { count: "exact", head: true });

      if (totalConsultasError) throw totalConsultasError;

      // Consultas de hoje
      const { data: consultasHoje, error: consultasHojeError } =
        await supabaseAdmin
          .from("Consulta")
          .select("id, pacienteId, data, horario, procedimento, status")
          .gte("data", hoje)
          .lt("data", amanha)
          .order("horario", { ascending: true });

      if (consultasHojeError) throw consultasHojeError;

      // Orçamentos pendentes
      const { count: totalOrcamentos, error: orcamentosError } =
        await supabaseAdmin
          .from("Orcamento")
          .select("*", { count: "exact", head: true })
          .ilike("status", "pendente");

      if (orcamentosError) throw orcamentosError;

      // Lembretes pendentes
      const { count: lembretesPendentes, error: lembretesError } =
        await supabaseAdmin
          .from("Lembrete")
          .select("*", { count: "exact", head: true })
          .ilike("status", "pendente");

      if (lembretesError) throw lembretesError;

      // Próximas consultas
      const { data: proximasConsultas, error: proximasError } =
        await supabaseAdmin
          .from("Consulta")
          .select("id, pacienteId, data, horario, procedimento, status")
          .gte("data", hoje)
          .order("data", { ascending: true })
          .order("horario", { ascending: true })
          .limit(5);

      if (proximasError) throw proximasError;

      const consultasComPaciente = await anexarPaciente(
        proximasConsultas || []
      );

      // Resumo de hoje
      const resumoHoje = {
        concluidas: 0,
        agendadas: 0,
        canceladas: 0,
      };

      (consultasHoje || []).forEach((consulta) => {
        const status = String(consulta.status || "")
          .trim()
          .toLowerCase();

        if (
          status === "concluída" ||
          status === "concluida" ||
          status === "concluído" ||
          status === "concluido"
        ) {
          resumoHoje.concluidas++;
        } else if (status === "cancelada" || status === "cancelado") {
          resumoHoje.canceladas++;
        } else {
          resumoHoje.agendadas++;
        }
      });

      return res.json({
        totalPacientes: totalPacientes || 0,
        consultasHoje: (consultasHoje || []).length,
        totalConsultas: totalConsultas || 0,
        totalOrcamentos: totalOrcamentos || 0,
        lembretesPendentes: lembretesPendentes || 0,
        proximasConsultas: consultasComPaciente,
        resumoHoje,
      });
    } catch (error) {
      return enviarErro(
        res,
        error,
        "Erro ao carregar dados do dashboard."
      );
    }
  }
);

// INICIAR SERVIDOR - SEMPRE NO FINAL

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


// ==========================================
// PACIENTES - CRUD COMPLETO
// ==========================================

// Converte os dados do banco para o formato esperado pelo React
function formatarPaciente(paciente, ultimaConsulta = null) {
  return {
    id: paciente.id,
    nome: paciente.nome || "",
    cpf: paciente.cpf || "",
    telefone: paciente.telefone || "",
    email: paciente.email || "",
    nascimento: paciente.datanascimento || "",
    endereco: paciente.endereco || "",
    observacoes: paciente.observacoes || "",
    status: paciente.status || "Ativo",
    ultimaConsulta: ultimaConsulta || null,
  };
}

// GET - Listar pacientes
app.get("/api/pacientes", autenticarUsuario, async (req, res) => {
  try {
    const { data: pacientes, error } = await supabaseAdmin
      .from("Paciente")
      .select("*")
      .order("nome", { ascending: true });

    if (error) throw error;

    // Busca as consultas para identificar a última consulta de cada paciente
    const { data: consultas, error: erroConsultas } = await supabaseAdmin
      .from("Consulta")
      .select("pacienteId, data")
      .order("data", { ascending: false });

    if (erroConsultas) throw erroConsultas;

    const ultimaConsultaPorPaciente = {};

    for (const consulta of consultas || []) {
      if (
        consulta.pacienteId &&
        !ultimaConsultaPorPaciente[consulta.pacienteId]
      ) {
        ultimaConsultaPorPaciente[consulta.pacienteId] = consulta.data;
      }
    }

    const resultado = (pacientes || []).map((paciente) =>
      formatarPaciente(
        paciente,
        ultimaConsultaPorPaciente[paciente.id]
      )
    );

    return res.json(resultado);
  } catch (error) {
    console.error("Erro ao listar pacientes:", error);

    return res.status(500).json({
      erro: "Não foi possível buscar os pacientes.",
    });
  }
});

// POST - Cadastrar paciente
app.post("/api/pacientes", autenticarUsuario, async (req, res) => {
  try {
    const {
      nome,
      telefone,
      email,
      nascimento,
      status,
    } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome do paciente é obrigatório.",
      });
    }

    if (!telefone || !telefone.trim()) {
      return res.status(400).json({
        erro: "O telefone do paciente é obrigatório.",
      });
    }

    if (!nascimento) {
      return res.status(400).json({
        erro: "A data de nascimento é obrigatória.",
      });
    }

    const paciente = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email?.trim() || null,
      datanascimento: nascimento,
      status: status === "Inativo" ? "Inativo" : "Ativo",
    };

    const { data, error } = await supabaseAdmin
      .from("Paciente")
      .insert(paciente)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(formatarPaciente(data));
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);

    return res.status(500).json({
      erro: "Não foi possível cadastrar o paciente.",
    });
  }
});

// PUT - Editar paciente
app.put("/api/pacientes/:id", autenticarUsuario, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      telefone,
      email,
      nascimento,
      status,
    } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome do paciente é obrigatório.",
      });
    }

    if (!telefone || !telefone.trim()) {
      return res.status(400).json({
        erro: "O telefone do paciente é obrigatório.",
      });
    }

    if (!nascimento) {
      return res.status(400).json({
        erro: "A data de nascimento é obrigatória.",
      });
    }

    const atualizacao = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email?.trim() || null,
      datanascimento: nascimento,
      status: status === "Inativo" ? "Inativo" : "Ativo",
      atualizadoEm: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("Paciente")
      .update(atualizacao)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json(formatarPaciente(data));
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);

    return res.status(500).json({
      erro: "Não foi possível atualizar o paciente.",
    });
  }
});

// DELETE - Excluir paciente
app.delete("/api/pacientes/:id", autenticarUsuario, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("Paciente")
      .delete()
      .eq("id", id);

    if (error) {
      // Pode acontecer quando o paciente possui consultas ou orçamentos vinculados
      if (error.code === "23503") {
        return res.status(409).json({
          erro:
            "Este paciente possui consultas ou orçamentos vinculados. Remova ou altere esses vínculos antes de excluir.",
        });
      }

      throw error;
    }

    return res.json({
      mensagem: "Paciente excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);

    return res.status(500).json({
      erro: "Não foi possível excluir o paciente.",
    });
  }
});
