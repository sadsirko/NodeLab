const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');

router.patch('/change-role/:id', isAuthenticated, isAdmin, userController.changeUserRole);
router.get('/profile', isAuthenticated, userController.getUserProfile);

module.exports = router;
