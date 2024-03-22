const admin = require('firebase-admin');
const mdUser = require('../models/user.model');
const mdProduct = require('../models/product.model')
const mdNotification = require('../models/notification.model');
const { DateTime } = require('luxon');
const fs = require('fs');

const serviceAccount = require('../models/appclientadadas-firebase-adminsdk-ulv8d-c6bdb71b26.json');
const { array } = require('joi');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

exports.notification = async (req, res, next) => {

    const domain = req.get('host');
    const protocol = req.protocol;
    const baseUrl = protocol + "://" + domain;
    let listProduct = await mdProduct.productModel.find().getIdAndName().exec();

    let dieu_kien_loc = {
        $and : [
            {phone_number : { $exists : true , $ne : null , $ne : ""}},
            {token : {$exists : true , $ne : null, $ne : ""}}
        ]
    };
    let search = req.query.search;

    if(String(search) !== "undefined" && String(search) != ""){ 
        if(isNaN(search)){
            dieu_kien_loc.$and.push({full_name : {$regex : search}});
        }else{
            dieu_kien_loc.$and.push({phone_number : {$regex : search}});
        }
    }

    const listUser = await mdUser.userModel.find(dieu_kien_loc).filteredSelect().exec();

    res.render('notification', {
        title: 'Thông báo',
        heading: 'Thông báo',
        listUser:listUser,
        search : search,
        baseUrl : baseUrl,
        listProduct : listProduct
      });

}

exports.pustNotification = async (req , res , next) => {
    let title = req.body.title;
    let content = req.body.content;
    
    try {
        let listTonken = req.body.listToken;
        let payload = req.body.payload;
        let status = req.body.status;
        let arrToken = [];

        arrToken = listTonken.split(",");

        if(payload == '0'){
            status = '0';
        }

        if(req.file){
            try {
                fs.renameSync(req.file.path, './public/images/' +  req.file.originalname);
            } catch (error) {
                console.log("Ảnh bị lỗi rồi: "+error);
            }
        }else{
            console.log("Không có ảnh");
        }


        if(arrToken){
            const message = {
                tokens : arrToken,
                notification : {
                    title : title,
                    body : content,
                },
                data: {
                    status : status,
                    value : payload
                }
            }
        
            admin.messaging().sendMulticast(message)
                .then(async (response) => {

                    for(let item of arrToken){
                        let objUser = await mdUser.userModel.findOne({token : item}).filteredSelect().exec();
                        if(!objUser){
                            return;
                        }

                        let objNotification = new mdNotification.notificationModel();

                        objNotification.id_user = objUser._id;
                        objNotification.statu_payload = status;
                        objNotification.payload = payload;
                        objNotification.title = title;
                        objNotification.content = content;
                        objNotification.date = DateTime.now().setZone('Asia/Ho_Chi_Minh');
                        objNotification.status = true;
                        objNotification.image = '';
                        if(req.file){
                            objNotification.image = '/images/' + req.file.originalname;
                        }

                        try {
                            await objNotification.save();
                        } catch (error) {
                            console.log("gửi thông báo thất bại : " + error);
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error sending message:', error);
                });
        }
        
    } catch (error) {
        console.log("các trường trống");
        console.log(error);
    }
    
    res.status(200).json({
        msg: "gui thong bao"
    });
}