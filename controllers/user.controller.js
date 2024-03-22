const mUser = require('../models/user.model');
const fs = require('fs');
let title = 'User'
let heading = 'User'
exports.list = async (req , res , next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    let skipItem = 0;
    let dieu_kien_loc = null;

    let search = "";
    search = req.query.search;
    if(String(search) !== "undefined" && String(search) != ""){ 
        if(isNaN(search)){
            dieu_kien_loc = {username : {$regex : search}};
        }else{
            dieu_kien_loc = {phone_number : {$regex : search}};
        }
    }

    skipItem = (page - 1) * limit;

    const listUser = await mUser.userModel.find(dieu_kien_loc).skip(skipItem).limit(limit);
    const countUser = await mUser.userModel.count();

    let countPage = parseInt(countUser / limit);

    if(countUser % limit != 0){
        countPage += 1;
    }

    res.render('user/listUser',{
        title : title,
        heading:'Dánh sách người dùng',
        listUser : listUser,
        search : search,
        page : page,
        countPage : countPage,
        skipItem : skipItem,
        role : req.session.userLogin.role
    });
}

exports.details = async (req , res , next) => {

    let objUser = await mUser.userModel.findById(req.params.id);

    res.render('user/detailUser' ,{
        title : "Details User",
        heading:'Dánh sách người dùng',
        objUser : objUser
    });
}

exports.add = async (req , res , next) => {
    let msg = '';

    if(req.method == "POST"){
        let username = req.body.username;
        let password = req.body.password;
        let rePassword = req.body.rePassword;
        let full_name = req.body.fullName;
        let address = req.body.address;
        let phone_number = req.body.phoneNumber;

        let objUser = await mUser.userModel.findOne({username : username});
        let objUserPhone = await mUser.userModel.findOne({phone_number : phone_number});
        let objUserEmail;

        if(objUser){
            msg = "Username đã tồn tại";
        }else if(objUserPhone){
            msg = "Số điện thoại đã được đăng ký";
            console.log("sdt : " + objUserPhone.username);
        }else if(String(password).length < 8){
            msg = "Mật khẩu phải có 8 ký tự";
        }else if(password != rePassword){
            msg = "Xác nhận mật khẩu không chính xác"
        }else{
            let objNewUser = new mUser.userModel();
             
            objNewUser.username = username;
            objNewUser.password = password;
            objNewUser.full_name = full_name;
            objNewUser.address = address;
            objNewUser.phone_number = phone_number;
            objNewUser.role = "Staff";
            objNewUser.deviceId = "";

            if(req.file){
                try {
                    fs.renameSync(req.file.path, './public/avatas/' + objNewUser._id + '_' + req.file.originalname);
                    objNewUser.avatar = '/avatas/' + objNewUser._id + '_' + req.file.originalname;
                } catch (error) {
                    console.log("Ảnh bị lỗi rồi: "+error);
                }
            }else{
                msg = "Không có ảnh";
            }

            try {
                await objNewUser.save();
                msg = 'Thêm thành công';
            } catch (error) {
                msg = "Lỗi lưu vào cơ sở dữ";
            }
        }
    }
  
    res.render("user/addStaff", {
        title : "Add Staff",
        msg : msg,
        title : title,
        heading:heading,
    });
}

exports.edit = async (req , res , next) => {
    let msg = '';

    if(req.method == 'POST'){
        let idUser = req.params.id;
        let objUser = await mUser.userModel.findById(idUser);

        let fullname = req.body.fullname;
        let phone = req.body.phone;
        let email = req.body.email;
        let address = req.body.address;

        if(objUser){
            if(req.file){
                try {
                    fs.renameSync(req.file.path, './public/avatas/' + objUser._id + '_' + req.file.originalname);
                    objUser.avata = '/avatas/' + objUser._id + '_' + req.file.originalname;
                } catch (error) {
                    console.log("Ảnh bị lỗi rồi: "+error);
                    msg = "Update ảnh bị lỗi";
                }
            }

            if(phone != objUser.phone_number){
                let objUserPhone = await mUser.userModel.findOne({phone_number : phone});

                if(objUserPhone){
                    msg = "Số điện thoại đã được đăng ký";
                }else{
                    objUser.phone_number = phone;
                }
            }else if(email != objUser.email){

            }

            objUser.full_name = fullname;
            objUser.address = address;

            try {
                await mUser.userModel.findByIdAndUpdate(idUser , objUser);
                console.log("update thanh cong");
                res.redirect('/users');
                return;
            } catch (error) {
                console.log(error);
                msg = "Update thất bại";
            }
        }else {
            msg = "Không tìm thấy user trong cơ sở dữ liệu";
        }
    }
    res.redirect('/users');
}

exports.lock = async (req , res , next) => {
    let idUser = req.params.idUser;
    let objUser = await mUser.userModel.findById(idUser);

    if(objUser){
        objUser.status = false;
        try {
            await mUser.userModel.findByIdAndUpdate(idUser , objUser);
            res.redirect('/users');
            return;
        } catch (error) {
            console.log(error);
        }
    }else{
        console.log("objUser null");
    }
    res.redirect('/users');
}

exports.unLock = async (req , res , next) => {
    let idUser = req.params.idUser;
    let objUser = await mUser.userModel.findById(idUser);

    if(objUser){
        objUser.status = true;
        try {
            await mUser.userModel.findByIdAndUpdate(idUser , objUser);
            res.redirect('/users');
            return;
        } catch (error) {
            console.log(error);
        }
    }else{
        console.log("objUser null");
    }
    res.redirect('/users');
}