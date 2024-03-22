const mongoose = require('mongoose');
const mProduct = require('../../models/product.model');
const mProductDetail = require('../../models/product_size_color.model');
const mUser = require('../../models/user.model');
var fs = require('fs');
const { DateTime } = require('luxon');

exports.getCommentByProduct = async (req , res , next) => {
    let product_id = req.params.ProductId;
    try {
        var count = req.query.count;
        var star = req.query.star;
        star = Number(star);
    } catch (error) {
        console.log("value null");
    }


    if(star == 0 || String(star) == 'NaN'){
        star = {$exists : true}
    }

    try {
        var listComment = [];
      
        listComment = await mProduct.commentModel.find({product_id : product_id , rating : star}).limit(count)
        .populate("user_id" , ['full_name' ,'avata'])
        .populate({
            path: 'product_detail_id',
            populate : [
                { path: 'size_id' , populate : [{path : 'name'}]},
                { path: 'color_id',  populate : [{path : 'name'}] }
            ]
        });
        console.log(listComment.length);
        

    } catch (error) {
        console.log(error);
    }
    
    res.status(200).json(listComment);
}

exports.getCommentById = async (req , res ,next) => {
    let err = true;

    try {
        let product_detail_id = req.body.ProductDetailId;
        let user_id = req.body.UserId
        
        var objComment = await mProduct.commentModel.findOne({product_detail_id : product_detail_id , user_id : user_id});

        if(objComment){
            err = false;
        }

    } catch (error) {
        console.log(error);
    }

    res.status(200).json({
        err : err,
        objComment : objComment
    })
}


exports.newComment = async (req , res , next) => {
    let msg = "";
    let err = true;

    if(req.method == 'POST'){
        let product_detail_id = req.body.ProductDetailId;
        let product_id = req.body.ProductId;
        let user_id = req.body.UserId;
        let comment = req.body.Comment;
        let sRating = req.body.rating;

        let objProductChek = await mProductDetail.product_size_color_Model.findById(product_detail_id);
        let objUserChek = await mUser.userModel.findById(user_id);
        let objCommentCkek = await mProduct.commentModel.findOne({user_id : user_id,product_detail_id : product_detail_id});


        if(!objProductChek){
            msg = "Product null";
        }else if(!objUserChek){
            msg = "User null";
        }else if(isNaN(sRating)){
            msg = "Rating is not a number";
        }else if(objCommentCkek){
            msg = "Bạn đã đánh giá sản phẩm này rồi";
        }else {
            let rating = Number(sRating);
            if(rating <= 0 || rating >= 6){
                msg = "Rating illegal => (1|2|3|4|5)"
            }else{
                let newComment = new mProduct.commentModel();
                // let currentDate = new Date();
                // let sDate = currentDate.getFullYear() + "-" 
                //     + (currentDate.getMonth() + 1) + "-"
                //     + currentDate.getDate() + " "
                //     + currentDate.getHours() + ":" + currentDate.getMinutes();

                if(req.files){
                    req.files.forEach(item =>{
                        try {
                            fs.renameSync(item.path , './public/images/' + newComment._id + "_" + item.originalname);
                            newComment.images.push('/images/' + newComment._id + "_" + item.originalname);
                        } catch (error) {
                            console.log("Lỗi up ảnh : " + error);
                        }
                    })
                }
                
                newComment.product_detail_id = product_detail_id;
                newComment.product_id = product_id;
                newComment.user_id = user_id;
                newComment.comment = comment;
                newComment.rating = rating;
                newComment.date = DateTime.now().setZone('Asia/Ho_Chi_Minh');

                try {
                    await newComment.save();
                    msg = "Comment added";
                    err = false;
                    reStar(product_id);
                } catch (error) {
                    console.log("error : " + error);
                    msg = "Add comment failed"
                }
            }
        }
    }

    res.status(200).json(
        { 
            msg : msg,
            err : err
        }   
    );
}


exports.updateComment = async (req , res , next) => {
    let msg = "";   
    let err = true;

    if(req.method == 'PUT'){

        let comment_id = req.params.CommentId;
        let comment = req.body.Comment;
        let sRating = req.body.rating;

        let objComment = await mProduct.commentModel.findById(comment_id);

        console.log(sRating);
        console.log(comment);
        

        if(!objComment){
            msg = "Comment null";
        }else if(isNaN(sRating)){
            msg = "Rating is not a number";
        }else {
            let rating = Number(sRating);
            if(rating <= 0 || rating >= 6){
                msg = "Rating illegal => (1 -> 10)"
            }else{

                console.log("suw comment : " + objComment._id);

                if(req.files){
                    console.log(req.files);
                    req.files.forEach(item =>{
                        try {
                            fs.renameSync(item.path , './public/images/' + objComment._id + "_" + item.originalname);
                            objComment.images.push('/images/' + objComment._id + "_" + item.originalname);
                        } catch (error) {
                            console.log("Lỗi up ảnh : " + error);
                        }
                    })
                }

                objComment.comment = comment;
                objComment.rating = rating;

                try {
                    await mProduct.commentModel.findByIdAndUpdate(comment_id , objComment);
                    msg = "Comment update";
                    err = false;
                } catch (error) {
                    console.log("error : " + error);
                    msg = "Update comment failed"
                }
            }
        }
    }

    res.status(200).json(
        { 
            err : err,
            msg : msg
        }   
    );
}

async function reStar(product_id){

    try {
        const result = await mProduct.commentModel.aggregate([
            {   
                $match : {"product_id" : new mongoose.Types.ObjectId(product_id)}
            },
            {
                $group : {
                    _id : null, 
                    total : {$sum : "$rating"}
                }
            }
        ]);

        if(result.length == 0){
            return;
        }

        const countRating = await mProduct.commentModel.find({product_id : product_id}).count();
        
        let ratingcount = parseInt(result[0].total / countRating);
        if(parseFloat(result[0].total / countRating) > parseInt(result[0].total / countRating) + 0.5){
            ratingcount += 1;
        }

        let objProduct = await mProduct.productModel.findById(product_id);

        objProduct.rating = ratingcount;

        try {
            await mProduct.productModel.findByIdAndUpdate(product_id, objProduct);
        } catch (error) {
            console.log("error : " + error);
        }

    } catch (error) {
        console.log(error);
    }

}