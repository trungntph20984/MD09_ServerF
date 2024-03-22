var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({ dest: './tmp' });

const api_comment = require('../controllers/api/api_comment');
const api_users = require('../controllers/api/api-users')
const api_notification = require('../controllers/api/api_notification');
var api_color = require('../controllers/api/api_color')
var api_size = require('../controllers/api/api_size')
var api_category = require('../controllers/api/api_category')
var api_product_size_color = require('../controllers/api/api_product_size_color')
var api_favorite = require('../controllers/api/api_favorite')

var api_product = require('../controllers/api/api-product')
var api_bill = require('../controllers/api/api-bill')
var api_cart = require('../controllers/api/api-cart')
var api_banner = require('../controllers/api/api_banner')
var api_discount = require('../controllers/api/api_discount')
var api_messageController = require('../controllers/api/api_message')
var api_conversationController = require('../controllers/api/api_conversation')
// api user

router.get('/users', api_users.listUser);
router.get('/userproflie/:idUser' , api_users.getUserById);
router.get('/users/pagination', api_users.pagination);
router.post('/userslogin', api_users.userLogin);
router.post('/usersloginphone', api_users.userLoginPhone);
router.post('/cheklogin/:idUser', api_users.checkLogin);
router.post('/logout/:idUser', api_users.logout);
router.put('/setoken/:idUser', api_users.setToken);
router.put('/change-password/:idUser', api_users.changePassword);

router.post('/users', upload.single("image"), api_users.addUser);
router.put('/users/:idUser', api_users.updateUser);
router.delete('/users/:idu', api_users.deleteUser);

//address
router.get('/address/:idUser', api_users.getAddressByIdUser);
router.get('/get-address/:idAddress', api_users.getAddressById);
router.post('/address', api_users.addAddress);
router.post('/setaddress', api_users.setAddress);


// set SKID

router.put('/user/:idUser', api_users.setSocketId);
router.get('/userSocketId/:idUser', api_users.getSocketIdByUserId);



router.put('/address/:idAddress', api_users.updateAddres);
router.delete('/address/:idAddress', api_users.deleteAddress);




//notification
router.get('/notification/:idUser', api_notification.getNotification);
router.get('/notification-read/:idNotification' , api_notification.readNotification)


//===
// api product

router.get('/products/:category/:skip', api_product.getProducts);
router.get('/products/:skip', api_product.getAllProduct);
router.get('/product-by-id/:idProduct', api_product.getProductsById);

router.post('/products', upload.array('image'), api_product.createProduct);
router.put('/products/:id', upload.array('image'), api_product.updateProduct);
router.delete('/products/:id', api_product.deleteProduct);
router.get('/products/sortUp', api_product.sortUp);
router.get('/products/sortDown', api_product.sortDown);
router.get('/products', api_product.searchProduct);

//comment 
router.get('/comment/:ProductId', api_comment.getCommentByProduct);
router.post('/comment-by-id', api_comment.getCommentById);
router.post('/comment', upload.array('images', 3), api_comment.newComment);
router.put('/comment/:CommentId', upload.array('images', 3), api_comment.updateComment);


//===


// color
router.get('/colors', api_color.listColors);
router.post('/addcolor', api_color.addColor);

// size
router.get('/sizes', api_size.listSizes);
router.post('/addsize', api_size.addSize);

// // category
router.get('/categorys', api_category.listCategorys);
router.post('/addcategory', api_category.addCategory);


// product-size-color
router.get('/getListAll_deltail/:id_product', api_product_size_color.getListAll_deltail);
router.post('/add_product_size_color', api_product_size_color.add_product_size_color);

router.post('/addFavorite/:idUser/:idProduct', api_favorite.addFavorite);
router.get('/getListFavorite/:idUser', api_favorite.getListFavorite);
router.get('/deleteFavorite/:idFavorite', api_favorite.deleteFavorite);


// api bill

router.get('/bill', api_bill.listBill);
router.get('/bill/:userId', api_bill.listBillByUserId);
router.get('/bill/pagination', api_bill.pagination);

router.post('/addbill/:idUser', api_bill.addBill);
router.put('/bill/:id', api_bill.updateBill);
router.delete('/bill/:id', api_bill.deleteBill);

router.get('/bill-by-id/:idBill', api_bill.getBillById);

//====

// api cart


router.get('/cart/pagination', api_cart.pagination);
router.post('/updateCart/:idUser/:idCart', api_cart.updateCart);
router.post('/addCart/:idUser/:idProduct', api_cart.addCart);
router.get('/getListCart/:idUser', api_cart.listCart);
router.delete('/deletecart/:id', api_cart.deleteCart);

//====


router.get('/banner', api_banner.getAllBanner);




// nhan tin realtime
router.post('/conversation', api_conversationController.createConversation);
router.get('/conversation/:userId', api_conversationController.getConversationsByUser);
router.get('/conversation/r/:conversationId/:userId', api_conversationController.getConversationsById);

router.post('/message', upload.single('text'), api_messageController.createMessage);
router.get('/message/:conversationId', api_messageController.getMessagesByConversation);

router.get('/discount/:idUser', api_discount.getAllDiscount);



module.exports = router;
