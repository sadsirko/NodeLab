const Advertisement = require('../models/Advertisement');
const fs = require('fs');
const isAuthenticated = require("../middlewares/isAuthenticated");
const filePath = './data/apartments.json';
const isModerator = require('../middlewares/isModerator');
const bodyParser = require('body-parser')

function createAdvertisement(req, res) {
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

}

function getAllAdvertisements(req, res) {
        // Зчитування даних з файлу
        let savedData = fs.readFileSync(filePath);
        let ads = JSON.parse(savedData);
        res.render('advertisements/show', { allAdvertisement: ads.arr ,res : res});
    }

function searchAdvertisements(req, res) {
    let searchStr = req.query.search;
    console.log(searchStr);
    let savedData = fs.readFileSync(filePath);
    let ads = JSON.parse(savedData);
    let filteredAds = ads.arr.filter(ad => ad.name.includes(searchStr));
    console.log(filteredAds)
    res.render('advertisements/show', { allAdvertisement: filteredAds ,res : res});
}

function deleteAdvertisement(req, res) {
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
}

function getAdvertisementById(req, res) {
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
}

function updateAdvertisement(req, res) {
    const adId = req.params.id;
    let savedData = fs.readFileSync(filePath);
    let ads = JSON.parse(savedData);

    let adIndex = ads.arr.findIndex(ad => ad.id === adId);

    if (adIndex !== -1 && ads.arr[adIndex].authorId === req.user.id) {
        let updatedAd = req.body;

        ads.arr[adIndex].name = updatedAd.name;
        ads.arr[adIndex].address = updatedAd.address;
        ads.arr[adIndex].price = updatedAd.price;
        ads.arr[adIndex].detail = updatedAd.detail;
        console.log(ads.arr[adIndex])
        fs.writeFileSync(filePath, JSON.stringify(ads));
        res.redirect('/api/advertisement/author/' + req.user.id.toString() )

    } else {
        res.status(404).send("Advertisement not found or not authorized.");
    }}

function getAdvertisementsByAuthor(req, res) {
    let savedData = fs.readFileSync(filePath);
    let ads = JSON.parse(savedData);
    console.log(req.params.userId)
    const userAds = ads.arr.filter(ad => ad.authorId === req.params.userId);
    console.log(userAds);
    res.render('advertisements/userAdv', {allAdvertisement:userAds, res});}

function approveAdvertisement(req, res) {
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

    res.status(200).json(ads.arr[adIndex]);}

module.exports = {
    createAdvertisement,
    getAllAdvertisements,
    searchAdvertisements,
    deleteAdvertisement,
    getAdvertisementById,
    updateAdvertisement,
    getAdvertisementsByAuthor,
    approveAdvertisement,
};
