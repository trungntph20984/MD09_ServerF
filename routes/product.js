var express = require('express');
var router = express.Router();
var multer = require('multer');
const checkLogin = require('../meddlewares/check_login');

var product_controller = require('../controllers/product.controller');
var uploadCloud = require('../meddlewares/uploader')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // có file lưu vào up load 
      cb(null, './upload');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '_' + file.originalname);
    },
  });

  const upload = multer({ storage: storage });

router.get('/listproduct/:page', checkLogin.requiresLogin, product_controller.getlistproduct);
router.post('/addproduct', checkLogin.requiresLogin, uploadCloud.array('image',5), product_controller.addproduct);
router.post('/addDetail', checkLogin.requiresLogin, product_controller.addDetail);

router.get('/deleteproduct/:id', checkLogin.requiresLogin, product_controller.deleteproduct);
router.post('/updateproduct/:id', checkLogin.requiresLogin,uploadCloud.array('image',5),product_controller.updateproduct);
router.get('/updateproduct/:id', checkLogin.requiresLogin,uploadCloud.array('image',5),product_controller.updateproduct);
router.get('/search', checkLogin.requiresLogin, product_controller.searchProduct);
router.get('/sortUp', checkLogin.requiresLogin,product_controller.sortUp)
router.get('/sortDown', checkLogin.requiresLogin,product_controller.sortDown)
router.get('/filterCategory', checkLogin.requiresLogin, product_controller.filterCategory)
router.get('/detail/:idProduct', checkLogin.requiresLogin, product_controller.detailProduct)
router.get('/export', checkLogin.requiresLogin, product_controller.exportExcel)




router.get('/statistical', checkLogin.requiresLogin, product_controller.statistical)

module.exports = router;