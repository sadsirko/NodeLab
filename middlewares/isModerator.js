function isModerator(req, res, next) {
    if (req.user && (req.user.role === 'moderator' || req.user.role === 'admin')) {
      return next();
    }
    res.status(403).send("You don't have permission to access this resource.");
  }
  
  module.exports = isModerator;
  