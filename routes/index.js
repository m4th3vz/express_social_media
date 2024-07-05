// routes/index.js

const express = require('express');
const router = express.Router();
const { User, Comment, Follow } = require('../models');

// Rota para a página inicial (GET '/')
router.get('/', async (req, res) => {
    try {
        // Verifica se o usuário está autenticado
        if (req.session.loggedin) {
            // Busca os usuários que o usuário logado está seguindo
            const currentUser = await User.findOne({ where: { username: req.session.username } });
            const following = await currentUser.getFollowing();

            // Obtém os comentários dos usuários seguidos ordenados por data
            const comments = await Comment.findAll({
                where: { username: following.map(user => user.username) },
                order: [['createdAt', 'DESC']]
            });

            // Renderiza a página index com os comentários dos usuários seguidos
            res.render('index', { title: 'Página Inicial', username: req.session.username, comments });
        } else {
            // Se não autenticado, passa username como null ou vazio
            res.render('index', { title: 'Página Inicial', username: null }); // ou username: ''
        }
    } catch (error) {
        console.error('Erro ao carregar página inicial:', error);
        res.status(500).send('Erro ao carregar página inicial.');
    }
});

module.exports = router;
