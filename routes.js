const express = require('express');
const router = express.Router();

// Підключаємо роути
const authRoutes = require('./routes/auth');
const advertisementRoutes = require('./routes/advertisement')
const userRoutes = require('./routes/user')
// Додаємо роути до роутера
router.use('/auth', authRoutes);
router.use('/advertisement',advertisementRoutes)
router.use('/user',userRoutes)

module.exports = router;
