// routes/auth.js

// Importa o framework Express e cria um objeto router para gerenciar rotas
const express = require('express');
const router = express.Router();

// Importa o modelo de usuário definido no arquivo '../models'
const { User } = require('../models');

// Importa o pacote bcryptjs para lidar com criptografia de senhas
const bcrypt = require('bcryptjs'); // Use bcryptjs em vez de bcrypt

// Rota para exibir o formulário de registro (GET)
router.get('/register', (req, res) => {
  res.render('register'); // Renderiza a página 'register' para o usuário
});

// Rota para lidar com o envio do formulário de registro (POST)
router.post('/register', async (req, res) => {
  const { username, password } = req.body; // Obtém username e password do corpo da requisição

  // Verifica se o usuário já existe no banco de dados
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.send('Usuário já existe'); // Retorna mensagem se o usuário já existir
  }

  // Criptografa a senha antes de salvar no banco de dados
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cria um novo usuário no banco de dados com a senha criptografada
  await User.create({ username, password: hashedPassword });

  // Redireciona o usuário para a página de login após o registro bem-sucedido
  res.redirect('/auth/login');
});

// Rota para exibir o formulário de login (GET)
router.get('/login', (req, res) => {
  res.render('login'); // Renderiza a página 'login' para o usuário
});

// Rota para lidar com o envio do formulário de login (POST)
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Obtém username e password do corpo da requisição

  // Busca o usuário no banco de dados com base no username fornecido
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.send('Credenciais inválidas'); // Retorna mensagem se o usuário não existir
  }

  // Compara a senha fornecida com a senha armazenada no banco de dados
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.send('Credenciais inválidas'); // Retorna mensagem se a senha estiver incorreta
  }

  // Configura a sessão do usuário após o login bem-sucedido
  req.session.loggedin = true; // Define a flag 'loggedin' como true na sessão
  req.session.username = user.username; // Armazena o username na sessão

  // Redireciona o usuário para a página 'profile' após o login
  res.redirect('/profile');
});

// Rota para fazer logout (GET)
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Erro ao fazer logout'); // Retorna mensagem de erro se houver problema ao destruir a sessão
    }
    res.redirect('/'); // Redireciona o usuário para a página principal após logout bem-sucedido
  });
});

// Exporta o objeto router para ser utilizado por outros arquivos da aplicação
module.exports = router;
