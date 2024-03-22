const mdFavorite = require('../../models/favorite.model')
const mdUser = require('../../models/user.model')
const mdProduct = require('../../models/product.model')

const addFavorite = async (req, res) => {
    try {
        const idUser = req.params.idUser;
        const idProduct = req.params.idProduct;
        const id_user = await mdUser.userModel.findById(idUser)
        const id_product = await mdProduct.productModel.findById(idProduct);

        if (req.method === 'POST') {

            if(id_user && id_product){
                let objChekFavorite = await mdFavorite.favorite_Model.findOne({user_id : idUser , product_id : idProduct});

                if(!objChekFavorite){
                    let objfavorite = new mdFavorite.favorite_Model({
                        user_id: id_user._id,
                        product_id: id_product._id,
                        createdAt:Date.now()
                    })
                    await objfavorite.save();
                    res.status(200).json({ message: "Success" });
                    return
                }
            }

            res.status(500).json({ message: "ERROR : user không tồn tại" });
            

        }
    } catch (error) {
        res.status(500).json({ message: 'ERROR  : ' + error.message });
    }

}




const getListFavorite = async (req, res) => {
    try {
        const idUser = req.params.idUser;
        const listFavorite = await mdFavorite.favorite_Model.find({ user_id: idUser })
            .populate('product_id').populate('user_id', "name").sort({ createdAt: -1 })
        res.status(200).json({ message: "Success", listFavorite: listFavorite });
    } catch (error) {
        res.status(500).json({ message: 'ERROR : ' + error.message });

    }
}

const deleteFavorite = async (req, res) => {
    try {
        const idFavorite = req.params.idFavorite;
        await mdFavorite.favorite_Model.findByIdAndDelete(idFavorite);
        res.status(200).json({ message: "Delete Favorite Success" });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi  CSDL: ' + error.message });
    }
}
module.exports = { addFavorite, getListFavorite, deleteFavorite }
