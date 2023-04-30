const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path'); 
const FileStore = require('session-file-store')(session);
require('./middlewares/config-passport');
const methodOverride = require('method-override');
const app = express();
const secret = crypto.randomBytes(64).toString('hex');

app.use(express.static('public'));
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
};
app.use(cors(corsOptions));


const sessionMiddleware = session({
  store: new FileStore() , 
  secret,
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 10 * 60 * 1000,
    httpOnly: false,
  },
});

app.use(sessionMiddleware);
// Налаштування express-session

// Налаштування Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Підключаємо middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Підключаємо роутер
const router = require('./routes');
app.use('/api', router);

// Запускаємо сервер
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
