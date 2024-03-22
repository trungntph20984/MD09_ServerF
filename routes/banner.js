var express = require('express');
var router = express.Router();
var multer = require('multer');
const checkLogin = require('../meddlewares/check_login');

var uploadCloud = require('../meddlewares/uploader')

var bannerController = require('../controllers/banner.controller')

router.get('/', checkLogin.requiresLogin, bannerController.getAllBanner);
router.post('/add', uploadCloud.single('image'), bannerController.addBanner);
router.get('/delete/:id', checkLogin.requiresLogin, bannerController.deleteBanner);
router.get('/delete/:id', checkLogin.requiresLogin, bannerController.deleteBanner);
router.post('/edit/:id',uploadCloud.single('image'), bannerController.editBanner);


module.exports = router;
