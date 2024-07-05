// app.js

const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Configuração do method-override
app.use(methodOverride('_method'));

// Rotas
const indexRoutes = require('./routes/index');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const other_profileRoutes = require('./routes/other_profile');

app.use('/', indexRoutes);
app.use('/profile', profileRoutes);
app.use('/auth', authRoutes);
app.use('/other_profile', other_profileRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
