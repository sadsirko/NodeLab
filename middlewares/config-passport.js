const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
const usersFilePath = './data/users.json';
const crypto = require('crypto');

  

passport.use('local', new LocalStrategy(
    function(username, password, done) {
      fs.readFile(usersFilePath, (err, data) => {
        if (err) return done(err);
  
        const usersData = JSON.parse(data);
  
        const users = usersData.arr;
        const user = users.find(user => user.username == username);
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
    }));

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