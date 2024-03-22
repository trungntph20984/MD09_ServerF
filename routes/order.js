const express = require('express');
const router = express.Router();
const orderCTL = require('../controllers/order.controller');




// router.get('/create_payment_url', function (req, res, next) {
//     res.render('order/test', {title: 'Tạo mới đơn hàng', amount: 10000})
// });
router.post('/create_payment_url/:idUser',orderCTL.create_payment_url)
router.get('/vnpay_return',orderCTL.vnpay_return)







module.exports = router;