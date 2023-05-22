const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const methodOverride = require('method-override');
const app = express();
const secret = crypto.randomBytes(64).toString('hex');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { disconect } = require('multer-storage-cloudinary');
const { disconnect } = require('./db/mongo');

require('./middlewares/config-passport');

const MongoStore = require('connect-mongo');


const { incrementAdVisits, getAdVisits } = require('./db/redis');
// console.log
// incrementAdVisits("225");
// getAdVisits("225").then((res) => console.log(res)).catch((err) => console.error(err));

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
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/mydatabase', // replace with your MongoDB connection string
  }),
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
app.use('*', (req, res) => {
  res.redirect('/api/advertisement/allAdvertisement');
});
// Запускаємо сервер
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
// process.on('beforeExit', () => {
//   // Close Redis connection
//   console.log('Closing Redis connection...');
//   client.quit(); // Assuming `client` is the Redis client instance
//   // Close MongoDB connection
//   console.log('Closing MongoDB connection...');
//   server.close(); // Assuming `server` is the Express server instance
// });