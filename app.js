const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const secret = crypto.randomBytes(64).toString('hex');

const corsOptions = {
  origin: 'http://localhost:3000', // або будь-який інший домен, з якого ви хочете дозволити запити
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
};

app.use(cors(corsOptions));

// Налаштування express-session
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 день
  }
}));

// Налаштування Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Підключаємо middleware
app.use(bodyParser.json());
app.use(cors());

// Підключаємо роутер
const router = require('./routes');
app.use('/api', router);

// Запускаємо сервер
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
