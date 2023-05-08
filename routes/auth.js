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
const authController = require('../controllers/authController');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'TOP_SECRET'
};
const authenticate = passport.authenticate('local',{ successRedirect: '/api/advertisement/allAdvertisement', failureRedirect: 'login' });



// Реєстрація нового користувача
router.post('/signup',authController.registerUser);

  require('../middlewares/config-passport');

router.post('/login', authenticate,authController.loginUser);


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
