const sizeModel = require('../../models/sizes.model')


const listSizes = async (req, res) => {
    const listSizes = await sizeModel.sizeModel.find();
    return res.status(200).json({ message: 'Succset', listSizes: listSizes });

}

const addSize = async (req, res) => {
    const { name } = req.body;
    if (req.method === 'POST') {
        let objSize = new sizeModel.sizeModel({
            name: name,
        });
        try {

            await objSize.save();
            return res.status(200).json({ message: 'Thêm Size thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi ghi CSDL: ' + error.message });
        }
    }
}





module.exports = { listSizes, addSize }