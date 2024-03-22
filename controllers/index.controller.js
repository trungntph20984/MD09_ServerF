const mUser = require('../models/user.model');
const mBill = require('../models/bill.model');
const mCart = require('../models/cart.model');
const mPDeital = require('../models/product_size_color.model');
const mongoose = require('mongoose');
var moment = require('moment-timezone');

let title = 'Thống kê '
let heading = 'Biểu đồ thống kê'


exports.bashboard = async (req, res, next) => {
    let dieu_kien_loc = {};

    // var bills = await mBill.billModel.find(dieu_kien_loc)
    //     .populate('user_id')
    //     .populate('user_data')
    //     .populate({
    //         path: 'cart_data',
    //         populate: {
    //             path: 'product_id',
    //             populate: [
    //                 { path: 'product_data' },
    //                 { path: 'size_id' },
    //                 { path: 'color_id' }
    //             ]
    //         }
    //     })
    //     .sort({ createdAt: -1 });

    //====
    // Doanh Thu Hôm Nay

    try {
        // Lấy ngày hiện tại
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Lấy ngày kết thúc của ngày hiện tại
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        // hôm nay
        const startOfTodayVietnam = moment().startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
        const endOfTodayVietnam = moment(endOfToday).add(7, 'hours').tz('Asia/Ho_Chi_Minh').toDate();
        // hôm qua
        const startOfYesterdayVietnam = moment().subtract(1, 'days').startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
        const endOfYesterdayVietnam = moment().subtract(1, 'days').endOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();

        // status bill được cho là thành công
        var mBillSatus = [3, 5, 6, 7, 8];


        // 111111111111
        // Tìm tổng tiền của mBill.billModel trong khoảng thời gian từ đầu ngày đến cuối ngày hiện tại
        const totalAmountAggregate_day = await mBill.billModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfTodayVietnam,
                        $lt: endOfTodayVietnam
                    },
                    status: {
                        $in: mBillSatus
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$total_amount" }
                }
            }
        ]);
        // Lấy tổng tiền từ kết quả aggregate (nếu có)
        // Tìm tổng tiền của mBill.billModel trong khoảng thời gian từ đầu ngày đến cuối ngày hôm qua
        const totalAmountAggregate_yesterday = await mBill.billModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfYesterdayVietnam,
                        $lt: endOfYesterdayVietnam
                    },
                    status: {
                        $in: mBillSatus
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$total_amount" }
                }
            }
        ]);
        const totalAmount_day = totalAmountAggregate_day.length > 0 ? totalAmountAggregate_day[0].total : 0;
        const totalAmount_yesterday = totalAmountAggregate_yesterday.length > 0 ? totalAmountAggregate_yesterday[0].total : 0;



        // 222222222222222222222
        // tính tổng người mua hàng hôm nay 
        // Tìm tổng số người mua hàng trong khoảng thời gian từ đầu ngày đến cuối ngày hôm nay
        const totalBuyersAggregate_day = await mBill.billModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfTodayVietnam,
                        $lt: endOfTodayVietnam
                    }
                }
            },
            {
                $group: {
                    _id: "$user_id",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBuyers: { $sum: 1 }
                }
            }
        ]);
        const totalBuyersAggregate_yesterday = await mBill.billModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfYesterdayVietnam,
                        $lt: endOfYesterdayVietnam
                    }
                }
            },
            {
                $group: {
                    _id: "$user_id",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBuyers: { $sum: 1 }
                }
            }
        ]);

        // Lấy tổng số người mua hàng từ kết quả aggregate của hôm nay (nếu có)
        const totalBuyers_day = totalBuyersAggregate_day.length > 0 ? totalBuyersAggregate_day[0].totalBuyers : 0;
        const totalBuyers_yesterday = totalBuyersAggregate_yesterday.length > 0 ? totalBuyersAggregate_yesterday[0].totalBuyers : 0;



        // 33333333333333
        const totalUsersAggregate = await mUser.userModel.aggregate([
            {
                $match: {
                    role: "User"
                }
            },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 }
                }
            }
        ]);
        // Lấy tổng số người dùng có role "User" từ kết quả aggregate
        const totalUsersWithRoleUser = totalUsersAggregate.length > 0 ? totalUsersAggregate[0].totalUsers : 0;
        //====
        const totalCartsAggregate = await mCart.cartModel.aggregate([
            {
                $match: {

                }
            },
            {
                $group: {
                    _id: null,
                    totalCarts: { $sum: 1 }
                }
            }
        ]);
        const totalCart = totalCartsAggregate.length > 0 ? totalCartsAggregate[0].totalCarts : 0;
        //====


        // 4444444444444444444444
        // Tính tổng tiền all hóa đơn
        const totalAmountAggregate = await mBill.billModel.aggregate([
            {
                $match: {
                    status: {
                        $in: mBillSatus
                    }
                }

            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$total_amount" }
                }
            }
        ]);
        const totalAmount = totalAmountAggregate.length > 0 ? totalAmountAggregate[0].total : 0;
        //====
        const totalQuantityAggregate = await mPDeital.product_size_color_Model.aggregate([
            {
                $group: {
                    _id: null,
                    totalQ: { $sum: "$quantity" }
                }
            }
        ]);
        const totalQuantity = totalQuantityAggregate.length > 0 ? totalQuantityAggregate[0].totalQ : 0;



        // chart chart ================= 1111111
        const m7daysAgoVietnam = moment().subtract(7, 'days').startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
        const m9daysAgoVietnam = moment().subtract(9, 'days').startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
        const m1YearAgoVietnam = moment().subtract(1, 'year').startOf('day').tz('Asia/Ho_Chi_Minh').add(7, 'hours').toDate();
        // người dùng được tạo trong 7 ngày gần nhất 

        // Tìm số lượng người dùng được tạo trong mỗi ngày cho 7 ngày gần nhất
        //================
        const userCreationCountAggregate = await mUser.userModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: m7daysAgoVietnam,
                        $lt: endOfTodayVietnam
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$created_at",
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);
        // Tạo mảng dữ liệu cho 7 ngày gần nhất
        const TotalUserDataGeneratedFor7Days = [];
        const currentDate = moment(startOfTodayVietnam);
        for (let i = 0; i < 7; i++) {
            const formattedDate = currentDate.format("YYYY-MM-DD");
            const foundItem = userCreationCountAggregate.find(item => item._id === formattedDate);
            const count = foundItem ? foundItem.count : 0;
            TotalUserDataGeneratedFor7Days.push(count);
            currentDate.subtract(1, 'days');
        }
        //==== lấy ng dùng được tạo gần nhất
        const latestUser = await mUser.userModel
            .findOne({})
            .sort({ created_at: -1 }) // Sắp xếp giảm dần theo created_at
            .select('username created_at full_name'); // Chọn trường username và created_at


        // chart chart ================= 22222222222
        const totalAmountAggregate10day = await mBill.billModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: m9daysAgoVietnam,
                        $lt: endOfTodayVietnam
                    },
                    status: {
                        $in: mBillSatus
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    totalAmount: { $sum: "$total_amount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        // Tạo mảng dữ liệu cho 10 ngày gần nhất
        const data10dayAmountBill = [];
        const currentDate10 = moment(startOfTodayVietnam);
        for (let i = 0; i < 10; i++) {
            const formattedDate = currentDate10.format("YYYY-MM-DD");
            const foundItem = totalAmountAggregate10day.find(item => item._id === formattedDate);
            const count = foundItem ? foundItem.totalAmount : 0;
            data10dayAmountBill.push(count);
            currentDate10.subtract(1, 'days');
        }




        // chart chart ================= 33333333333
        // thông tin doanh thu của 12 tháng gần nhất
        const totalAmountAggregate12Month = await mBill.billModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: m1YearAgoVietnam,
                        $lt: endOfTodayVietnam
                    },
                    status: {
                        $in: mBillSatus
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: "$createdAt"
                        }
                    },
                    totalAmount: { $sum: "$total_amount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        // Tạo mảng dữ liệu cho 12 tháng gần nhất
        const data12monthAmountBill = [];
        const currentDate12 = moment().startOf('month').tz('Asia/Ho_Chi_Minh').add(7, 'hours');

        for (let i = 0; i < 12; i++) {
            const formattedMonth = currentDate12.format("YYYY-MM");
            const foundItem = totalAmountAggregate12Month.find(item => item._id === formattedMonth);
            const count = foundItem ? foundItem.totalAmount : 0;
            data12monthAmountBill.push(count);
            currentDate12.subtract(1, 'months');
        }

        // sản phẩm bán chạy nhất
        const mostSoldProductName = await mBill.billModel.aggregate([
            {
                $match: {
                    status: {
                        $in: mBillSatus
                    }
                }
            }, {
                $unwind: "$cart_data"
            },
            {
                $match: {
                    "cart_data.status": "Đã đặt hàng"
                }
            },
            {
                $group: {
                    _id: "$cart_data.product_id",
                    totalQuantity: { $sum: "$cart_data.quantity" },
                    mostSoldProduct: { $first: "$cart_data.product_data.name" }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 1
            }
        ]);


        const mostSoldProductNameResult = mostSoldProductName[0] ? mostSoldProductName[0].mostSoldProduct : null;









        // ========Top 6 người dùng mua hàng nhiều nhất=======
        const topUsersInfo = await mBill.billModel.aggregate([
            {
                $match: {
                    status: {
                        $in: mBillSatus
                    }
                }
            },
            {
                $group: {
                    _id: "$user_id",
                    totalAmountSpent: { $sum: "$total_amount" },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { totalAmountSpent: -1 }
            },
            {
                $limit: 6
            },
            {
                $lookup: {
                    from: "users", // Tên của collection chứa thông tin người dùng
                    localField: "_id",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $project: {
                    _id: 1,
                    totalAmountSpent: 1,
                    totalOrders: 1,
                    avatar: { $ifNull: ["$userData.avata", "$_id.avata"] }, // Nếu không có avatar trong userData, sử dụng avatar từ _id
                    phone_number: "$userData.phone_number",
                    username: "$userData.username",
                    full_name: "$userData.full_name"
                }
            }
        ]);







        // ==============Tổng quan về đơn hàng======

        // lấy thông tin giỏ hàng mới nhất
        const latestCart = await mCart.cartModel
            .findOne({})
            .sort({ createdAt: -1 })
            .select('createdAt user_id product_id')
            .populate([
                {
                    path: 'user_id',
                    select: 'username' // Chọn chỉ trường 'username'
                },
                {
                    path: 'product_id',
                    populate: { path: 'product_id' } // Populate trường 'size_id' trong 'product_id'
                }
            ]);

        const mUserNameCart = latestCart?.user_id?.username;
        const mCreatedAtCart = latestCart?.createdAt;

        const mProductNameCart = latestCart?.product_id?.product_id?.name;
        // lấy thông tin đơn hàng mới nhất
        const latestBill = await mBill.billModel
            .findOne({})
            .sort({ createdAt: -1 })
            .select('createdAt user_data')
            .populate([
                {
                    path: 'user_data',
                    select: 'username'
                }
            ]);










        //=====


        // //=========
        // console.log("========================");

        // console.log("Tổng số người mua hàng trong ngày hôm nay:", totalBuyers_day);
        // console.log("Tổng số người mua hàng trong ngày hôm qua:", totalBuyers_yesterday);
        // console.log("Tổng tiền trong ngày hôm nay:", totalAmount_day);
        // console.log("ngày bắt đầu việt nam", startOfTodayVietnam);
        // console.log("ngày kết thúc việt nam", endOfTodayVietnam);
        // console.log("========================");
        // console.log("Tổng tiền trong ngày hôm qua:", totalAmount_yesterday);
        // console.log("ngày bắt đầu việt nam hôm qua", startOfYesterdayVietnam);
        // console.log("ngày kết thúc việt nam hôm qua", endOfYesterdayVietnam);
        // console.log("========================");
        // console.log("hơn người dùng ngày hôm qua", totalBuyers_yesterday - totalBuyers_day);
        // console.log("hơn doanh thu ngày hôm qua", totalAmount_day - totalAmount_yesterday);
        // console.log("========================");
        // console.log("Số người dùng có role là User", totalUsersWithRoleUser);
        // console.log("Tổng số cart", totalCart);
        // console.log("Tổng số quantity có trong kho", totalQuantity);
        // // chart  
        // console.log("7 ngày trước ", m7daysAgoVietnam);
        // console.log("9 ngày trước ", m9daysAgoVietnam);
        // console.log("1 năm trước ", m1YearAgoVietnam);
        // console.log("Số lượng người dùng được tạo trong 7 ngày gần nhất:", userCreationCountAggregate);
        // console.log("Số lượng người dùng được tạo trong 7 ngày gần nhất:", TotalUserDataGeneratedFor7Days);
        // console.log("Số lượng doanh thu của 10 ngày gần nhất:", totalAmountAggregate10day);
        // console.log("Số lượng doanh thu của 10 ngày gần nhất:", data10dayAmountBill);
        // console.log("Số lượng doanh thu của 12 tháng gần nhất:", totalAmountAggregate12Month);
        // console.log("Số lượng doanh thu của 12 tháng gần nhất:", data12monthAmountBill);
        // console.log("sản phẩm bán chạy nhất:", mostSoldProductNameResult);
        // console.log("topUsersInfo:", topUsersInfo);

        // // tong quan
        // console.log("Thông tin của người dùng được tạo gần nhất:", latestUser);
        // console.log("Thông tin của đơn hàng được tạo gần nhất:", latestBill);
        // console.log("Thông tin của giỏ hàng được tạo gần nhất name user:", mProductNameCart);
        // console.log("Thông tin của giỏ hàng được tạo gần nhất name product:", mUserNameCart);
        // console.log("Thông tin của giỏ hàng được tạo gần nhất createdAt cart:", mCreatedAtCart);
        // console.log("Top 6 users info:", topUsersInfo);




        //====

        res.render('index', {
            title: title,
            heading: heading,
            totalAmount_day: totalAmount_day,
            totalBuyers_day: totalBuyers_day,
            than_yesterdaytotalAmount: totalAmount_day - totalAmount_yesterday,
            than_yesterdaytotalBuyers: totalBuyers_day - totalBuyers_yesterday,
            totalCart: totalCart,
            totalUsersWithRoleUser: totalUsersWithRoleUser,
            totalQuantity: totalQuantity,
            TotalUserDataGeneratedFor7Days: TotalUserDataGeneratedFor7Days,//ARRAY
            TotaData10DayAmountBill: data10dayAmountBill,//ARRAY
            data12monthAmountBill: data12monthAmountBill,//ARRAY
            mostSoldProductNameResult: mostSoldProductNameResult,
            latestUser: latestUser,
            latestBill: latestBill,
            topUsersInfo: topUsersInfo,
            mProductNameCart: mProductNameCart,
            mUserNameCart: mUserNameCart,
            mCreatedAtCart: mCreatedAtCart,
            moment: moment,
            totalAmount: totalAmount
        });

    } catch (error) {
        console.error("Lỗi :", error);
        next(error);
    }
}










exports.login = async (req, res, next) => {
    let msg = "";
    let typeErr = false;
    if (req.method == 'POST') {
        let Username = req.body.Username;
        let Password = req.body.Password;

        let objUser = await mUser.userModel.findOne({ username: Username });

        if (objUser) {
            if (objUser.password == Password) {
                if (objUser.role != "User") {
                    if (objUser.status) {
                        console.log("User " + objUser.username);
                        req.session.userLogin = objUser;
                        res.locals.user = req.session.userLogin;
                        console.log("lưu trong locals" + res.locals.user);


                        res.redirect('/');
                        return
                    } else {
                        msg = "Tài khoản của bạn đã bị khóa";
                        typeErr = true;
                    }
                } else {
                    msg = "Tài khoản khách không thể đăng nhập vào wed";
                    typeErr = true;
                }
            } else {
                msg = "Mật khẩu không chính xác";
                typeErr = true;
            }
        } else {
            msg = "Tài khoản không tồn tại";
            typeErr = true;
        }
    }

    res.render('user/login',
        {
            title: title,
            heading: heading,
            msg: msg,
            typeErr: typeErr
        }
    )
}

exports.logout = async (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return;
        } else {
            res.redirect('/login');
            return;
        }
    })
}