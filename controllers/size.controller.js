let sizemd = require('../models/sizes.model')


let title = 'Kích thước'
let heading = 'Danh sách kích thước'

const getAll = async (req, res) => {
  const aler = req.query.aler;
  const listSize = await sizemd.sizeModel.find()
  res.render('size/list', {
    title:title,
    heading:heading,
    listSize: listSize,
    message:aler
  });
}

const addSize = async (req, res) => {
  const sizeName = req.body.name;

  try {
    await sizemd.sizeModel.create({ name: sizeName });

    res.redirect('/size?aler=Thêm thành công');
  } catch (error) {
    res.status(500).json({ error: error, message: 'Có lỗi xảy ra khi thêm kích thước' });
  }
};
const deleteSize = async (req, res) => {
  const idSize = req.params.idSize;

  try {
    await sizemd.sizeModel.findByIdAndDelete(idSize);
    res.redirect('/size?aler=Xóa thành công');
  } catch (error) {
    res.status(500).json({ error: error, message: 'Có lỗi xảy ra khi xóa kích thước' });
  }
};

const updateSize =async (req,res)=>{
  const idSize = req.params.idSize;
  const newName = req.body.nameSize;
  try {
      await sizemd.sizeModel.findByIdAndUpdate(idSize, { name: newName});
      res.redirect('/size?aler=Cập nhật thành công');
  } catch (error) {
      res.status(500).json({ error: error, message: 'Có lỗi xảy ra' });
  }
}
module.exports = { getAll,addSize,deleteSize ,updateSize}