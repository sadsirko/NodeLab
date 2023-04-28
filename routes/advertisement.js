const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const fs = require('fs');
const passport = require('passport')
const filePath = './data/apartments.json';
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const isModerator = require('../middlewares/isModerator');

// POST /advertisements - Створення нового оголошення
router.post('/createAdvertisement', isAuthenticated, (req, res) => {
  // Зчитування даних з файлу
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);
  
  const advertisement = new Advertisement(
     req.body.detail, req.body.address, req.user.id.toString(), req.body.price, req.body.photo, req.body.name);

  // Додавання нового оголошення до масиву
  ads.arr.push(advertisement.toJSON());

  // Конвертація масиву до формату JSON
  let jsonAds = JSON.stringify(ads);
  
  // Запис оновлених даних назад у файл
  fs.writeFileSync(filePath, jsonAds);

  console.log();
  // Збереження оголошення в базі даних або в інший сховище
  res.status(201).json(advertisement);
});

router.get('/allAdvertisement', (req, res) => {
  // Зчитування даних з файлу
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);
  res.render('advertisements/show', { allAdvertisement: ads ,res : res});
});

router.delete('/delete/:id', isAuthenticated, (req, res) => {
  // Зчитування даних з файлу

  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);

  console.log(req.params.id)

  // Знаходження оголошення за ID
  const index = ads.arr.findIndex(ad => ad.id === req.params.id);

  console.log(index)

  // Перевірка, чи оголошення знайдено
  if (index === -1) {
    return res.status(404).send("Advertisement not found.");
  }

  // Перевірка, чи користувач є автором оголошення
  console.log("user " + req.user.id)
  console.log(ads.arr[index].authorId)

  if (ads.arr[index].authorId != req.user.id) {
    return res.status(403).send("You can only delete your own advertisements.");
  }

  // Видалення оголошення
  ads.arr.splice(index, 1);

  // Конвертація масиву до формату JSON
  let jsonAds = JSON.stringify(ads);

  // Запис оновлених даних назад у файл
  fs.writeFileSync(filePath, jsonAds);

  // Відправлення відповіді
  res.status(200).send("Advertisement deleted.");
});

// GET /advertisements/:id - Отримання оголошення за ID
router.get('/advertisementsById/:id', (req, res) => {
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);

  const ad = ads.arr.find(ad => ad.id === req.params.id);

  if (!ad) {
    return res.status(404).send("Advertisement not found.");
  }

  res.status(200).json(ad);
});

// router.get('/advertisements', (req, res) => {
//   // Fetch your advertisements data
//   res.render('advertisements/index', { advertisements: advertisements });
// });

// GET /advertisements/author/:userId - Отримання всіх оголошень користувача за ID автора
router.get('/author/:userId', (req, res) => {
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);

  const userAds = ads.arr.filter(ad => ad.authorId === req.params.userId);
  console.log(userAds);
  res.status(200).json(userAds);
});

// PATCH /advertisements/:id/approve - Зміна поля "approved" для користувачів з роллю "moderator"
router.patch('/:id/approve', isAuthenticated, isModerator, (req, res) => {

  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);

  const adIndex = ads.arr.findIndex(ad => ad.id === req.params.id);

  if (adIndex === -1) {
    return res.status(404).send("Advertisement not found.");
  }

  ads.arr[adIndex].approved = true;

  let jsonAds = JSON.stringify(ads);
  fs.writeFileSync(filePath, jsonAds);

  res.status(200).json(ads.arr[adIndex]);
});

module.exports = router;