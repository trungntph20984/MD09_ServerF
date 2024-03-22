var db = require('./db');

const discount_SChema = new db.mongoose.Schema(
    {
        user_id: [{ type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel', require: false }],
        code_discount: { type: String, required: true },
        start_day: { type: String, required: true },
        end_day: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
        usageCount: { type: Number, required: true },
        createdAt: { type: Date, required: true },
        updatedAt: { type: Date, required: false },

    },
    {
        collection: 'discount'
    }
)


let discountModel = db.mongoose.model('discountModel', discount_SChema);


module.exports = { discountModel }