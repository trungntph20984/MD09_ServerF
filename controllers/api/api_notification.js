const mdNotification = require("../../models/notification.model");
const mdUser = require('../../models/user.model');

exports.getNotification = async (req , res ,next) =>{
    let idUser = req.params.idUser;

    try {
        var objuser = await mdUser.userModel.findById(idUser);
    } catch (error) {
        console.log("User không tồn tại")
    }

    if(objuser){
        var arrNotification = await mdNotification.notificationModel.find({id_user : idUser});

        arrNotification.sort(function(a , b){
            return b.date - a.date;        
        });

    }else{
        console.log("null");
    }

    res.status(200).json(arrNotification);
}

exports.readNotification = async (req , res , next) => {
    try {
        var idNotification = req.params.idNotification;
        let objNotification = await mdNotification.notificationModel.findById(idNotification);

        objNotification.status = false;

        await mdNotification.notificationModel.findByIdAndUpdate(idNotification , objNotification);

    } catch (error) {
       console.log(error);
       res.status(500).json();
    }

    res.status(200).json();
}