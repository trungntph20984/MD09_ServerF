const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

   
cloudinary.config({ 
  cloud_name: 'duce6pblz', 
  api_key: 956333529269557, 
  api_secret: 'KTijGkaX0ssGqyEHFq3cih9Dqbk' 
});
const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png'],
    folder: 'du_an_tot_nghiep'
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
