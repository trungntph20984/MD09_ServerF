var express = require('express');
var router = express.Router();
var sizeCTL = require('../controllers/size.controller');
const checkLogin = require('../meddlewares/check_login');


router.get('/', checkLogin.requiresLogin ,sizeCTL.getAll)
router.post('/add', checkLogin.requiresLogin,sizeCTL.addSize)
router.get('/delete/:idSize', checkLogin.requiresLogin,sizeCTL.deleteSize)
router.post('/update/:idSize', checkLogin.requiresLogin, sizeCTL.updateSize);

module.exports = router;