const { nextTick } = require('process');
var md = require('../../models/user.model');
const mdConversation = require('../../models/conversation.model')
const mdMessage = require('../../models/message.model')
let moment = require('moment')

var fs = require('fs');
var objReturn = {
    status: 1,
    msg: 'OK'
}

exports.listUser = async (req, res, next) => {
    let list = [];

    try {
        list = await md.userModel.find();
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

exports.getUserById = async (req, res, next) => {
    let err = true;

    try {
        let idUser = req.params.idUser;
        var objUser = await md.userModel.findById(idUser).getProfile().exec();
        err = false;
    } catch (error) {
        console.log("error : " + error);
    }

    res.status(200).json({
        err: err,
        objUser: objUser
    });
}

exports.userLogin = async (req, res, next) => {
    let msg = "";
    let err = true;
    let objUser;

    if (req.method == 'POST') {
        let sUsername = req.body.Username;
        let password = req.body.Password;

        if (!isNaN(sUsername)) {
            objUser = await md.userModel.findOne({ phone_number: sUsername })
        } else if (sUsername.split('@').length >= 2) {
            objUser = await md.userModel.findOne({ email: sUsername });
        } else {
            objUser = await md.userModel.findOne({ username: sUsername });
        }

        if (objUser) {
            var objAddress = await md.addressModel.findById(objUser.address);

            if (objUser.status) {
                if (objUser.password == password) {

                    msg = "Đăng nhập thành công"
                    err = false;
                } else {
                    msg = "Mật khẩu không chính xác"
                }
            } else {
                msg = "Tải khoản đã bị khóa"
            }

        } else {
            msg = "Tài khoản không tồn tại"
        }
    } else {
        msg = "err method : vui lòng dùng method POST"
    }

    res.status(200).json({
        msg: msg,
        err: err,
        idUser: objUser != null ? objUser._id : "",
        role: objUser != null ? objUser.role : "",
        avata: objUser != null ? objUser.avata : "",
        phone: objUser != null ? objUser.phone_number : "",
        email: objUser != null ? objUser.email : "",
        fullname: objUser != null ? objUser.full_name : "",
        address: objUser != null ? objUser.address : "",
        address_city: objAddress != null ? objAddress.address : "",
        specific_addres: objAddress != null ? objAddress.specific_addres : ""
    });
}

exports.userLoginPhone = async (req, res, next) => {
    let msg = "";
    let err = true;
    let objUser;

    if (req.method == 'POST') {
        let phone = req.body.Phone;
        try {
            objUser = await md.userModel.findOne({ phone_number: phone });
        } catch (error) {
            console.log("Số điện thoại chưa đăng ký");
        }

        if (objUser) {
            var objAddress = await md.addressModel.findById(objUser.address);
            if (objUser.status) {
                msg = "Đăng nhập thành công";
                err = false;
            } else {
                msg = "Tài khoản đã bị khóa";
            }

        } else {
            msg = "Số điện thoại chưa đăng ký";
        }

    } else {
        msg = "err method : vui lòng dùng method POST";
    }

    res.status(200).json({
        msg: msg,
        err: err,
        idUser: objUser != null ? objUser._id : "",
        role: objUser != null ? objUser.role : "",
        avata: objUser != null ? objUser.avata : "",
        phone: objUser != null ? objUser.phone_number : "",
        email: objUser != null ? objUser.email : "",
        fullname: objUser != null ? objUser.full_name : "",
        address: objUser != null ? objUser.address : "",
        address_city: objAddress != null ? objAddress.address : "",
        specific_addres: objAddress != null ? objAddress.specific_addres : ""
    });
}

exports.setToken = async (req, res, next) => {
    let msg = "";
    let err = true;
    let objUser;

    if (req.method == 'PUT') {
        let idUser = req.params.idUser;
        let token = req.body.token;
        let deviceId = req.body.deviceId;

        try {
            objUser = await md.userModel.findById(idUser);
        } catch (error) {
            console.log("tài khoản không tồn tại");
        }

        if (objUser) {
            objUser.token = token;

            if (objUser.deviceId == deviceId) {
                err = false;
            } else if (objUser.deviceId == "" || !objUser.deviceId) {
                objUser.deviceId = deviceId;
                try {
                    await md.userModel.findByIdAndUpdate(idUser, objUser);
                    msg = "update thành công";
                    err = false;
                } catch (error) {
                    msg = "update thất bại";
                }
            } else {
                objUser.deviceId = deviceId;
                try {
                    await md.userModel.findByIdAndUpdate(idUser, objUser);
                    msg = "đăng nhập thiết bị 2";
                    err = false;
                } catch (error) {
                    msg = "update thất bại";
                }
            }
        } else {
            msg = "Tài khoản không tồn tại";
        }
    } else {
        msg = "err method : vui lòng dùng method PUT"
    }

    res.status(200).json({
        msg: msg,
        err: err
    });
}
exports.setSocketId = async (req, res, next) => {
    let msg = "";
    let err = true;
    let objUser;

    if (req.method === 'PUT') {
        const idUser = req.params.idUser;
        const socketId = req.body.socketId;

        try {
            objUser = await md.userModel.findById(idUser);
        } catch (error) {
            console.log("Tài khoản không tồn tại");
        }

        if (objUser) {
            objUser.socketId = socketId;

            try {
                await md.userModel.findByIdAndUpdate(idUser, objUser);
                msg = "Thiết lập socket ID thành công";
                err = false;
            } catch (error) {
                msg = "Thiết lập socket ID thất bại";
            }
        } else {
            msg = "Tài khoản không tồn tại";
        }
    } else {
        msg = "Lỗi phương thức: Vui lòng sử dụng phương thức PUT";
    }

    res.status(200).json({
        msg: msg,
        err: err
    });
}
exports.getSocketIdByUserId = async (req, res) => {
    const idUser = req.params.idUser;

    try {
        const user = await md.userModel.findById(idUser);

        if (user) {
            const socketId = user.socketId || null;
            res.status(200).json({ socketId: socketId });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.checkLogin = async (req, res, next) => {
    let msg = "";
    let err = true;
    let objUser;

    if (req.method == 'POST') {
        let idUser = req.params.idUser;
        let deviceId = req.body.deviceId;

        try {
            objUser = await md.userModel.findById(idUser);
        } catch (error) {
            console.log("tài khoản không tồn tại");
        }

        if (objUser) {
            if (objUser.status) {
                if (objUser.deviceId == deviceId) {
                    msg = "Đã đăng nhập";
                    err = false;
                } else {
                    msg = "Tài khoản đã đăng nhập ở nơi khác"
                }
            } else {
                msg = "Tài khoản đã bị khóa";
            }
        } else {
            msg = "Tài khoản không tồn tại";
        }
    } else {
        msg = "err method : vui lòng dùng method POST"
    }

    res.status(200).json({
        msg: msg,
        err: err
    });
}

exports.changePassword = async (rep, res, next) => {
    let msg = "";
    let err = true;

    try {
        var idUser = rep.params.idUser;
        var password = rep.body.password;
        var newPassword = rep.body.newPassword;
        var objUser = await md.userModel.findById(idUser);
    } catch (error) {
        console.log("User không tồn tại");
    }

    if (objUser) {
        if (objUser.password == "") {
            msg = "Tải khoàn chưa có mật khẩu"
        } else {
            if (objUser.password == password) {
                objUser.password = newPassword;
                try {
                    await md.userModel.findByIdAndUpdate(idUser, objUser);
                    msg = "Thay đổi mật khẩu thành công"
                    err = false;
                } catch (error) {
                    msg = "Không thành công, vui lòng thử lại sau";
                    console.log("change passwor : " + error);
                }
            } else {
                msg = "Mật khẩu không chính xác";
            }
        }
    } else {
        msg = "Tài khoàn không tồn tại";
    }

    res.status(200).json({
        msg: msg,
        err: err
    })
}

exports.addMethodLogin2 = async (req, res, next) => {
    let msg = "";
    let err = true;

    try {
        var idUser = rep.params.idUser;
        var username = req.body.username;
        var password = req.body.password;
        var objUser = await md.userModel.findById(idUser);

        var objUser2;
        if (username.split('@').length >= 2) {
            objUser2 = await md.userModel.findOne({ email: username });
            objUser.email = username;
        } else {
            objUser2 = await md.userModel.findOne({ username: username });
            objUser.username = username;
        }

    } catch (error) {
        console.log(error);
    }

    if (objUser) {
        if (objUser.password != "") {
            msg = "Mật khẩu đã được tạo"
        } else {
            if (objUser2) {
                msg = "Username/email đã được sử dụng";
            } else {
                objUser.password = password;

                try {
                    await md.userModel.findByIdAndUpdate(idUser, objUser);
                    msg = "Thêm thành công";
                    err = false;
                } catch (error) {
                    msg = "Thêm thất bại, vui lòng thử lại sau"
                }
            }
        }
    } else {
        msg = "Tài khoàn không tồn tại";
    }

    res.status(200).json(
        {
            msg: msg,
            err: err
        }
    )
}

exports.logout = async (req, res, next) => {
    let msg = "";
    let err = true;
    let objUser;

    if (req.method == 'POST') {
        let idUser = req.params.idUser;

        try {
            objUser = await md.userModel.findById(idUser);
        } catch (error) {
            console.log("tài khoản không tồn tại");
        }

        if (objUser) {
            objUser.token = "";
            objUser.deviceId = "";
            try {
                await md.userModel.findByIdAndUpdate(idUser, objUser);
                msg = "Logout thành công";
                err = false;
            } catch (error) {
                msg = "Logout thất bại";
            }
        } else {
            msg = "Tài khoản không tồn tại";
        }

    } else {
        msg = "err method : vui lòng dùng method POST"
    }

    res.status(200).json({
        msg: msg,
        err: err
    });
}

exports.addUser = async (req, res, next) => {
    let msg = "";
    let err = true;
    let objUser = new md.userModel();
    let idadmin = "65849105a6299a9efc3909db";

    if (req.method == 'POST') {
        let username = req.body.username;
        let phone = req.body.Phone;
        let fullname = req.body.Fullname;
        let email = req.body.Email;
        let password = req.body.Password;
        let token = req.body.Token;
        let deviceId = req.body.DeviceId;
        let address = req.body.address;

        objUser.username = username;
        objUser.full_name = fullname;
        objUser.phone_number = phone;
        objUser.role = "User";
        objUser.socketId = "9105a6299a9";
        objUser.status = true;
        objUser.token = token;
        objUser.deviceId = deviceId;
        objUser.address = address;

        objUser.email = email;
        objUser.password = password;

        // Thêm trường created_at với giá trị là ngày hiện tại

        var date = moment(Date.now()).utc().toDate();
        objUser.created_at = date;

        if (req.file) {
            try {
                fs.renameSync(req.file.path, './public/avatas/' + objUser._id + '_' + req.file.originalname);
                objUser.avata = '/avatas/' + objUser._id + '_' + req.file.originalname;
            } catch (error) {
                console.log("Ảnh bị lỗi rồi: " + error);
            }
        } else {
            objUser.avata = '/avatas/6592854181e88d638499dd26_user.png';
        }

        try {
            var objUserPhone = await md.userModel.findOne({ phone_number: phone });
            if (String(username) != "") {
                var objUserEmail = await md.userModel.findOne({ username: username });
            } else {
                var objUserEmail = false;
            }

        } catch (error) {
            console.log(error);
        }

        if (objUserPhone) {
            console.log('có sdt' + objUserPhone);

            msg = "Số điện thoại đã được đăng ký";
        } else if (objUserEmail) {
            console.log('có emil' + objUserEmail);

            msg = "Username đã được đăng ký";
        } else {
            try {
                await objUser.save();
                msg = "Tạo tài khoản thành công";
                err = false;
                try {
                    const newUser = await md.userModel.findOne({ phone_number: phone });
                    // console.log("nguoi dung moi", newUser);
                    if (newUser) {
                        // Tạo cuộc trò chuyện mới
                        const newConversation = new mdConversation.ConversationModel({
                            members: [newUser._id, idadmin],  // Thêm _id của người dùng và admin
                            createdAt: date

                        });


                        // Lưu cuộc trò chuyện vào cơ sở dữ liệu
                        await newConversation.save();

                        // console.log("Cuộc trò chuyện mới đã được tạo:", newConversation);
                        try {
                            const newMessage = new mdMessage.MessageModel({
                                conversationId: newConversation._id,
                                sender: idadmin,
                                text: "Adadss xin chào, adadss có thể giúp gì cho bạn",
                                createdAt: date


                            });
                            await newMessage.save();
                            // console.log("Tin nhắn chào đã được tạo:", newMessage);


                        } catch (error) {

                        }
                    } else {
                        console.log("Không thể tìm thấy người dùng mới");
                    }
                } catch (error) {

                }
            } catch (error) {
                msg = "Tạo tài khoản thất bại";
                console.log(error);
            }
        }
    } else {
        msg = "err method : vui lòng dùng method POST"
    }

    res.status(200).json({
        msg: msg,
        err: err,
        idUser: (objUser != null) ? objUser._id : "",
        role: (objUser != null) ? objUser.role : ""
    });
}


exports.pagination = async (req, res, next) => {
    const PAGE_SIZE = 5;

    var page = req.query.page
    if (page) {
        page = parseInt(page)
        if (page < 1) {
            page = 1
        }
        var soLuongBoQua = (page - 1) * PAGE_SIZE

        md.userModel.find({})
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
        md.userModel.find({})
            .then(data => {
                res.json(data);
            })
    }
}

async function catchError(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    const details = err.details;

    res.status(statusCode).json({
        message,
        details,
    });
}


exports.updateUser = async (req, res, next) => {
    let msg = "";
    let err = true;

    try {
        let idUser = req.params.idUser;

        let full_name = req.body.fullname;

        let objUser = await md.userModel.findById(idUser);

        if (objUser) {
            if (req.file) {

            }


        } else {
            msg = "Tài khoản không tồn tại"
        }

    } catch (error) {
        console.log(error);
    }

    res.status(200).json({
        msg: msg,
        err: err,
    });

}

exports.deleteUser = async (req, res, next) => {

    try {
        const user = await md.userModel.findByIdAndDelete(req.params.idu);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

    res.json(objReturn);
};

// address

exports.getAddressByIdUser = async (req, res, next) => {
    let idUser = req.params.idUser;
    let arrAddres = [];

    if (idUser != null) {


        arrAddres = await md.addressModel.find({ user_id: idUser });

    } else {
        console.log("idUser null");
    }

    res.status(200).json(arrAddres);
}

exports.getAddressById = async (req, res, next) => {
    let err = true;

    try {
        let idAddress = req.params.idAddress;
        var objAddress = await md.addressModel.findById(idAddress);
        err = false;
    } catch (e) {
        console.log(e);
    }
    res.status(200).json({
        err: err,
        objAddress: objAddress
    });
}

exports.addAddress = async (req, res, next) => {
    let msg = "";
    let err = true;

    if (req.method == 'POST') {
        let idUser = req.body.idUser;
        let address = req.body.address;
        let specificAddres = req.body.specificAddres;
        let objAddress = new md.addressModel();
        let objUser;

        try {
            objUser = await md.userModel.findById(idUser);
        } catch (error) {
            console.log("user khoong tồn tại");
        }

        if (objUser) {

            let countAddress = await md.addressModel.find({ user_id: idUser }).count();
            if (countAddress >= 3) {
                msg = "Đã vượt quá số lượng địa chỉ";
            } else {
                if (address != "" || specificAddres != "" || address != null || specificAddres != null) {
                    objAddress.user_id = idUser;
                    objAddress.address = address;
                    objAddress.specific_addres = specificAddres;
                    objUser.address = objAddress._id;

                    try {
                        await md.userModel.findByIdAndUpdate(idUser, objUser);
                        await objAddress.save();
                        msg = "Thêm thành công";
                        err = false;
                    } catch (error) {
                        msg = "Thêm địa chỉ thất bại";
                    }
                } else {
                    msg = "Chưa nhập đủ các trường"
                }
            }

        } else {
            msg = "Người dùng không tồn tại";
        }
    } else {
        msg = "err method : vui lòng dùng method POST"
    }

    res.status(200).json({
        msg: msg,
        err: err
    });
}

exports.setAddress = async (req, res, next) => {
    let msg = "";
    let err = true;

    try {
        var idUser = req.body.idUser;
        var idAddress = req.body.idAddress;
        var objUser = await md.userModel.findById(idUser);
        var objAddress = await md.addressModel.findById(idAddress);
    } catch (error) {
        console.log(error);
    }

    if (objUser) {
        if (objAddress) {
            objUser.address = objAddress._id;

            try {
                await md.userModel.findByIdAndUpdate(idUser, objUser);
                err = false;
                msg = "Set thành công"
            } catch (error) {
                msg = "Lỗi server vui lòng thử lại sau";
                console.log(error);
            }
        } else {
            msg = "Địa chỉ không tồn tại";
        }
    } else {
        msg = "Người dùng không tồn tại";
    }

    res.status(200).json({
        msg: msg,
        err: err
    });
}

exports.updateAddres = async (req, res, next) => {
    let msg = "";
    let err = true;

    if (req.method == 'PUT') {
        let idAddress = req.params.idAddress;
        let address = req.body.address;
        let specificAddres = req.body.specificAddress;

        let objAddress;
        let objUser;
        try {
            objAddress = await md.addressModel.findById(idAddress);
            objUser = await md.userModel.findById(objAddress.user_id);
        } catch (error) {
            console.log("address or user Không tồn tại");
        }

        if (!objAddress) {
            msg = "Địa chỉ không tồn tại";
        } else if (!objUser) {
            msg = "Người dùng không tồn tại"
        } else {
            objAddress.address = address;
            objAddress.specific_addres = specificAddres;

            try {
                await md.addressModel.findByIdAndUpdate(idAddress, objAddress);
                msg = "Sửa địa chỉ thành công";
                err = false;
            } catch (error) {
                msg = "Sửa địa chỉ thất bại";
            }
        }
    } else {
        msg = "err method : vui lòng dùng method PUT"
    }

    res.status(200).json({
        msg: msg,
        err: err
    });
}

exports.deleteAddress = async (req, res, next) => {
    let msg = "";
    let err = true;

    if (req.method == 'DELETE') {
        let idAddress = req.params.idAddress;
        let objAddress;
        try {
            objAddress = await md.addressModel.findById(idAddress);
        } catch (error) {
            console.log("địa chỉ không tồn tại");
        }

        if (objAddress) {
            let countAddress = await md.addressModel.find({ user_id: objAddress.user_id }).count();
            if (countAddress <= 1) {
                msg = "Bạn phải có tối thiểu một địa chỉ";
            } else {
                try {
                    let objUser = await md.userModel.findById(objAddress.user_id);

                    if (objUser) {
                        let addresss = await md.addressModel.find({ user_id: objUser._id });
                        objUser.address = addresss[0]._id;
                    }

                    await md.addressModel.findByIdAndDelete(idAddress);
                    msg = "Xóa địa chỉ thành công";
                    err = false;

                } catch (error) {
                    msg = "Xóa địa chỉ thất bại";
                }
            }
        } else {
            msg = "Địa chỉ không tồn tại";
        }
    } else {
        msg = "err method : vui lòng dùng method DELETE"
    }

    res.status(200).json({
        msg: msg,
        err: err
    });
}