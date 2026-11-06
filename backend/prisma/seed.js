
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function criarAdministrador() {
  try {
    // Verifica se já existe um administrador
    const administradorExistente = await prisma.usuario.findFirst({
      where: { perfil: 'ADMIN' }
    });

    if (administradorExistente) {
      console.log('Já existe um administrador cadastrado.');
      return;
    }

    // Obtém os dados das variáveis de ambiente
    const nome = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    if (!nome || !email || !senha || senha.length < 8) {
      throw new Error('Informe nome, email e senha com pelo menos 8 caracteres.');
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 12);

    // Cadastra o administrador
    const administrador = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        perfil: 'ADMIN'
      }
    });

    console.log('Administrador criado com sucesso!');
    console.log('Nome:', administrador.nome);
    console.log('Email:', administrador.email);

  } catch (erro) {
    console.error('Erro ao criar administrador:', erro.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

criarAdministrador();
