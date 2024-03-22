var express = require('express');
var router = express.Router();
const discountController = require('../controllers/discount.controller')
const checkLogin = require('../meddlewares/check_login');


router.get('/', checkLogin.requiresLogin,discountController.getAllDiscount );
router.post('/add', checkLogin.requiresLogin, discountController.addDiscount);
router.get('/delete/:id', checkLogin.requiresLogin, discountController.deleteDiscount);
router.post('/edit/:id', checkLogin.requiresLogin, discountController.editDiscount);



module.exports = router;
