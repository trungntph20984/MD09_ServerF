const model_product_size_color = require('../models/product_size_color.model')
const productModel = require('../models/product.model');
const colorModel = require('../models/color.model')
const sizeModel = require('../models/sizes.model')
const categoriModel = require('../models/category.model')
const fs = require('fs');
let ExcelJS = require('exceljs')
let heading = 'Danh sách kho hàng'
let title = 'Kho hàng'
const getListAll = async (req, res) => {
    let message = ''
    try {
        const page = parseInt(req.params.page) || 1;;
        const limit = 30;
        const startCount = (page - 1) * limit + 1;
        const productListSizeColor = await model_product_size_color.product_size_color_Model.find()
            .populate('product_id', "name price")
            .populate('size_id', "name")
            .populate('color_id', "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit) 
            .limit(limit); 

        productListSizeColor.sort((a, b) => {
            const sizeOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 };
            return sizeOrder[a?.size_id?.name] - sizeOrder[b?.size_id?.name];
        });

        const listproduct = await productModel.productModel.find()

        const countProducts = await model_product_size_color.product_size_color_Model.count();
        const countPages = Math.ceil(countProducts / limit);
        
        res.render('product_size_color/product_size_color', {
            title: title,
            heading: heading,
            message: '',
            productListSizeColor: productListSizeColor,
            listproduct: listproduct,
            startCount: startCount,
            countProducts: countProducts,
            countPages: countPages,
            page: page,
            selectedroductName: 'all'
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi truy vấn CSDL: ' + error });
    }
}
var existingProductGlobal;


const add_product_size_color = async (req, res) => {
    let { productID, sizeID } = req.query
    const product = await productModel.productModel.find().sort({ createdAt: -1 });
    let size = await sizeModel.sizeModel.find();
    let color = await colorModel.colorModel.find();
    let message = ""
    let findImage = "";
    if (productID) {
        try {
            findImage = await productModel.productModel.findById(productID);
        } catch (error) {
            console.log("Lỗi khi tìm ảnh sản phẩm:", error);
        }
    }

    if (productID && sizeID) {
        try {
            const productSizesColors = await model_product_size_color.product_size_color_Model
                .find({ product_id: productID, size_id: sizeID })
                .populate("color_id");

            const addedColors = productSizesColors.map(item => item.color_id);
            const colorsNotAdded = color.filter(color => !addedColors.find(addedColor => addedColor._id.equals(color._id)));
            color = colorsNotAdded.length > 0 ? colorsNotAdded : [];
            console.log(colorsNotAdded);
        } catch (error) {
            console.log("Lỗi", error);
        }
    }
    try {
        if (req.method == 'POST') {
            const { name, categories, size, color, quantity, selectedname, checksize, checkcolor } = req.body;

            const selectedSizes = Array.isArray(checksize) ? checksize : [checksize];
            const selectedColors = Array.isArray(checkcolor) ? checkcolor : [checkcolor]

            for (const selectedSize of selectedSizes) {
                for (const selectedColor of selectedColors) {
                    const existingProduct = await model_product_size_color.product_size_color_Model.findOne({
                        product_id: name,
                        size_id: selectedSize,
                        color_id: selectedColor,
                    });
                    if (existingProduct) {
                        return res.status(200).json({ message: 'Sản phẩm đã tồn tại ', existingProduct: existingProduct });
                    } else {
                        const newProductSizeColor = new model_product_size_color.product_size_color_Model({
                            product_id: name,
                            size_id: selectedSize,
                            color_id: selectedColor,
                            quantity: quantity,
                            createdAt: Date.now(),
                        });
                        await newProductSizeColor.save();
                        message = 'Thêm thành công'
                        sizeID = ''
                    }

                }
            }

        }
    } catch (error) {
        return res.status(404).json({ message: 'Erro', error: error });

    }
    res.render('product_size_color/add_product_size_color', {
        title: title,
        heading: "Thêm sản phẩm",
        product: product,
        size: size,
        color: color,
        message: message,
        selectedProductId: productID,
        selectedSizeID: sizeID,
        findImage: findImage?.image
    });
}

const updateQuantity = async (req, res) => {
    const updateQuantity = req.body.updateQuantity;
    // console.log('existingProductGlobal', existingProductGlobal.id);
    const finproduct = await model_product_size_color.product_size_color_Model.findById(existingProductGlobal.id);
    finproduct.quantity = updateQuantity
    await finproduct.save();
    console.log('finproduct', finproduct);
    res.redirect(`/product_size_color/getListAll/1?aler=Cập nhật thành công sản phẩm`)
}

const delete_product_color_size = async (req, res) => {

    let id_product_color_size = req.params.id_product_color_size;
    console.log('id_product_color_size', id_product_color_size);
    await model_product_size_color.product_size_color_Model.findByIdAndDelete(id_product_color_size);

    res.redirect(`/product_size_color/getListAll/1`)
}

const sortUp = async (req, res) => {
    try {
        const sortUpPrice = await model_product_size_color.product_size_color_Model.find({}).sort({ price: 1 })
            .populate('product_id', "name price")
            .populate('size_id', "name")
            .populate('color_id', "name")
        sortUpPrice.sort((a, b) => b.product_id.price - a.product_id.price);
        sortUpPrice.forEach((product) => {
            return product.product_id.price
        });
        const listCategory = await categoriModel.categoryModel.find();
        const listproduct = await productModel.productModel.find()
        res.render('product_size_color/product_size_color', {
            title: title,
            heading: heading,
            title: 'Product warehouse',
            listproduct: listproduct,
            productListSizeColor: sortUpPrice,
            countProducts: 1,
            countPages: 1,
            page: 1,
            startCount: 1,
            listCategory: listCategory,
            selectedroductName: 'all',
            message: '',

        })
    } catch (error) {
        console.log(error);
    }
}
const sortDown = async (req, res) => {
    try {
        const sortDownPrice = await model_product_size_color.product_size_color_Model.find({})
            .populate('product_id', "name price as product_price")
            .populate('size_id', "name")
            .populate('color_id', "name")
        sortDownPrice.sort((a, b) => b.product_id.price - a.product_id.price);
        sortDownPrice.forEach((product) => {
            return product.product_id.price
        });

        // console.log(sortDownPrice.sort());
        const listCategory = await categoriModel.categoryModel.find();
        const listproduct = await productModel.productModel.find()

        res.render('product_size_color/product_size_color', {
            heading: heading,
            title: title,
            title: 'Product warehouse',
            listproduct: listproduct,
            productListSizeColor: sortDownPrice,
            countProducts: 1,
            countPages: 1,
            page: 1,
            startCount: 1,
            listCategory: listCategory,
            selectedroductName: 'all',
            message: '  '
        })
    } catch (error) {
        console.log(error)
    }

}
const update_product_size_color = async (req, res) => {
    let message = '';
    const id_product_color_size = req.params.id_product_color_size
    const sizeId = req.query.sizeId;

    let size = await sizeModel.sizeModel.find();
    let color = await colorModel.colorModel.find();
    let product_size_color = await model_product_size_color.product_size_color_Model
        .findById(id_product_color_size)
        .populate('product_id', "name price image")
        .populate('size_id', "name")
        .populate('color_id', "name");

    if (req.method == 'POST') {
        const { name, size, color, quantity, price } = req.body;

        const update = {
            size_id: size,
            color_id: color,
            quantity: quantity,
            updatedAt: Date.now(),
        };
        try {
            await model_product_size_color.product_size_color_Model.findByIdAndUpdate(product_size_color._id, update);
            message = 'Cập nhật thành công'
        } catch (error) {
            console.log(error);
        }

    }

    res.render('product_size_color/update_product_size_color', {
        title: title,
        heading: 'Cập nhật sản phẩm',
        message: message,
        size: size,
        color: color,
        product_size_color: product_size_color,
        sizeId: sizeId
    })

}
const filterNameProduct = async (req, res) => {
    let message = ''
    const id_product = req.query.productName
    console.log(id_product);
    // 
    const filterProductName = await model_product_size_color.product_size_color_Model.find({ 'product_id': id_product })
        .populate('product_id', "name price")
        .populate('size_id', "name")
        .populate('color_id', "name").sort({ createdAt: -1 });

    const listCategory = await categoriModel.categoryModel.find();
    const listproduct = await productModel.productModel.find();
  
    if (filterProductName.length === 0) {
        message = '  '

    } else {
        message = ''
    }
    res.render('product_size_color/product_size_color', {
        title: title,
        heading: heading,
        listproduct: listproduct,
        productListSizeColor: filterProductName,
        countProducts: 1,
        countPages: 1,
        page: 1,
        startCount: 1,
        listCategory: listCategory,
        selectedroductName: id_product,
        message: message
    });

}

const search = async (req, res) => {
    try {
        let message = ''
        const searchQuery = req.query.search.toLowerCase();
        console.log(searchQuery);

        const productListSizeColor = await model_product_size_color.product_size_color_Model
            .find()
            .populate('product_id', 'name price')
            .populate('size_id', 'name')
            .populate('color_id', 'name')
            .sort({ createdAt: -1 });

        const filteredList = productListSizeColor.filter((item) => {
            return item.product_id.name.toLowerCase().includes(searchQuery);
        });

        const listCate = await categoriModel.categoryModel.find()
        const listProduct = await productModel.productModel.find()
        res.render('product_size_color/product_size_color', {
            listproduct: listProduct,
            productListSizeColor: filteredList,
            countProducts: 1,
            countPages: 1,
            page: 1,
            startCount: 1,
            listCategory: listCate,
            selectedroductName: 'all',
            message: message,
            title: title,
            heading: heading
        });
    } catch (error) {
        console.error(error);
        // Xử lý lỗi nếu có
        res.status(500).send('Internal Server Error');
    }
};

const exportExcel = async (req, res) => {
    try {
        const listProducts = await model_product_size_color.product_size_color_Model.find()
            .populate('product_id')
            .populate('size_id')
            .populate('color_id').sort({ createdAt: -1 })
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách kho hàng');
        const headers = ['STT', 'Ngày tạo', 'Tên sản phẩm', 'Giá', 'Kích cỡ', 'Màu sắc', 'Số lượng'];
        worksheet.addRow(headers);

        listProducts.forEach((product, index) => {
            const rowData = [
                index + 1,
                product.createdAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                product?.product_id?.name,
                product?.product_id?.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                product?.size_id?.name,
                product?.color_id?.name,
                product?.quantity

            ];
            worksheet.addRow(rowData);
        });

        // Tên file Excel
        const fileName = `Danh sách kho hàng.xlsx`;

        // Ghi workbook vào file
        await workbook.xlsx.writeFile(fileName);

        res.download(fileName, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {

                fs?.unlinkSync(fileName);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = { updateQuantity, exportExcel, search, getListAll, delete_product_color_size, sortUp, sortDown, add_product_size_color, update_product_size_color, filterNameProduct }