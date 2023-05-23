const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const isModerator = require('../middlewares/isModerator');
const bodyParser = require('body-parser')
const advertisementController = require('../controllers/advertisementController');
const { parser } = require('../db/cloudinary');
// const parser = require('./parser')
// POST /advertisements - Створення нового оголошення
router.post('/createAdvertisement', isAuthenticated ,parser.single('photo'),advertisementController.createAdvertisement);

router.get('/allAdvertisement', advertisementController.getAllAdvertisements);

router.get('/search', advertisementController.searchAdvertisements);

router.delete('/delete/:id', advertisementController.deleteAdvertisement);

// GET /advertisements/:id - Отримання оголошення за ID
router.get('/advertisementsById/:id',  advertisementController.getAdvertisementById);

router.put('/updateAdvertisement/:id', isAuthenticated,  advertisementController.updateAdvertisement);

router.get('/updateAdvertisement/:id', isAuthenticated,  advertisementController.getUpdateAdvertisement);

// GET /advertisements/author/:userId - Отримання всіх оголошень користувача за ID автора
router.get('/author/:userId',isAuthenticated, advertisementController.getAdvertisementsByAuthor);

router.patch('/:id/approve', bodyParser.json(), isAuthenticated, isModerator, advertisementController.approveAdvertisement);

router.get('/create', isAuthenticated, (req, res) => {
  res.render('advertisements/create', { res});
});
module.exports = router;