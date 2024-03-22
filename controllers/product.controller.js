var model = require('../models/product.model');
var modelCategories = require('../models/category.model')
var modelColor = require('../models/color.model')
var modelSize = require('../models/sizes.model')
var cloudinary = require('cloudinary').v2;


var model_product_size_color = require('../models/product_size_color.model')
var base64 = require('base-64')
var fs = require('fs');
var path = require('path');
const { DateTime } = require('luxon');
let heading = 'Danh sách sản phẩm'
let title = 'Sản phẩm'
let ExcelJS = require('exceljs')
let message;


const getlistproduct = async (req, res) => {

    const itemsPerPage = 10;
    const aler = req.query.aler;
    console.log("aler", aler);
    const page = parseInt(req.params.page) || 1;
    const startCount = (page - 1) * itemsPerPage + 1;
    const skip = (page - 1) * itemsPerPage;
    const limit = itemsPerPage;
    const listProducts = await model.productModel.find().skip(skip).limit(limit).sort({ createdAt: -1 })
        .populate('category_id', "name");
    const listCategory = await modelCategories.categoryModel.find()
    const countProducts = await model.productModel.count(); // Tính tổng số sản phẩm
    const countPages = Math.ceil(countProducts / itemsPerPage); // Tính tổng số trang
    const displayMessage = `Hiển thị từ ${startCount}-${startCount + itemsPerPage - 1} trong tổng số ${countProducts} kết quả`;
    res.render('product/listproduct', {
        title: title,
        listProducts: listProducts,
        countProducts: countProducts,
        countPages: countPages,
        page: page,
        startCount: startCount,
        listCategory: listCategory,
        heading: heading,
        displayMessage: displayMessage,
        selectedCategoryId: 'all',
        message: aler
    });
};

const addproduct = async (req, res) => {

    const { name, description, price, category, discount } = req.body;
    const image = []
    const fileData = req.files
    fileData.forEach(item => {
        image.push(item.path)
    });
    if (req.method === 'POST') {
        let objProduct = new model.productModel({
            name: name,
            description: description,
            category_id: category,
            createdAt: Date.now(),
            image: image,
            price: price,
            discount: discount
        });

        try {
            await objProduct.save();

            res.redirect(`/product/listproduct/1?aler=Thêm thành công`);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi ghi CSDL: ' + error.message });
        }
    }
};
const exportExcel = async (req, res) => {
    try {
        const listProducts = await model.productModel.find().sort({ createdAt: -1 })
            .populate('category_id', "name");

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('ListProducts');
        const headers = ['STT', 'Tên sản phẩm', 'Danh mục', 'Giá', 'Ngày tạo'];
        worksheet.addRow(headers);

        listProducts.forEach((product, index) => {
            const rowData = [
                index + 1,
                product.name,
                product.category_id.name ? product.category_id.name : 'Không có danh mục',
                product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), // Format giá
                product.createdAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) // Format ngày tạo
            ];
            worksheet.addRow(rowData);
        });

        // Tên file Excel
        const fileName = `ListProducts.xlsx`;

        // Ghi workbook vào file
        await workbook.xlsx.writeFile(fileName);

        res.download(fileName, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {

                fs.unlinkSync(fileName);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
const detailProduct = async (req, res) => {
    try {
        const idProduct = req.params.idProduct;
        const query = req.query;

        let currenImage = Number(query.left) || Number(query.right) || 0;


        const ListProduct = await model.productModel.findById(idProduct)
        let lengthImage = ListProduct.image.length
        console.log("currenImage", currenImage);
        console.log("lengthImage", lengthImage);
        const ListColor = await modelColor.colorModel.find();
        const ListSize = await modelSize.sizeModel.find();
        const details = await model_product_size_color.product_size_color_Model.find({ product_id: idProduct })
            .populate('size_id', 'name')
            .populate('color_id', 'name');

        res.render('product/detail', {
            title: title,
            productListSizeColor: details,
            ListProduct: ListProduct,
            ListColor: ListColor,
            ListSize: ListSize,
            currenImage: currenImage,
            heading: 'Chi tiết sản phẩm',
            displayMessage: '',
            lengthImage: lengthImage - 1
        });
    } catch (error) {
        // Xử lý lỗi và trả về một trang lỗi hoặc thông báo lỗi cho người dùng
        res.status(500).json({ error: error });
    }
}
const addDetail = async (req, res) => {
    const { price, size, color, nameProduct, trinhh } = req.body;
    // console.log('nameProduct', nameProduct)
    // console.log(' req.body', req.body)
}

function getPublicIdFromUrl(url) {
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    return url.substring(startIndex, endIndex);
}

const deleteproduct = async (req, res) => {
    try {
        let countPages = parseInt(req.query.countPages);
        let countProducts = parseInt(req.query.countProducts)
        if (countProducts % 2 !== 0) {
            countPages -= 1
        }
        let id = req.params.id;
        const finproduct = await model.productModel.findById(id);
        finproduct.image.map(url => {
            const publicId = getPublicIdFromUrl(url);
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    console.error(`Lỗi khi xóa ảnh với public ID ${publicId}:`, error);
                } else {
                    console.log(`Ảnh với public ID ${publicId} đã được xóa. Kết quả:`, result);
                }
            });
        });

        await model.productModel.findByIdAndDelete(id);
        await model_product_size_color.product_size_color_Model.deleteMany({ product_id: id });

        res.redirect(`/product/listproduct/1?aler=Xóa thành công`)
    } catch (error) {
        msg = 'Lỗi Ghi CSDL: ' + error.message;
        console.log(error);

    }
}

const updateproduct = async (req, res) => {
    let id = req.params.id;
    let title = 'Update Product';

    try {
        let itemedit = await model.productModel.findById(id);
        let listCategory = await modelCategories.categoryModel.find();

        if (req.method === 'POST') {
            try {
                var image = [];
                const fileData = req.files;
                console.log(fileData.length > 0);
                if (fileData && fileData.length > 0) {
                    var image = [];
                    fileData.forEach(item => {
                        image.push(item.path);
                        console.log('Thêm ảnh vào mảng để đẩy lên MongoDB:', item.path);
                    });
                
                    // Xóa ảnh cũ khỏi Cloudinary
                    itemedit.image.forEach(url => {
                        const publicId = getPublicIdFromUrl(url);
                
                        cloudinary.uploader.destroy(publicId, (error, result) => {
                            if (error) {
                                console.log("Xóa ảnh khỏi Cloud không thành công!");
                            } else {
                                console.log("Xóa ảnh khỏi Cloud thành công!" ,publicId);
                            }
                        });
                    });
                
                    // Cập nhật ảnh mới
                    itemedit.image = image;
                } else {
                    //
                    console.log(' Người dùng không chọn ảnh, không làm gì cả kkkk');
                }

                itemedit.name = req.body.name;
                itemedit.description = req.body.description;
                itemedit.price = req.body.price;
                itemedit.discount = req.body.discount;
                itemedit.updatedAt = DateTime.now();
                itemedit.category_id = req.body.category;

                await model.productModel.findByIdAndUpdate(id, itemedit);
                res.redirect('/product/listproduct/1?aler=Cập nhật thành công sản phẩm');
            } catch (error) {
                console.error('Lỗi khi xử lý POST:', error);
                res.status(500).json({ message: 'Lỗi ghi CSDL: ' + error.message });
            }
        } else {
            res.render('product/updateproduct', {
                title: title,
                itemedit: itemedit,
                heading: 'Cập nhật sản phẩm',
                listCategory: listCategory
            });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý GET:', error);
        res.status(500).json({ message: 'Lỗi ghi CSDL: ' + error.message });
    }
};




const searchProduct = async (req, res) => {
    const searchQuery = req.query.search.toLowerCase();
    const countPages = 1;
    const countProducts = 1;
    const startCount = 1;
    const page = 1;

    const listProducts = await model.productModel.find({
        name: { $regex: new RegExp(searchQuery, 'i') },
    }).populate('category_id');
    const listCategory = await modelCategories.categoryModel.find()
    res.render('product/listproduct', {
        title: title,
        listProducts: listProducts,
        countPages: countPages,
        countProducts: countProducts,
        page: page,
        startCount: startCount,
        listCategory: listCategory,
        selectedCategoryId: 'all',
        displayMessage: '',
        message: 'Tìm kiếm thành công',
        heading: heading,
    });
}
const sortUp = async (req, res) => {
    const itemsPerPage = 10; // Số sản phẩm trên mỗi trang
    const page = parseInt(req.params.page) || 1; // Mặc định là trang 1
    const startCount = (page - 1) * itemsPerPage + 1;
    const skip = (page - 1) * itemsPerPage;
    const limit = itemsPerPage;
    const listProducts = await model.productModel.find().skip(skip).limit(limit).sort({ createdAt: -1 })
        .populate('category_id', "name");
    const countProducts = await model.productModel.count(); // Tính tổng số sản phẩm
    const countPages = Math.ceil(countProducts / itemsPerPage); // Tính tổng số trang
    const listCategories = await modelCategories.categoryModel.find()
    try {

        const sortUpPrice = await model.productModel.find({}).sort({ price: 1 }).populate('category_id', "name");
        res.render('product/listproduct', {
            title: title,
            listProducts: sortUpPrice,
            countProducts: countProducts,
            countPages: countPages,
            page: page,
            startCount: startCount,
            listCategory: listCategories,
            heading: heading,
            displayMessage: '',
            selectedCategoryId: 'all',
            message: 'message'
        })

    } catch (error) {
        console.log(error);
    }
}
const sortDown = async (req, res) => {
    try {

        const itemsPerPage = 10; // Số sản phẩm trên mỗi trang
        const page = parseInt(req.params.page) || 1; // Mặc định là trang 1
        const startCount = (page - 1) * itemsPerPage + 1;
        const skip = (page - 1) * itemsPerPage;
        const limit = itemsPerPage;
        const listProducts = await model.productModel.find().skip(skip).limit(limit).sort({ createdAt: -1 })
            .populate('category_id', "name");
        const countProducts = await model.productModel.count(); // Tính tổng số sản phẩm
        const countPages = Math.ceil(countProducts / itemsPerPage); // Tính tổng số trang
        const listCategories = await modelCategories.categoryModel.find()
        const sortDownPrice = await model.productModel.find({}).sort({ price: -1 }).populate('category_id', "name");


        res.render('product/listproduct', {
            title: title,
            listProducts: sortDownPrice,
            countProducts: countProducts,
            countPages: countPages,
            page: page,
            startCount: startCount,
            listCategory: listCategories,
            heading: heading,
            displayMessage: '',
            selectedCategoryId: 'all',
            message: 'message'
        })
    } catch (error) {
        console.log(error);
    }
}
const filterCategory = async (req, res) => {
    let message = ''
    const id_cate = req.query.category
    const filterCategory = await model.productModel.find({ 'category_id': id_cate }).populate('category_id');
    const listCategory = await modelCategories.categoryModel.find();

    res.render('product/listproduct', {
        title: title,
        message: '123123123',
        listProducts: filterCategory,
        countProducts: 1,
        countPages: 1,
        page: 1,
        startCount: 1,
        listCategory: listCategory,
        selectedCategoryId: id_cate,
        heading: heading,
        displayMessage: '',
        message: 'tìm kiếm thành công'
    });
}

const statistical = (req, res) => {
    res.render('product/statistical', {
        title: title,
        heading: heading,
    });
}

module.exports = { exportExcel, addDetail, getlistproduct, addproduct, deleteproduct, updateproduct, searchProduct, sortUp, sortDown, filterCategory, statistical, detailProduct }