
let express = require('express');
let dateFormat = require('date-format')
let moment = require('moment')
var config = require('../config/default.json');
let mdBill = require('../models/bill.model')
let mdProduct = require('../models/product_size_color.model')
let mdCart = require('../models/cart.model')
let mdUser = require('../models/user.model')
let mdProduct_detail = require('../models/product_size_color.model')
let mdProduct_ = require('../models/product.model')
let mdSize = require('../models/sizes.model')
let mdColor = require('../models/color.model')
let mdcategory = require('../models/category.model')
let mdDiscount = require('../models/discount.model')
let mdUserDiscount = require('../models/userdiscount.model')
let { DateTime } = require('luxon');
//// khi đặt hàng thêm discount thì giảm giá 
//// đặt hàng nhiều lần 
/// khi hiển thị danh sách discount thì tìm kiếm bill xem user đấy đã dùng discount đấy mấy lần và xóa user id khỏi mảng 
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}


let globalIdCart;
let globalIdUser;
let globalAmount;
let globalDiscount;
let globalDataDiscount;
const create_payment_url = async (req, res, next) => {
    var ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress; // đúng 

    var tmnCode = config.vnp_TmnCode
    var secretKey = config.vnp_HashSecret
    var vnpUrl = config.vnp_Url
    var returnUrl = config.vnp_ReturnUrl


    var date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    var orderId = dateFormat(date, 'HHmmss');
    let idUser = req.params.idUser;
    let idCart = req.body.idCart;
    let amount = req.body.amount;
    let idDiscount = req.body.idDiscount;
    console.log('idDiscount', idDiscount);
    try {
        if (idDiscount) {
            const finDiscount = await mdDiscount.discountModel.findById(idDiscount)
            globalDataDiscount = finDiscount
            // console.log('finDiscount', finDiscount);
            if (!finDiscount) {
                return res.status(400).json({ message: 'Không tìm thấy thông tin ưu đãi.' });
            }
        }
        const finUser = await mdUser.userModel.findById(idUser);
        if (!idCart || !Array.isArray(idCart) || !finUser) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
        }
        for (const itemCart of idCart) {
            const fincart = await mdCart.cartModel.findById(itemCart);
            if (!fincart) {
                return res.status(200).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng ' + itemCart });
            }
        }


    } catch (error) {
        return res.status(404).json({ error: "Đã xảy ra lỗi " + error.message });
    }
    globalIdCart = idCart;
    globalAmount = amount
    globalIdUser = idUser;
    globalDiscount = idDiscount
    console.log('globalIdUser', globalIdUser);

    var orderInfo = '**Nap tien cho thue bao 0123456789. So tien 100,000 VND**'    // Thông tin mô tả nội dung thanh toá
    var orderType = req.body.orderType;  ////Mã danh mục hàng hóa. Mỗi hàng hóa sẽ thuộc một nhóm danh mục do VNPAY quy định. Xem thêm bảng Danh mục hàng hóa

    let locale = req.body.language;
    if (locale === null || locale === '' || locale === undefined) {
        locale = 'vn';
    }
    console.log('locale: ' + locale);

    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;  /// số tiền thanh toán 
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    // if(bankCode !== null && bankCode !== ''){
    //     vnp_Params['vnp_BankCode'] = bankCode;
    // }
    vnp_Params = sortObject(vnp_Params);

    var querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    res.status(200).json({
        vnpUrl: vnpUrl,
    });
}


const vnpay_return = async (req, res, next) => {
    let vnp_Params = req.query;


    let secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let config = require('config');
    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        try {

            // duyệt amng id cart và chỉnh sửa trạng thái 
            // trừ số lượng sản phẩm 
            // tạo mới bill 

            const dat_hang_thanh_cong = 3;
            const da_dat_hang = 'Đã đặt hàng'
            const idUser = globalIdUser;
            const idCart = globalIdCart;
            const amount = globalAmount;


            for (const itemCart of idCart) {
                const finCart = await mdCart.cartModel.findById(itemCart)
                const finProduct = await mdProduct.product_size_color_Model.findById(finCart.product_id)
                if (finProduct.quantity < finCart.quantity) {
                    res.render('order/success', { code: 'Không thể thực hiện , Số lượng mua vượt quá số lượng sản phẩm' })
                } else {
                    // // // trừ số luong sản phẩm
                    console.log(`Số lượng sản phẩm ${finProduct.quantity} -- số lượng sản phẩm giỏ hàng ${finCart.quantity}`);
                    finProduct.quantity -= finCart.quantity;
                    await finProduct.save();
                    // // thay đổi trạng thái cart 
                    finCart.status = da_dat_hang
                    await finCart.save();
                }
            }
            // get user and cart data

            const userData = await mdUser.userModel.findById(idUser);
            const userDataToSave = {
                username: userData.username,
                phone_number: userData.phone_number,
                role: userData.role,
                address: userData.address,
                full_name: userData.full_name,
                email: userData.email
            };
            //================
            const cartData = await mdCart.cartModel.find({ '_id': { $in: idCart } });
            const cartDataToSave = await Promise.all(cartData.map(async (cart) => {
                // get product data
                const productdetailData = await mdProduct_detail.product_size_color_Model.findById(cart.product_id);

                // get product data
                const productData = await mdProduct_.productModel.findById(productdetailData.product_id);

                // get size data
                const sizeData = await mdSize.sizeModel.findById(productdetailData.size_id);
                // get color data
                const colorData = await mdColor.colorModel.findById(productdetailData.color_id);

                // get category data
                const categoryData = await mdcategory.categoryModel.findById(productData.category_id);


                // create a new object with only the fields you need
                const productDataToSave = {
                    //=== deital
                    product_id: productData._id,

                    //=== deital
                    //=== product

                    name: productData.name,
                    description: productData.description,
                    image: productData.image,
                    category_id: productData.category_id,
                    price: productData.price,
                    createdAt: productData.createdAt,

                    //=== product
                    //===== category
                    category_name: categoryData.name,
                    //===== category

                    size_name: sizeData.name, // add size name
                    color_name: colorData.name, // add color name
                    color_code: colorData.colorcode // add color code
                };


                return {
                    product_id: cart.product_id,
                    _id: cart._id,
                    quantity: cart.quantity,
                    status: cart.status,
                    createdAt: cart.createdAt,
                    product_data: productDataToSave
                };
            }));
            var date = moment(Date.now()).utc().toDate();


            // 655d7897afc3bd165ef29ea5  Hồ trình
            // tạo mới bill 
            const newBillData = {
                user_id: idUser,
                cart_id: idCart,
                discount_id: globalDiscount || null,
                discount_data: globalDataDiscount || null,
                user_data: userDataToSave, // add user data
                cart_data: cartDataToSave, // add cart data
                payments: 2,
                total_amount: amount,
                status: dat_hang_thanh_cong,
                createdAt: date
            };

            const newBill = new mdBill.billModel(newBillData);
            newBill.save()
            console.log('globalDiscountasdasdawsdasd', globalDiscount);
            if (globalDiscount !== undefined && globalDiscount !== null && globalDiscount !== "") {
                const discountuser = await mdUserDiscount.userdiscountModel.findOne({
                    user_id: idUser,
                    discount_id: globalDiscount
                })
                if (discountuser) {
                    console.log('// vaof discountuserdiscountuserdiscountuser hop nay');
                    discountuser.usage_count += 1;
                    await discountuser.save();
                    console.log("discountuser ====>", discountuser);
                } else {
                    console.log('// vaof truwongf hop nay');
                    const newUserVoucher = new mdUserDiscount.userdiscountModel({
                        user_id: idUser,
                        discount_id: globalDiscount,
                        usage_count: 1
                    });
                    console.log('newUserVoucher=====>', newUserVoucher);

                    await newUserVoucher.save();
                }

            }


        } catch (error) {
            // res.render('order/success', { code: 'Đã xảy ra lỗi khi xử lý đơn hàng',error: error })
            return res.status(404).json({ error: "Đã xảy ra lỗi " + error.message });
        }
        res.render('order/success', {
            code: vnp_Params['vnp_ResponseCode']
        })
    } else {
        // res.render('order/success', { code: 'Đã xảy ra lỗi khi xử lý đơn hàng',error: error })
        return res.status(404).json({ error: "Đã xảy ra lỗi " + error.message });
    }
}


module.exports = { create_payment_url, vnpay_return }