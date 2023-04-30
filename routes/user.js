const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const fs = require('fs');
const passport = require('passport')
const usersFilePath = './data/users.json';
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const isModerator = require('../middlewares/isModerator');

router.patch('/change-role/:id', isAuthenticated, isAdmin, (req, res) => {

  let savedData = fs.readFileSync(usersFilePath);
  let users = JSON.parse(savedData);

  const index = users.arr.findIndex(user => user.id === req.params.id);

  if (index === -1) {
    return res.status(404).send("User not found.");
  }

  // Зміна ролі користувача
  if (users.arr[index].role === 'user') {
    users.arr[index].role = 'moderator';
  } else if (users.arr[index].role === 'moderator') {
    users.arr[index].role = 'user';
  }

  let jsonUsers = JSON.stringify(users);
  fs.writeFileSync(usersFilePath, jsonUsers);

  res.status(200).send(`User role changed to ${users.arr[index].role}.`);
});

router.get('/profile', isAuthenticated, (req, res) => {
  let savedData = fs.readFileSync(usersFilePath);
  let users = JSON.parse(savedData);
  console.log(req.session.user);
  console.log("in profile");
  console.log("in profile");

  const index = users.arr.findIndex(user => user.id == req.session.passport.user);
  console.log(index)
  if (index === -1) {
    return res.status(404).send("User not found.");
  }
  res.render('users/profile', { res, user: users.arr[index]});
});

module.exports = router;
