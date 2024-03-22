var db = require('./db');

const userdiscount_SChema = new db.mongoose.Schema(
    {
        user_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel', require: true },   
        discount_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'discountModel', require: true },
        usage_count : { type: Number, required: true },
        createdAt: { type: Date, required: false },
        updatedAt: { type: Date, required: false },

    },
    {
        collection: 'userdiscount',
    }
)


let userdiscountModel = db.mongoose.model('userdiscountModel', userdiscount_SChema);


module.exports = { userdiscountModel }