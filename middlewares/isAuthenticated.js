
const passport = require('passport')

// function isAuthenticated(req, res, next) {
//     passport.authenticate('jwt', { session: false }, (err, user, info) => {
      
//       if (err || !user) {
//         res.redirect('/api/auth/login');
//       }
//       req.user = user;
//       next();
//     })(req, res, next);
//   }
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      return res.redirect('/api/auth/login');
    }
  };
  module.exports = isAuthenticated;
  
 