var express = require('express');
var router = express.Router();
var categoryCTL = require('../controllers/category.controller')
const checkLogin = require('../meddlewares/check_login');


router.get('/', checkLogin.requiresLogin,categoryCTL.getAll)
router.get('/delete/:idCate', checkLogin.requiresLogin,categoryCTL.deleteCate)
router.post('/add', checkLogin.requiresLogin,categoryCTL.addCate)
router.post('/update/:idCate', checkLogin.requiresLogin, categoryCTL.updateCate);





module.exports = router;