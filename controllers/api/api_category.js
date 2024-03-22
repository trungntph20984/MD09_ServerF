const categoryModel = require('../../models/category.model')


const listCategorys = async (req,res)=>{
        const listCategorys = await categoryModel.categoryModel.find();
    return res.status(200).json({ message: 'Succset',listCategorys:listCategorys });
   
}



const addCategory = async (req,res)=>{
    const { name } = req.body;
    if (req.method === 'POST') {
        let objCategory = new categoryModel.categoryModel({
            name: name,
        });
        try {

            await objCategory.save();
            return res.status(200).json({ message: 'Thêm thể loại thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi ghi CSDL: ' + error.message });
        }
    }
}


module.exports={addCategory,listCategorys}