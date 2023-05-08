const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const fs = require('fs');
const passport = require('passport')
const filePath = './data/apartments.json';
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const isModerator = require('../middlewares/isModerator');
const bodyParser = require('body-parser')
// const parser = require('./parser')
// POST /advertisements - Створення нового оголошення
router.post('/createAdvertisement', isAuthenticated /*,parser.single('photo')*/, (req, res) => {
  // Зчитування даних з файлу
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);
  console.log(req.body.detail, req.body.address, req.user.id.toString(), req.body.price, [], req.body.name)
  const advertisement = new Advertisement(
     req.body.detail, req.body.address, req.user.id.toString(), req.body.price,  [], req.body.name,
      req.user.email);

  // Додавання нового оголошення до масиву
  ads.arr.push(advertisement.toJSON());

  // Конвертація масиву до формату JSON
  let jsonAds = JSON.stringify(ads);
  
  // Запис оновлених даних назад у файл
  fs.writeFileSync(filePath, jsonAds);

  // Збереження оголошення в базі даних або в інший сховище
  res.redirect('/api/advertisement/author/' + req.user.id.toString() )
});

router.get('/allAdvertisement', (req, res) => {
  // Зчитування даних з файлу
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);
  res.render('advertisements/show', { allAdvertisement: ads.arr ,res : res});
});

router.get('/search', (req, res) => {
  // Зчитування даних з файлу
  let searchStr = req.query.search;
  console.log(searchStr);
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);
  let filteredAds = ads.arr.filter(ad => ad.name.includes(searchStr));
  console.log(filteredAds)
  res.render('advertisements/show', { allAdvertisement: filteredAds ,res : res});
  // res.send({ allAdvertisement: ads ,res : res})
  // res.render('/advertisements/show', { allAdvertisement: ads ,res : res});
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
  res.redirect('/api/advertisement/author/' + req.user.id.toString() )

  // Відправлення відповіді
});

// GET /advertisements/:id - Отримання оголошення за ID
router.get('/advertisementsById/:id', (req, res) => {
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);

  const ad = ads.arr.find(ad => ad.id === req.params.id);
  console.log(req.params.id)
  if (!ad) {
    return res.status(404).send("Advertisement not found.");
  }
  if(isAuthenticated)
  {
    res.render('advertisements/advertisment', { ad: ad , user : req.user, res});
  }
  else{
    res.render('advertisements/advertisment', { ad: ad , res});
      }
});

router.put('/updateAdvertisement/:id', isAuthenticated, (req, res) => {
  const adId = req.params.id;
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);

  let adIndex = ads.arr.findIndex(ad => ad.id === adId);

  if (adIndex !== -1 && ads.arr[adIndex].authorId === req.user.id) {
    let updatedAd = req.body;
    console.log(updatedAd)
    console.log(ads.arr[adIndex])
    ads.arr[adIndex].name = updatedAd.name;
    ads.arr[adIndex].address = updatedAd.address;
    ads.arr[adIndex].price = updatedAd.price;
    ads.arr[adIndex].detail = updatedAd.detail;
    console.log(ads.arr[adIndex])
    fs.writeFileSync(filePath, JSON.stringify(ads));
    res.redirect('/api/advertisement/author/' + req.user.id.toString() )

  } else {
    res.status(404).send("Advertisement not found or not authorized.");
  }

});

router.get('/updateAdvertisement/:id', isAuthenticated, (req, res) => {
  const adId = req.params.id;
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);

  let adIndex = ads.arr.findIndex(ad => ad.id === adId);
  console.log(adIndex)
  console.log(ads.arr[adIndex])
  console.log(ads.arr[adIndex].userId,req.user.id)
  if (adIndex !== -1 && ads.arr[adIndex].authorId === req.user.id) {
    res.render('advertisements/edit', { ad: ads.arr[adIndex], res})
  }
  else {
    res.status(404).send("You can edit only your advertisements.");
  }

});

// GET /advertisements/author/:userId - Отримання всіх оголошень користувача за ID автора
router.get('/author/:userId',isAuthenticated, (req, res) => {
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);
  console.log(req.params.userId)
  const userAds = ads.arr.filter(ad => ad.authorId === req.params.userId);
  console.log(userAds);
  res.render('advertisements/userAdv', {allAdvertisement:userAds, res});
});

router.patch('/:id/approve', bodyParser.json(), isAuthenticated, isModerator, (req, res) => {
  let savedData = fs.readFileSync(filePath);
  let ads = JSON.parse(savedData);

  const adIndex = ads.arr.findIndex(ad => ad.id === req.params.id);
  console.log("inside")
  if (adIndex === -1) {
    return res.status(404).send("Advertisement not found.");
  }
  console.log(req.body)
  ads.arr[adIndex].approved = req.body.approve;

  let jsonAds = JSON.stringify(ads);
  fs.writeFileSync(filePath, jsonAds);

  res.status(200).json(ads.arr[adIndex]);
});

router.get('/create', isAuthenticated, (req, res) => {
  res.render('advertisements/create', { res});
});
module.exports = router;