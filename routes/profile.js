// routes/profile.js

const express = require('express');
const router = express.Router();
const { User, Comment, Follow } = require('../models');
const moment = require('moment');

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
        res.render('profile_edit', { user, moment }); // Passando moment para o template
    } else {
        res.redirect('/auth/login');
    }
});

// Rota para processar a edição do perfil
router.post('/edit', async (req, res) => {
    if (req.session.loggedin) {
        const { name, birthday, location, bio, email, phone, education } = req.body;
        await User.update({
            name, 
            birthday: moment(birthday).toDate(), // Ajustando o fuso horário no back-end
            location, 
            bio, 
            email, 
            phone, 
            education
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

// Rota para seguir um usuário
router.post('/follow/:username', async (req, res) => {
    const { username } = req.params;
  
    try {
      const currentUser = await User.findOne({ where: { username: req.session.username } });
      const profileUser = await User.findOne({ where: { username } });
  
      // Verifica se o usuário já está seguindo o perfil sendo visualizado
      const isFollowing = await currentUser.hasFollowing(profileUser);
  
      if (!isFollowing) {
        await currentUser.addFollowing(profileUser);
      }
  
      res.redirect(`/profile/${username}`);
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      res.status(500).send('Erro ao seguir usuário.');
    }
  });
  
  // Rota para deixar de seguir um usuário
  router.post('/unfollow/:username', async (req, res) => {
    const { username } = req.params;
  
    try {
      const currentUser = await User.findOne({ where: { username: req.session.username } });
      const profileUser = await User.findOne({ where: { username } });
  
      // Verifica se o usuário está seguindo o perfil sendo visualizado
      const isFollowing = await currentUser.hasFollowing(profileUser);
  
      if (isFollowing) {
        await currentUser.removeFollowing(profileUser);
      }
  
      res.redirect(`/profile/${username}`);
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      res.status(500).send('Erro ao deixar de seguir usuário.');
    }
  });
  
  // Rota para exibir o perfil de outro usuário
  router.get('/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const profileUser = await User.findOne({ where: { username } });
        if (!profileUser) {
            return res.status(404).send('Usuário não encontrado.');
        }

        let isFollowing = false;
        if (req.session.loggedin) {
            const currentUser = await User.findOne({ where: { username: req.session.username } });

            // Verifica se o usuário logado já está seguindo o perfil sendo visualizado
            const following = await currentUser.getFollowing();
            isFollowing = following.some(user => user.username === profileUser.username);
        }

        res.render('other_profile', { title: 'Perfil de Usuário', username: req.session.username, profileUser, isFollowing, loggedin: req.session.loggedin, moment });
    } catch (error) {
        console.error('Erro ao carregar perfil de usuário:', error);
        res.status(500).send('Erro ao carregar perfil de usuário.');
    }
});

module.exports = router;
