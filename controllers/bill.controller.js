var fs = require('fs');
const billMD = require('../models/bill.model');
const mongoose = require('mongoose');
var moment = require('moment-timezone');

let title = 'Hóa Đơn'
let heading = 'Danh sách hóa đơn'
let msg = ''
let msg2 = ''

const { log } = require('console');

exports.loc = async (req, res, next) => {

    if (req.method == 'GET') {
        try {
            // phân trang
            // Thêm mã này để xử lý phân trang
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;

            let { 'from-date': fromDate, 'to-date': toDate } = req.query;

            //==============
            let dieu_kien_loc = {};

            if (req.query['payments']) {
                dieu_kien_loc.payments = req.query['payments'];
            }
            //== loc status
            if (req.query['status']) {
                dieu_kien_loc.status = req.query['status'];
            }
            //== loc ngay don

            if (fromDate && toDate && moment(fromDate, 'YYYY-MM-DD', true).isValid() && moment(toDate, 'YYYY-MM-DD', true).isValid()) {
                // Chuyển đổi chuỗi ngày thành đối tượng Date
                fromDate = moment(fromDate, 'YYYY-MM-DD').toDate();
                toDate = moment(toDate, 'YYYY-MM-DD').toDate();

                // Tăng ngày kết thúc lên 1 để bao gồm cả ngày kết thúc trong khoảng tìm kiếm
                toDate.setDate(toDate.getDate() + 1);

                // Thêm điều kiện lọc theo ngày
                dieu_kien_loc.createdAt = {
                    $gte: fromDate,
                    $lt: toDate
                };
            }

            //== loc ma don hang

            if (req.query['id_'] && mongoose.Types.ObjectId.isValid(req.query['id_'])) {
                dieu_kien_loc._id = req.query['id_'];
            } else {
            }
            //== loc ma nguoi dung
            if (req.query['user-id'] && mongoose.Types.ObjectId.isValid(req.query['user-id'])) {
                dieu_kien_loc.user_id = req.query['user-id'];
            } else {
            }
            //===
            //=== lọc theo giá
            if (req.query['min-price'] && req.query['max-price']) {
                dieu_kien_loc.total_amount = {
                    $gte: Number(req.query['min-price']),
                    $lte: Number(req.query['max-price'])
                };
            }
            //===



            var bills = await billMD.billModel.find(dieu_kien_loc)
                .skip(skip)
                .limit(limit)
                .populate('user_id')
                .populate({
                    path: 'user_data',
                    populate: {
                        path: 'address',
                        model: 'addressModel'
                    }
                })
                .populate({
                    path: 'cart_data',
                    populate: {
                        path: 'product_id',
                        populate: [
                            { path: 'product_data' },
                            { path: 'size_id' },
                            { path: 'color_id' }
                        ]
                    }
                })
                .sort({ createdAt: -1 });
            // console.log(bills);

            // Tính tổng số trang
            const totalBills = await billMD.billModel.countDocuments(dieu_kien_loc);
            const totalPages = Math.ceil(totalBills / limit);

            // thống kê màn hình hóa đơn
            // Tính tổng số hóa đơn
            let tong_so_hoa_don = await billMD.billModel.countDocuments(dieu_kien_loc);
            // Tính tổng số hóa đơn đã thanh toán
            let tong_so_hoa_don_da_thanh_toan = await billMD.billModel.countDocuments({
                ...dieu_kien_loc,
                //  <!-- status đã thanh toán == 3 5 6 7 8 -->

                status: { $in: [3, 5, 7, 6, 8] }
            });

            // Tính tỷ lệ phần trăm
            let ti_le_thanh_toan = ((tong_so_hoa_don_da_thanh_toan / tong_so_hoa_don) * 100).toFixed(2);

            // Tính tổng tiền
            let tong_tien = await billMD.billModel.aggregate([
                { $match: dieu_kien_loc },
                { $group: { _id: null, total: { $sum: "$total_amount" } } }
            ]);


            //  <!-- status đã thanh toán == 3 5 6 7 8 -->
            // Tính tổng tiền đã thanh toán
            let tong_tien_da_thanh_toan = await billMD.billModel.aggregate([
                { $match: { ...dieu_kien_loc, status: { $in: [3, 5, 7, 6, 8] } } },
                { $group: { _id: null, total: { $sum: "$total_amount" } } }
            ]);
            // Tính tổng số hóa đơn có payments = 1
            let tong_so_hoa_don_payments_1 = await billMD.billModel.countDocuments({ ...dieu_kien_loc, payments: 1 });

            // Tính tổng số hóa đơn có payments = 2
            let tong_so_hoa_don_payments_2 = await billMD.billModel.countDocuments({ ...dieu_kien_loc, payments: 2 });
            // Kiểm tra kết quả và gán giá trị
            tong_tien = tong_tien.length > 0 ? tong_tien[0].total : 0;
            tong_tien_da_thanh_toan = tong_tien_da_thanh_toan.length > 0 ? tong_tien_da_thanh_toan[0].total : 0;
            //===

            // var date = moment(bills.createdAt).tz('Asia/Ho_Chi_Minh').format('HH:mm - DD/MM/YYYY');
            bills.forEach(bill => {
                var date = new Date(bill.createdAt);
                date.setHours(date.getHours() + 7);
                bill.createdAt = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            });

            if (!bills) {
                res.status(404).send('Tìm kiếm thất bại');
                msg2 = 'Tìm kiếm thất bại';
                msg = '';

            } else {
                res.render('bill/index', {
                    msg: msg,
                    msg2: msg2,
                    title: title,
                    heading: heading,
                    bills: bills,
                    totalPages: totalPages,
                    currentPage: page,
                    query: req.query,
                    tong_so_hoa_don: tong_so_hoa_don,
                    tong_tien: tong_tien,
                    tong_tien_da_thanh_toan, tong_tien_da_thanh_toan,
                    tong_so_hoa_don_payments_1: tong_so_hoa_don_payments_1,
                    tong_so_hoa_don_payments_2: tong_so_hoa_don_payments_2,
                    ti_le_thanh_toan: ti_le_thanh_toan
                });
            }

        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    } else if (req.method == 'POST') {
        try {
            // Lấy ID của bill từ req.body
            const billId = req.body.billId;
            const tokenUser = req.body.tokenUser;
            // Lấy trạng thái mới từ req.body
            const newStatus = req.body.status;
            let mStatus = '';

            // Tìm bill bằng ID và cập nhật trạng thái
            await billMD.billModel.findByIdAndUpdate(billId, { status: newStatus });

            console.log(`PUT /bill 200/${billId} with status ${newStatus}`);

            if (newStatus == 1) {
                mStatus = 'Đã đặt hàng';
            } else if (newStatus == 2) {
                mStatus = 'Đặt hàng thất bại';
            } else if (newStatus == 3) {
                mStatus = 'Đã thanh toán';
            } else if (newStatus == 4) {
                mStatus = 'Chưa thanh toán';
            } else if (newStatus == 5) {
                mStatus = 'Đang vận chuyển';
            } else if (newStatus == 6) {
                mStatus = 'Vận chuyển thất bại';
            } else if (newStatus == 7) {
                mStatus = 'Hoàn thành';
            } else if (newStatus == 8) {
                mStatus = 'Người mua không nhận hàng';
            } else if (newStatus == 9) {
                mStatus = 'Hủy';

            }



            if (tokenUser == '') {
                res.redirect('back');
                return

            }

            const formData = new FormData();
            formData.append('listToken', [tokenUser]);
            formData.append('title', 'Thông Báo');  // text status
            formData.append('content', `Đơn hàng "${billId}" đã được cập nhật : ${mStatus}`); // 
            formData.append('payload', billId); // ID BILL
            formData.append('status', '2');
            formData.append('inputImage', '');

            fetch('http://localhost:3000/notification', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Thành công : " + data);
                })
                .catch(error => {
                    console.log("Thất bại :" + error);
                });


            res.redirect('back');
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    }


}
exports.detail = async (req, res, next) => {
    let id = req.params.id;

    try {
        var bill = await billMD.billModel.findById(id)
            .populate({
                path: 'user_data',
                populate: {
                    path: 'address',
                    model: 'addressModel'
                }
            })
            .populate({
                path: 'cart_data',
                populate: {
                    path: 'product_id',
                    populate: [
                        { path: 'product_data' },
                        { path: 'size_id' },
                        { path: 'color_id' }
                    ]
                }
            })
        console.log(bill);



    } catch (error) {

    }


    res.render('bill/detail', {
        title: title,
        heading: heading,
        bill: bill
    });

}



