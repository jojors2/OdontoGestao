const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Permite que o frontend React converse com este backend
app.use(cors());

// Permite que o Express receba dados enviados no formato JSON
app.use(express.json());

// ==========================================
// ROTA DE TESTE (Para ver se o servidor está no ar)
// ==========================================
app.get("/", (req, res) => {
  res.json({ mensagem: "API do OdontoGestão conectada ao Supabase com sucesso! 🚀" });
});

// ==========================================
// AUTENTICAÇÃO / LOGIN
// ==========================================

// Rota de Login real com consulta no Supabase
app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    }

    // Busca o usuário pelo e-mail no Supabase
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    // Valida a senha (no futuro podemos usar bcrypt para criptografia)
    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    // Retorna os dados do usuário (sem expor a senha)
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

// Cadastro de novos usuários / dentistas / recepcionistas
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
// ROTAS DE PACIENTES (CRUD Completo)
// ==========================================

// 1. Listar todos os pacientes
app.get("/api/pacientes", async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      orderBy: { id: "desc" },
    });
    res.json(pacientes);
  } catch (error) {
    console.error("Erro ao listar pacientes:", error);
    res.status(500).json({ erro: "Erro ao buscar pacientes no banco de dados." });
  }
});

// 2. Cadastrar novo paciente
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

// 3. Atualizar dados de um paciente existente
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

// 4. Deletar um paciente
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
// CRIAÇÃO AUTOMÁTICA DO PRIMEIRO USUÁRIO (SEED)
// ==========================================
async function inicializarAdminPadrao() {
  try {
    const count = await prisma.usuario.count();
    if (count === 0) {
      await prisma.usuario.create({
        data: {
          nome: "Administrador",
          email: "admin@odontogestao.com",
          senha: "admin",
          perfil: "ADMIN",
        },
      });
      console.log(" Usuário inicial criado no banco:");
      console.log("   E-mail: admin@odontogestao.com");
      console.log("   Senha:  admin");
    }
  } catch (err) {
    console.error("Aviso ao verificar usuário padrão:", err.message);
  }
}

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(` Servidor rodando na porta ${PORT}`);
  console.log(` Acesse: http://localhost:${PORT}`);
  await inicializarAdminPadrao();
});
