const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dit9enk6m',
    api_key: 162694156365821,
    api_secret: '6HzeukWKTJgYGt8rjnJ8nSyAACA'
});

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png'],
    folder: 'du_an_tot_nghiep'
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
