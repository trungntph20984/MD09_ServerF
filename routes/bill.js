var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer();
const checkLogin = require('../meddlewares/check_login');

var billController = require('../controllers/bill.controller')

router.get('/', checkLogin.requiresLogin, billController.loc);
router.post('/', upload.none(), billController.loc);

router.get('/detail/:id', checkLogin.requiresLogin, billController.detail);
router.post('/detail/:id', checkLogin.requiresLogin, upload.none(), billController.detail);

module.exports = router;
