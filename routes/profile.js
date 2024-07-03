// routes/profile.js

const express = require('express');
const router = express.Router();
const { User, Comment } = require('../models');

// Rota para exibir o perfil do usuário
router.get('/', async (req, res) => {
    if (req.session.loggedin) {
        const user = await User.findOne({ where: { username: req.session.username } });
        const comments = await Comment.findAll({
            where: { username: req.session.username },
            order: [['createdAt', 'DESC']]
        });
        res.render('profile', { user, comments });
    } else {
        res.redirect('/auth/login');
    }
});

// Rota para exibir o formulário de edição do perfil
router.get('/edit', async (req, res) => {
    if (req.session.loggedin) {
        const user = await User.findOne({ where: { username: req.session.username } });
        res.render('profile_edit', { user });
    } else {
        res.redirect('/auth/login');
    }
});

// Rota para processar a edição do perfil
router.post('/edit', async (req, res) => {
    if (req.session.loggedin) {
        const { name, birthday, location, bio, email, phone, education } = req.body;
        await User.update({
            name, birthday, location, bio, email, phone, education
        }, {
            where: { username: req.session.username }
        });
        res.redirect('/profile');
    } else {
        res.redirect('/auth/login');
    }
});

// Rota para exibir todos os comentários
router.get('/comments', async (req, res) => {
    if (req.session.loggedin) {
        const comments = await Comment.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.render('profile', { username: req.session.username, comments });
    } else {
        res.redirect('/auth/login');
    }
});

// Rota para criar um novo comentário
router.post('/comments', async (req, res) => {
    if (req.session.loggedin) {
        const { content } = req.body;
        await Comment.create({ content, username: req.session.username });
        res.redirect('/profile');
    } else {
        res.redirect('/auth/login');
    }
});

// Rota para excluir um comentário específico
router.delete('/comments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await Comment.findByPk(id);
        if (!comment) {
            res.status(404).send('Comentário não encontrado.');
            return;
        }
        if (comment.username !== req.session.username) {
            res.status(403).send('Você não tem permissão para excluir este comentário.');
            return;
        }
        await comment.destroy();
        res.redirect('/profile');
    } catch (error) {
        console.error('Erro ao excluir comentário:', error);
        res.status(500).send('Erro ao excluir comentário.');
    }
});

// Rota para editar um comentário específico
router.put('/comments/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const comment = await Comment.findByPk(id);
        if (!comment) {
            res.status(404).send('Comentário não encontrado.');
            return;
        }
        if (comment.username !== req.session.username) {
            res.status(403).send('Você não tem permissão para editar este comentário.');
            return;
        }
        comment.content = content;
        comment.edited = true; // Marcar como editado
        await comment.save();
        res.redirect('/profile');
    } catch (error) {
        console.error('Erro ao editar comentário:', error);
        res.status(500).send('Erro ao editar comentário.');
    }
});

module.exports = router;
