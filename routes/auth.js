const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

const usersFilePath = './data/users.json';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'TOP_SECRET'
};

passport.use('jwt', new JwtStrategy(jwtOptions, function(jwtPayload, done) {
  fs.readFile(usersFilePath, (err, data) => {
    if (err) return done(err);

    const usersData = JSON.parse(data);
    const users = usersData.arr;

    const user = users.find(user => user.id == jwtPayload.user._id);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));

// Реєстрація нового користувача
router.post('/signup', function(req, res, next) {
  console.log("hoi");
  console.dir(req.body);

  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) { return next(err); }

    const newUser = new User(
      req.body.username,
      req.body.email,
      hashedPassword.toString('hex'),
      salt.toString('hex')
    );
    // console.log(newUser)

    fs.readFile(usersFilePath, (err, data) => {
      if (!req.body.username || !req.body.email || !req.body.password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/signup');
      }
      if (err) {
        if (err.code === 'ENOENT') {
          fs.writeFileSync(usersFilePath, JSON.stringify({ arr: [newUser] }), 'utf8');
          return;
        } else {
          return next(err);
        }
      } else {
        const usersData = JSON.parse(data);
        const users = usersData.arr;
        
        // console.log(newUser)
        // Перевірка, чи існує користувач з таким же ім'ям користувача
        const existingUser = users.find(user => user.username === req.body.username);
        if (existingUser) {
          return res.status(400).render('auth/signup', { error: "Username already exists." });
        }

        // Перевірка, чи існує користувач з такою ж електронною адресою
        const existingEmail = users.find(user => user.email === req.body.email);
        if (existingEmail) {
          return res.status(400).render('auth/signup', { error: "Email already exists." });
        }

        // console.log(newUser)
        users.push(newUser);
        fs.writeFileSync(usersFilePath, JSON.stringify({ arr: users }), 'utf8');
        res.send("registered");
      }
    });
  });



  res.redirect('login');});

passport.use('login', new LocalStrategy(
  function(username, password, done) {
    fs.readFile(usersFilePath, (err, data) => {
      if (err) return done(err);

      const usersData = JSON.parse(data);
      // console.log(usersData)   
      // console.log(username)
      
      const users = usersData.arr;
      const user = users.find(user => user.username == username);
      // console.log(user)
      
      // Якщо користувача не знайдено, повертаємо повідомлення про неправильне ім'я користувача
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      // console.log(username)
      const hashedPassword = crypto.pbkdf2Sync(password, Buffer.from(user.salt, 'hex'), 310000, 32, 'sha256');
      
      // Якщо пароль не збігається, повертаємо повідомлення про неправильний пароль
      if (hashedPassword.toString('hex') !== user.hashedPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    });
  }
));

router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err) {
        console.error(err);
        return res.status(500).send("An internal server error occurred.");
      }

      if (!user) {
        console.error(info); 
        return res.status(401).render('auth/login', { error: "Incorrect username or password." });
        
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user.id, username: user.username };
        const token = jwt.sign({ user: body }, 'TOP_SECRET');

        return res.redirect('/api/advertisement/allAdvertisement');
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Десеріалізація користувача
passport.deserializeUser((id, done) => {
  fs.readFile(usersFilePath, (err, data) => {
    if (err) return done(err);

    const usersData = JSON.parse(data);
    const users = usersData.arr;

    const user = users.find(user => user.id === id);
    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  });
});


// Реєстрація
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

// Вхід
router.get('/login', (req, res) => {
  res.render('auth/login', {req});
});

// Тут будуть ваші маршрути для POST-запитів до /auth/signup та /auth/login

module.exports = router;
