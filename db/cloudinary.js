const cloudinary = require('cloudinary').v2;
const dotenv= require ('dotenv')
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config()
// console.log(CLOUD_NAME)
cloudinary.config({
    cloud_name:process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});
console.log(process.env.api_key)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'some-folder-name', // The name of the folder in cloudinary
        format: async (req, file) => 'jpg', // supports promises as well
    },
});

const parser = multer({ storage: storage });
module.exports = { parser };
