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
const authenticate = passport.authenticate('local',{ successRedirect: '/api/advertisement/allAdvertisement', failureRedirect: 'login' });



// Реєстрація нового користувача
router.post('/signup', function(req, res, next) {
  console.log("hoi");
  console.dir(req.body);

  let salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256',
      function(err, hashedPassword) {
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
        // return res.redirect('/signup');
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
          return res.status(400).render('auth/signup', { res: res, error: "Username already exists." });
        }

        // Перевірка, чи існує користувач з такою ж електронною адресою
        const existingEmail = users.find(user => user.email === req.body.email);
        if (existingEmail) {
          return res.status(400).render('auth/signup', {res : res , error: "Email already exists." });
        }

        // console.log(newUser)
        users.push(newUser);
        fs.writeFileSync(usersFilePath, JSON.stringify({ arr: users }), 'utf8');
        res.redirect('login');
      }
    });
  });



  });

  require('../middlewares/config-passport');

router.post('/login', authenticate, async (req, res, next) => {
  passport.authenticate('local',{ successRedirect: '/api/advertisement/allAdvertisement', failureRedirect: 'auth/login' }, async (err, user, info) => {
    console.log(user)
    try {
      if (err) {
        console.error(err);
        return res.status(500).send("An internal server error occurred.", res);
      }

      if (!user) {
        console.error(info);
        return res.status(401).render('auth/login', { error: "Incorrect username or password.", res });

      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        // const body = { _id: user.id, username: user.username };
        // const token = jwt.sign({ user: body }, 'TOP_SECRET');
        req.session.user = user;
        return res.redirect('/api/advertisement/allAdvertisement');
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});


// Реєстрація
router.get('/signup', (req, res) => {
  res.render('auth/signup', {res});
});

// Вхід
router.get('/login', (req, res) => {
  res.render('auth/login', {res});
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send("An internal server error occurred.");
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/api/auth/login');
  });
});
// Тут будуть ваші маршрути для POST-запитів до /auth/signup та /auth/login

module.exports = router;
