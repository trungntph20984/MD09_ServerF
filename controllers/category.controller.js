const catemd = require('../models/category.model')

let title = 'Thể loại'
let heading = 'Danh sách thể loại'
let message = ''
const getAll = async (req, res) => {
  const aler = req.query.aler;
  const listCate = await catemd.categoryModel.find()
  res.render('category/list', {
    title: title,
    heading: heading,
    listCate: listCate,
    message:aler
  });
}
const addCate = async (req, res) => {
  const nameCate = req.body.name;

  try {
    if (req.method === 'POST') {
      await catemd.categoryModel.create({ name: nameCate });
      res.redirect('/category?aler=Thêm thành công');
    }
  } catch (error) {
    res.status(500).json({ error: error, message: 'Có lỗi xảy ra' });
  }
};

  const deleteCate = async (req, res) => {
    const idCate = req.params.idCate;
    console.log(idCate)
    try {
      await catemd.categoryModel.findByIdAndDelete(idCate);
      res.redirect('/category?aler=Xóa thành công');
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

const updateCate = async (req, res) => {
    const idCate = req.params.idCate;
    const newName = req.body.nameCate;
    try {
        await catemd.categoryModel.findByIdAndUpdate(idCate, { name: newName });
        res.redirect('/category?aler=Cập nhật thành công');
    } catch (error) {
        res.status(500).json({ error: error, message: 'Có lỗi xảy ra' });
    }
};

  module.exports = { getAll, deleteCate, addCate,updateCate }