var db = require('./db');

const cart_SChema = new db.mongoose.Schema(
    {
        user_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel' },
        product_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'product_size_color_Model' },
        quantity: { type: Number, require: true },
        status: { type: String, required: true },
        createdAt: { type: Date, required: false },
        updatedAt: { type: Date, required: false },
    },
    {
        collection: 'cart'
    }
)
let cartModel = db.mongoose.model('cartModel', cart_SChema);

module.exports = { cartModel }