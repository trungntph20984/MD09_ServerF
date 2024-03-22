let colormd = require('../models/color.model')

let title = 'Màu sắc'
let heading = 'Danh sách màu sắc'
// <% if (message === 'Thêm thành công' || message === 'Cập nhật thành công' || message === 'Xóa thành công') { %>

const getAll = async (req, res) => {
  const aler = req.query.aler;
  const listColor = await colormd.colorModel.find();
  res.render('color/list', {
    title: title,
    heading: heading,
    listColor: listColor,
    message:aler
  });
}
const addColor = async (req, res) => {
  try {
    const { name, codecolor } = req.body;

    // Tạo một bản ghi mới trong cơ sở dữ liệu

    await colormd.colorModel.create({
      name: name,
      colorcode: codecolor,

    });
    res.redirect('/color?aler=Thêm thành công');
  } catch (error) {
    res.status(500).json({ error: error, message: 'Có lỗi xảy ra khi thêm màu sắc' });
  }
};


const deleteColor = async (req, res) => {
  const idColor = req.params.idColor;
  try {
    await colormd.colorModel.findByIdAndDelete(idColor);
    res.redirect('/color?aler=Xóa thành công');
  } catch (error) {
    res.status(500).json({ error: error, message: 'Có lỗi xảy ra khi xóa màu sắc' });
  }
};

const updateColor =async (req,res)=>{
  const idCate = req.params.idColor;
  const newName = req.body.nameColor;
  const newcodecolor = req.body.codecolor
  try {
      await colormd.colorModel.findByIdAndUpdate(idCate, { name: newName,colorcode:newcodecolor });
      res.redirect('/color?aler=Cập nhật thành công');
  } catch (error) {
      res.status(500).json({ error: error, message: 'Có lỗi xảy ra' });
  }
}
module.exports = { getAll, addColor, deleteColor,updateColor }