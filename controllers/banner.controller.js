let mdProduct_ = require('../models/product.model')
let mdBanner = require('../models/banner.model')
var cloudinary = require('cloudinary').v2;

const getAllBanner = async (req, res) => {
    const aler = req.query.aler;
    const listtBanner = await mdBanner.bannerModel.find().populate('product_id')
console.log("listtBanner",listtBanner);
    const listProduct = await mdProduct_.productModel.find();
    
    res.render('banner/list', {
        title: "ADADAS",
        heading: "Danh sách Banner",
        message: "",
        listProduct: listProduct,
        listtBanner: listtBanner,
        message: aler
    });
}

const addBanner = async (req, res) => {
    try {
        const {description, id_product} = req.body;
        const imagePath = req.file.path;

        // Tạo một bản ghi banner mới
        const newBanner = new mdBanner.bannerModel({
            image_banner: imagePath,
            product_id: id_product,
            description: description,
            createdAt: Date.now(),
        });
        await newBanner.save();

        res.redirect(`/banner/?aler=Thêm thành công`);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Lỗi server nội bộ.'});
    }
};

function getPublicIdFromUrl(url) {
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    return url.substring(startIndex, endIndex);
}

const deleteBanner = async (req, res) => {
    try {

        const bannerId = req.params.id;
        const result = await mdBanner.bannerModel.findByIdAndDelete(bannerId);
        const idimage = getPublicIdFromUrl(result.image_banner)
        cloudinary.uploader.destroy(idimage, (error, result) => {
            if (error) {
                console.error(`Lỗi khi xóa ảnh với public ID ${idimage}:`, error);
            } else {
                console.log(`Ảnh với public ID ${idimage} đã được xóa. Kết quả:`, result);
            }
        });
        if (result) {
            res.redirect(`/banner/?aler=Xóa thành công`);

        } else {
            res.status(404).json({success: false, message: 'Banner not found.'});
        }
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal Server Error.'});
    }
};
const editBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const {description, image, id_product} = req.body;
        const imagePath = req.file?.path;
        const result = await mdBanner.bannerModel.findById(bannerId);

        console.log(result);
        if (result) {
            // imagePath ? result.image_banner = imagePath : result.image_banner
            if (imagePath) {
                const idimage = getPublicIdFromUrl(result.image_banner)
                console.log(idimage);
                cloudinary.uploader.destroy(idimage, (error, result) => {
                    if (error) {
                        console.error(`Lỗi khi xóa ảnh với public ID ${idimage}:`, error);
                    } else {
                        console.log(`Ảnh với public ID ${idimage} đã được xóa. Kết quả:`, result);
                    }
                });
                result.image_banner = imagePath
             

            }else{
                result.image_banner  
            }

            console.log('result.image_banner',result.image_banner);
            description ? result.description = description : result.description
            id_product ? result.product_id = id_product : result.product_id
            await result.save();
            res.redirect(`/banner/?aler=Sửa thành công`);
        } else {
            res.status(404).json({success: false, message: 'Banner not found.'});
        }
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal Server Error.'});
    }
};


module.exports = {addBanner, getAllBanner, deleteBanner, editBanner}