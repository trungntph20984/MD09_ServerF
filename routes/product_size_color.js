var express = require('express');
var router = express.Router();
var product_size_color_CTL = require('../controllers/product_size_color.controller');
const checkLogin = require('../meddlewares/check_login');


router.get('/getListAll/:page', checkLogin.requiresLogin,product_size_color_CTL.getListAll)
router.get('/add_product_size_color', checkLogin.requiresLogin,product_size_color_CTL.add_product_size_color)
router.post('/add_product_size_color', checkLogin.requiresLogin,product_size_color_CTL.add_product_size_color)
router.get('/update_product_size_color/:id_product_color_size', checkLogin.requiresLogin,product_size_color_CTL.update_product_size_color)
router.post('/update_product_size_color/:id_product_color_size',product_size_color_CTL.update_product_size_color)

router.get('/sortUp', checkLogin.requiresLogin,product_size_color_CTL.sortUp)
router.get('/sortDown', checkLogin.requiresLogin,product_size_color_CTL.sortDown)
router.get('/delete_product_color_size/:id_product_color_size', checkLogin.requiresLogin,product_size_color_CTL.delete_product_color_size)
router.post('/updateQuantity', checkLogin.requiresLogin,product_size_color_CTL.updateQuantity)

router.get('/filterNameProduct', checkLogin.requiresLogin,product_size_color_CTL.filterNameProduct)
router.get('/search', checkLogin.requiresLogin,product_size_color_CTL.search)
router.get('/export', checkLogin.requiresLogin,product_size_color_CTL.exportExcel)





module.exports = router;