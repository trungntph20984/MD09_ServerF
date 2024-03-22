const colorModel = require('../../models/color.model')


const listColors = async (req,res)=>{
        const listColor = await colorModel.colorModel.find();


    return res.status(200).json({ message: 'Succset',listColor:listColor });
   
}
    
const addColor = async (req,res)=>{
    const { name } = req.body;
    if (req.method === 'POST') {
        let objColor = new colorModel.colorModel({
            name: name,
        });
        try {

            await objColor.save();
            return res.status(200).json({ message: 'Thêm thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi ghi CSDL: ' + error.message });
        }
    }
}


module.exports={addColor,listColors}