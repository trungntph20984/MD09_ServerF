const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notification.controller');
const checkLogin = require('../meddlewares/check_login');

const multer = require('multer');
const upLoader = multer({ dest: './tmp' });

router.get('/', checkLogin.requiresLogin, notificationCtrl.notification);

router.post('/',upLoader.single("inputImage"), notificationCtrl.pustNotification);

module.exports = router;