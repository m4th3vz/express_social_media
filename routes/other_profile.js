const express = require('express');
const router = express.Router();
const { User, Comment, Follow } = require('../models');

// Rota para exibir todos os comentários
router.get('/comments', async (req, res) => {
    if (req.session.loggedin) {
        const comments = await Comment.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.render('other_profile', { username: req.session.username, comments });
    } else {
        res.redirect('/auth/login');
    }
});

module.exports = router;