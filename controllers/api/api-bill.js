var md = require('../../models/bill.model');
let mdBill = require('../../models/bill.model')
let mdProduct = require('../../models/product_size_color.model')
let mdCart = require('../../models/cart.model')
let mdUser = require('../../models/user.model')
let mdProduct_detail = require('../../models/product_size_color.model')
let mdProduct_ = require('../../models/product.model')
let mdSize = require('../../models/sizes.model')
let mdColor = require('../../models/color.model')
let mdcategory = require('../../models/category.model')
let mdDiscount = require('../../models/discount.model')
let mdUserDiscount = require('../../models/userdiscount.model')
let moment = require('moment')
let dateFormat = require('date-format')
let globalIdCart;
let globalIdUser;
let globalAmount;
let globalDiscount;
let globalDataDiscount;

var objReturn = {
    status: 1,
    msg: 'OK'
}
const { DateTime } = require('luxon');

// get
exports.listBill = async (req, res, next) => {
    let list = [];
    try {
        list = await md.billModel.find();
        if (list.length > 0)
            objReturn.data = list;
        else {
            objReturn.status = 0;
            objReturn.msg = 'Không có dữ liệu phù hợp';
        }

    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
    }

    res.json(objReturn);
}
// get theo id
exports.listBillByUserId = async (req, res, next) => {
    let userId = req.params.userId;
    // console.log("userId",userId);
    let list = [];
    try {
        list = await md.billModel.find({ user_id: userId })
            .populate("user_id")

            .populate({
                path: 'cart_id',
                populate: {
                    path: 'product_id',
                    model: 'product_size_color_Model',
                    populate: [
                        { path: 'product_id' },
                        { path: 'size_id' },
                        { path: 'color_id' }
                    ]
                },

            })
        if (list.length > 0)
            objReturn.data = list;
        else {
            objReturn.status = 0;
            objReturn.msg = 'Không có dữ liệu phù hợp';
        }
    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
    }

    res.json(objReturn);
}

// get có phân trang
exports.pagination = async (req, res, next) => {
    const PAGE_SIZE = 5;

    var page = req.query.page
    if (page) {
        page = parseInt(page)
        if (page < 1) {
            page = 1
        }
        var soLuongBoQua = (page - 1) * PAGE_SIZE

        md.billModel.find({})
            .skip(soLuongBoQua)
            .limit(PAGE_SIZE)
            .then(data => {
                res.json({
                    data,
                    PAGE_SIZE,
                    soLuongBoQua,
                    page,
                });
            })
            .catch(err => {
                catchError();
            })
    } else {
        md.billModel.find({})
            .then(data => {
                res.json(data);
            })
    }
}
// validate bill
const Joi = require('joi');

const schema = Joi.object({
    user_id: Joi.string().required(),
    cart_id: Joi.string().required(),
    payments: Joi.number().integer().required(),
    total_amount: Joi.number().integer().required()
});
// add bill 
exports.addBill = async (req, res, next) => {



    try {
        const dat_hang_thanh_cong = 1;
        const da_dat_hang = 'Đã đặt hàng'
        const idUser = req.params.idUser;
        const idCart = req.body.idCart;
        const amount = req.body.amount;
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
        globalDiscount = idDiscount



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


        const newBillData = {
            user_id: idUser,
            cart_id: idCart,
            discount_id: globalDiscount || null,
            discount_data: globalDataDiscount || null,
            user_data: userDataToSave, // add user data
            cart_data: cartDataToSave, // add cart data
            payments: 1,
            total_amount: amount,
            status: dat_hang_thanh_cong,
            createdAt: date
        };

        const newBill = new mdBill.billModel(newBillData);

        console.log('===========');
        console.log(newBill);
        console.log('===========');
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
    // res.render('order-success')
    res.json({ message: 'order-success' });
}
// Update Bill
exports.updateBill = async (req, res, next) => {
    try {
        const { status } = req.body; // get status from request body

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const updatedBill = await md.billModel.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!updatedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.json(updatedBill);
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server Error', error: err.toString() });
    }
}



// Delete Bill
exports.deleteBill = async (req, res, next) => {
    try {
        const deletedBill = await md.billModel.findByIdAndDelete(req.params.id);
        if (!deletedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json({ message: 'Bill deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error: err.toString() });
    }
}


exports.getBillById = async (req, res, next) => {
    let err = true;

    try {
        var idBill = req.params.idBill;
        var objBill = await md.billModel.findById(idBill);

        if (objBill) {
            err = false;
        }
    } catch (error) {
        console.log("không lấy được bill");
    }

    res.status(200).json({
        err: err,
        objBill: objBill
    });
}
