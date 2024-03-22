var express = require('express');
var router = express.Router();
var colorCTL = require('../controllers/color.controller')
const checkLogin = require('../meddlewares/check_login');

router.get('/', checkLogin.requiresLogin,colorCTL.getAll)
router.post('/add', checkLogin.requiresLogin,colorCTL.addColor)
router.get('/delete/:idColor', checkLogin.requiresLogin,colorCTL.deleteColor)
router.post('/update/:idColor', checkLogin.requiresLogin, colorCTL.updateColor);


module.exports = router;