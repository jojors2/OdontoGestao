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
  PORT = 3001,
  NODE_ENV = "development",
} = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Configure SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY no .env."
  );
}

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

console.log("URL do Supabase:", SUPABASE_URL);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const COOKIE_NAME = "odontogestao_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
};

function enviarErro(res, error, mensagem, status = 500) {
  console.error(mensagem, error);
  return res.status(status).json({ erro: mensagem });
}

function converterId(id) {
  if (id === undefined || id === null || id === "") return null;

  const numero = Number(id);
  return Number.isNaN(numero) ? id : numero;
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
        .filter(Boolean)
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

    console.log("Erro Supabase Auth:", loginError);

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
      await supabaseAdmin.auth.admin.signOut?.(
        loginData.session.access_token
      );

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
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

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

      res.json(data || []);

    } catch (error) {
      enviarErro(res, error, "Erro ao listar usuários.");
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


// DASHBOARD
app.get(
  "/api/dashboard",
  autenticarUsuario,
  async (_req, res) => {
    try {
      // Data atual no fuso horário local
      const agora = new Date();

      const formatarData = (data) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
      };

      const hoje = formatarData(agora);

      const amanhaData = new Date(agora);
      amanhaData.setDate(amanhaData.getDate() + 1);

      const amanha = formatarData(amanhaData);

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

      // Próximas consultas (hoje e datas futuras)
      const { data: proximasConsultas, error: proximasError } =
        await supabaseAdmin
          .from("Consulta")
          .select("id, pacienteId, data, horario, procedimento, status")
          .gte("data", hoje)
          .order("data", { ascending: true })
          .order("horario", { ascending: true })
          .limit(5);

      if (proximasError) throw proximasError;

      // Adiciona o nome do paciente às consultas
      const consultasComPaciente = await anexarPaciente(
        proximasConsultas || []
      );

      // Calcula o resumo dos atendimentos de hoje
      const resumoHoje = {
        concluidas: 0,
        agendadas: 0,
        canceladas: 0,
      };

      (consultasHoje || []).forEach((consulta) => {
        const status = String(consulta.status || "")
          .trim()
          .toLowerCase();

        if (status === "concluída" || status === "concluida") {
          resumoHoje.concluidas++;
        } else if (status === "cancelada") {
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
