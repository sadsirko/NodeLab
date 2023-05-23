const Advertisement = require('../models/Advertisement');
const fs = require('fs');
const isAuthenticated = require("../middlewares/isAuthenticated");
const filePath = './data/apartments.json';
const isModerator = require('../middlewares/isModerator');
const bodyParser = require('body-parser')
const { connect } = require('../db/mongo');
const { incrVisits, getVisits } = require('../db/redis');
const dbName = "mydatabase"

async function createAdvertisement(req, res) {
    const client = await connect();
    const db = client.db(dbName);
    const collection = db.collection('advertisements');

    const advertisement = new Advertisement(
        req.body.detail, req.body.address, req.user.id.toString(), req.body.price, [], req.body.name,
        req.user.email);

    // Check if a file has been uploaded
    if (req.file) {
        console.log(req.file)
        console.log(req.file.path)
        // If a file has been uploaded, add the Cloudinary URL for the image to the advertisement object
        advertisement.photo = req.file.path;

    }

    await collection.insertOne(advertisement.toJSON());

    res.redirect('/api/advertisement/author/' + req.user.id.toString() )
}
async function getAllAdvertisements(req, res) {
    const client = await connect();
    const db = client.db(dbName); // provide your DB name here
    const collection = db.collection('advertisements');

    const ads = await collection.find().toArray();

    res.render('advertisements/show', { allAdvertisement: ads, res: res });
}
async function searchAdvertisements(req, res) {
    const searchStr = req.query.search;

    const client = await connect();
    const db = client.db(dbName); // provide your DB name here
    const collection = db.collection('advertisements');

    const ads = await collection.find({ name: { $regex: searchStr, $options: 'i' } }).toArray();

    res.render('advertisements/show', { allAdvertisement: ads, res: res });
}
async function deleteAdvertisement(req, res) {
    const client = await connect();
    const db = client.db(dbName); // provide your DB name here
    const collection = db.collection('advertisements');

    const result = await collection.deleteOne({ id: req.params.id, authorId: req.user.id });

    if (result.deletedCount === 0) {
        res.status(404).send("Advertisement not found or not authorized.");
    } else {
        res.redirect('/api/advertisement/author/' + req.user.id.toString());
    }
}
async function getAdvertisementById(req, res) {
    const client = await connect();
    const db = client.db(dbName); // provide your DB name here
    const collection = db.collection('advertisements');
    let views = 0;
    try {
        views = await incrVisits(req.params.id);
        // console.log(await getVisits(req.params.id));
    } catch(err) {
        console.error('Redis operation failed: ', err);
        // You might want to return or throw here, depending on your error handling strategy
    }

    // console.log(await getAdVisits(req.params.id));
    const ad = await collection.findOne({ id: req.params.id });

    if (!ad) {
        return res.status(404).send("Advertisement not found.");
    }
    if (isAuthenticated) {
        res.render('advertisements/advertisment', { ad: ad, views: views , user: req.user, res });
    }
    else {
        res.render('advertisements/advertisment', { ad: ad, res, views: views });
    }
}
async function updateAdvertisement(req, res) {
    const adId = req.params.id;

    const client = await connect();
    const db = client.db(dbName); // provide your DB name here
    const collection = db.collection('advertisements');

    const updateResult = await collection.updateOne({ id: adId, authorId: req.user.id }, {
        $set: {
            name: req.body.name,
            address: req.body.address,
            price: req.body.price,
            detail: req.body.detail
        }
    });
    if (!updateResult.matchedCount) {
        res.status(404).send("Advertisement not found or not authorized.");
        return;
    }

    res.redirect('/api/advertisement/author/' + req.user.id.toString())
}
async function getUpdateAdvertisement(req, res) {
    const adId = req.params.id;

    const client = await connect();
    const db = client.db(dbName); // provide your DB name here
    const collection = db.collection('advertisements');

    const ad = await collection.findOne({ id: adId, authorId: req.user.id });

    if (!ad) {
        res.status(404).send("You can edit only your advertisements.");
        return;
    }

    res.render('advertisements/edit', { ad: ad, res: res });
}
async function getAdvertisementsByAuthor(req, res) {
    const authorId = req.params.userId;

    const client = await connect();
    const db = client.db(dbName); // provide your DB name here
    const collection = db.collection('advertisements');

    const userAds = await collection.find({ authorId: authorId }).toArray();

    res.render('advertisements/userAdv', { allAdvertisement: userAds, res: res });
}
async function approveAdvertisement(req, res) {
    const adId = req.params.id;
    const client = await connect();
    const db = client.db(dbName); // provide your DB name here
    const collection = db.collection('advertisements');

    const updateResult = await collection.updateOne({ id: adId }, { $set: { approved: !req.body.approve } });

    if (!updateResult.matchedCount) {
        res.status(404).send("Advertisement not found.");
        return;
    }
    const ad = await collection.findOne({ id: adId });
    res.status(200).json(ad);
}


    module.exports = {
    createAdvertisement,
    getAllAdvertisements,
    searchAdvertisements,
    deleteAdvertisement,
    getAdvertisementById,
    updateAdvertisement,
    getAdvertisementsByAuthor,
    approveAdvertisement,
    getUpdateAdvertisement
};
