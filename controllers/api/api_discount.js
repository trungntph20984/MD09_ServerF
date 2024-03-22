const mddiscount = require('../../models/discount.model');
const mdBill = require('../../models/bill.model')
const mduserdiscount = require('../../models/userdiscount.model')
const moment = require('moment');
const getAllDiscount = async (req, res) => {
    const idUser = req.params.idUser;
    console.log(idUser);

    try {
        const datenoww = moment(Date.now()).format('YYYY-MM-DD HH:mm');
        let listdiscount = await mddiscount.discountModel.find({ user_id: idUser,
            start_day: { $lte: datenoww },
        }).populate('user_id', "username").sort({ createdAt: -1 });
        for (const item of listdiscount) {
            console.log(item.start_day);


            const finuserdiscount = await mduserdiscount.userdiscountModel.findOne({ user_id: idUser, discount_id: item._id }).populate('discount_id');
            if (finuserdiscount && item.usageCount === finuserdiscount.usage_count) {
                console.log('Nếu bằng thì vào đây ');
                // Lọc idUser khỏi mảng user_id
                item.user_id = item.user_id.filter(userId => userId._id.toString() !== idUser);
                console.log('item.user_id', item.user_id);

                // Lưu lại đối tượng sau khi cập nhật
                await item.save();
            }
        }

        return res.status(200).json({ message: 'Success', listdiscount: listdiscount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = { getAllDiscount };
