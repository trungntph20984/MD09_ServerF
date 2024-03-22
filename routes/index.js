var express = require('express');
var router = express.Router();
var indexContrl = require('../controllers/index.controller');
const checkLogin = require('../meddlewares/check_login');

/* GET home page. */
router.get('/', checkLogin.requiresLogin, indexContrl.bashboard);

router.get('/login', indexContrl.login);
router.post('/login', indexContrl.login);

router.get('/logout', checkLogin.requiresLogin, indexContrl.logout);
router.post('/logout', checkLogin.requiresLogin, indexContrl.logout);

module.exports = router;
