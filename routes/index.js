// routes/index.js

const express = require('express');
const router = express.Router();

// Rota para a página inicial (GET '/')
router.get('/', (req, res) => {
    // Verifica se o usuário está autenticado
    if (req.session.loggedin) {
        // Se autenticado, passa o nome de usuário para o template
        res.render('index', { title: 'Página Inicial', username: req.session.username });
    } else {
        // Se não autenticado, passa username como null ou vazio
        res.render('index', { title: 'Página Inicial', username: null }); // ou username: ''
    }
});

module.exports = router;
