const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path'); 
const FileStore = require('session-file-store')(session);
const methodOverride = require('method-override');
const app = express();
const secret = crypto.randomBytes(64).toString('hex');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('./middlewares/config-passport');

// Configure your Cloudinary credentials (use your own API key, secret, and cloud name)
// cloudinary.config({
//   cloud_name: "dzivr5anm",
//   api_key: "965449974787623",
//   api_secret: "lHzzo2DsTTm6ioyMeYoRgRSpLIo"
// });


// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'advertisements',
//     format: async (req, file) => 'png',
//     public_id: (req, file) => file.fieldname + '-' + Date.now(),
//   },
// });  
// const parser = multer({ storage: storage });
// module.exports = parser;

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
app.use('*', (req, res) => {
  res.redirect('/api/advertisement/allAdvertisement');
});
// Запускаємо сервер
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

