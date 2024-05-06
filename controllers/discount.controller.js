let mdProduct_ = require('../models/product.model')
let mduser = require('../models/user.model')
let mddiscount = require("../models/discount.model")
const moment = require('moment');

const getAllDiscount = async (req, res) => {
    const aler = req.query.aler;
    const listUser = await mduser.userModel.find();
    let litsDiscount = await mddiscount.discountModel.find().sort({ createdAt: -1 });
    const lengthUser = listUser.length;
    // console.log('litsDiscountlitsDiscount', litsDiscount);
    res.render('discount/list', {
        title: "MD09",
        heading: "Danh sách Voucher",
        message: "",
        listUser: listUser,
        lengthUser: lengthUser,
        litsDiscount: litsDiscount,
        message: aler
    });
}

const addDiscount = async (req, res) => {
    try {
        const { description, user, usageCount, price, voucherCode, end_day, start_day } = req.body;
        let users = []
        if (!user) {
            const listUsser = await mduser.userModel.find();
            listUsser.forEach(itemUser => {
                console.log('đẩy vào mảng');
                users.push(itemUser._id);
            });
        }
        console.log('Đây là mảng users', users);
        const startDayVN = moment(start_day).format('YYYY-MM-DD HH:mm');
        const endDayVN = moment(end_day).format('YYYY-MM-DD HH:mm');

        const discount = new mddiscount.discountModel({
            description,
            user_id: !user ? users : user,
            start_day: startDayVN,
            end_day: endDayVN,
            usageCount,
            price,
            code_discount: voucherCode,
            createdAt: new Date(),
        });
        await discount.save();
        res.redirect(`/discount/?aler=Thêm thành công`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};
const deleteDiscount = async (req, res) => {
    try {
        const discountId = req.params.id;
        if (!discountId) {
            return res.status(400).json({ message: 'ID voucher không hợp lệ.' });
        }
        const existingDiscount = await mddiscount.discountModel.findById(discountId);
        if (!existingDiscount) {
            return res.status(404).json({ message: 'Voucher không tồn tại.' });
        }
        await mddiscount.discountModel.findByIdAndDelete(discountId);
        res.redirect(`/discount/?aler=Xóa thành công`);
    } catch (error) {
        console.error('Lỗi khi xóa voucher:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.' });
    }
};

const deleteExpiredDiscounts = async () => {
    try {
        // Lấy tất cả các discount đã hết hạn
        const expiredDiscounts = await mddiscount.discountModel.find({
            end_day: { $lt: new Date() } // Lọc các bản ghi có end_day nhỏ hơn thời điểm hiện tại
        });

        // Chuyển đổi định dạng ngày cho mỗi bản ghi để đảm bảo so sánh đúng
        const currentDate = new Date();

        const filteredExpiredDiscounts = expiredDiscounts.filter(discount => {
            const discountEndDate = new Date(discount.end_day);
            return discountEndDate < currentDate;
        });

        console.log('Bản ghi đã hết hạn sau khi lọc:', filteredExpiredDiscounts);

        // Xác nhận bản ghi đã hết hạn và xóa chúng
        for (const expiredDiscount of filteredExpiredDiscounts) {
            const deletedResult = await mddiscount.discountModel.deleteOne({ _id: expiredDiscount._id });
            console.log('Đã xóa bản ghi đã hết hạn:', deletedResult);
        }

    } catch (error) {
        console.error('Lỗi khi xóa discount đã hết hạn:', error);
    }
};

setInterval(deleteExpiredDiscounts, 1 * 60 * 1000);




const editDiscount = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const idDiscount = req.params.id;
            console.log(' req.body', req.body);
            // Lấy dữ liệu hiện tại của mã giảm giá từ cơ sở dữ liệu
            const existingDiscount = await mddiscount.discountModel.findById(idDiscount);
            // console.log('existingDiscount', existingDiscount);
            if (!existingDiscount) {
                return res.status(404).json({ error: 'Mã giảm giá không tồn tại' });
            }

            // Cập nhật các trường cần thiết từ req.body
            existingDiscount.code_discount = req.body.code_discount || existingDiscount.code_discount;
            existingDiscount.start_day = req.body.start_day || existingDiscount.start_day;
            existingDiscount.end_day = req.body.end_day || existingDiscount.end_day;
            existingDiscount.user_id = req.body.user || existingDiscount.user_id;
            existingDiscount.price = req.body.price || existingDiscount.price;
            existingDiscount.description = req.body.description || existingDiscount.description;
            existingDiscount.usageCount = req.body.usageCount || existingDiscount.usageCount;

            await existingDiscount.save();
            res.redirect(`/discount/?aler=Cập nhật thành công`);
        }
    } catch (error) {
        console.error('Lỗi trong editDiscount:', error);
        return res.status(500).json({ error: 'Đã xảy ra lỗi server' });
    }
}


module.exports = { getAllDiscount, addDiscount, deleteDiscount, editDiscount }
