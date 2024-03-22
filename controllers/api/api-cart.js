var md = require('../../models/cart.model');
var mdUser = require('../../models/user.model');
var mdProduct = require('../../models/product_size_color.model')
var objReturn = {
    status: 1,
    msg: 'OK'
}

// // get
// exports.listCart = async (req, res, next) => {
//     let list = [];

//     try {
//         list = await md.cartModel.find();
//         if (list.length > 0)
//             objReturn.data = list;
//         else {
//             objReturn.status = 0;
//             objReturn.msg = 'Không có dữ liệu phù hợp';

//         }
//     } catch (error) {
//         objReturn.status = 0;
//         objReturn.msg = error.message;
//     }

//     res.json(objReturn);
// }
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

        md.cartModel.find({})
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
        md.cartModel.find({})
            .then(data => {
                res.json(data);
            })
    }
}
// validate Cart
const Joi = require('joi');

const schema = Joi.object({
    user_id: Joi.string().required(),
    product_id: Joi.string().required(),
    quantity: Joi.number().integer().required(),
    status: Joi.string().required()
});
// add Cart 
// exports.addCart = async (req, res, next) => {
//     try {
//         const validation = schema.validate(req.body);
//         if (validation.error) {
//             return res.status(400).json({ message: 'Validation Error', error: validation.error.details });
//         }


//         const cart = req.body;
//         const newCart = md.cartModel(cart);
//         await newCart.save();
//         console.log(newCart);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ message: 'Server Error', error: err.toString() });
//     }

//     res.json(objReturn);
// }
// Update Cart


// Delete Cart
exports.deleteCart = async (req, res, next) => {
    try {
        const deletedCart = await md.cartModel.findByIdAndDelete(req.params.id);
        if (!deletedCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        console.log(deletedCart);
        res.json({ message: 'Cart deleted' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server Error', error: err.toString() });
    }
}

exports.listCart = async (req, res) => {
    try {
        const id_User = req.params.idUser;
        let listCart = await md.cartModel.find({ user_id: id_User })
            .populate({
                path: 'product_id',
                populate: {
                    path: 'product_id size_id color_id',
                    select: 'name image price discount' 
                }
            })
            .populate('user_id')
            .sort({ createdAt: -1 });

        // Lọc các cart có status không phải 'đã đặt hàng'
        listCart = listCart.filter(item => item.status !== 'Đã đặt hàng');
        
        for (const item of listCart) {
            if (item.product_id && item.product_id.quantity < item.quantity) {
                if (item.status === 'successfully') {
                    item.status = 'Sản phẩm của bạn đã vượt quá số lượng';
                    await item.save();
                }
            } else {
                if (item.status === 'Sản phẩm của bạn đã vượt quá số lượng') {
                    item.status = 'successfully';
                    await item.save();
                }
            }
        }

        if (!listCart || listCart.length === 0) {
            return res.json({ message: 'Giỏ hàng của bạn chưa có sản phẩm nào, thêm sản phẩm vào giỏ hàng ngay!', listCart: [] });
        }

        res.json({ message: 'Get the list successfully', listCart: listCart });
    } catch (error) {
        console.error('Error in listCart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.addCart = async (req, res) => {
    const id_Product = req.params.idProduct;
    const id_User = req.params.idUser;
    const quantityCart = req.body.quantity;

    try {
        const user = await mdUser.userModel.findById(id_User);
        const product = await mdProduct.product_size_color_Model.findById(id_Product);
        if (!user || !user._id) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        } else if (!product || !product._id) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        const existingCartItems = await md.cartModel.find({
            user_id: user._id,
            product_id: product._id,
        });

        if (existingCartItems.length > 0) {
            for (const existingCartItem of existingCartItems) {
                // Kiểm tra nếu trạng thái là 'successfully'
                if (existingCartItem.status === 'successfully') {

                    existingCartItem.quantity += quantityCart;

                    if (existingCartItem.quantity > product.quantity || existingCartItem.quantity <= 0) {
                        return res.json({ message: 'Số lượng giỏ hàng đã vượt quá số lượng sản phẩm' });
                    }
                    await existingCartItem.save();
                    return res.json({ message: 'Add Cart successfully' });
                }
            }
        }

        // không phải 'successfully', thêm một mục mới
        const cartobj = new md.cartModel({
            user_id: user._id,
            product_id: product._id,
            quantity: quantityCart,
            status: 'successfully',
            createdAt: Date.now(),
        });
        if (cartobj.quantity > product.quantity || cartobj.quantity <= 0) {
            return res.json({ message: 'Số lượng giỏ hàng đã vượt quá số lượng sản phẩm' });
        }
        await cartobj.save();

        res.json({ message: 'Add Cart successfully' });
    } catch (error) {
        // Xử lý lỗi
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.updateCart = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            const id_Cart = req.params.idCart;
            const quantityCart = req.body.quantity
            const findCart = await md.cartModel.findById(id_Cart)


            const findproduct = await mdProduct.product_size_color_Model.findById(findCart.product_id)
            if (quantityCart > findproduct.quantity || quantityCart <= 0) {
                return res.json({ message: 'Không thể thực hiện' });
            }

            await md.cartModel.findByIdAndUpdate(id_Cart,
                {
                    quantity: quantityCart,
                    updatedAt: Date.now(),
                });
            res.json({ message: 'Update Sucsess ' });
        }

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server Error', error: err.toString() });
    }
}