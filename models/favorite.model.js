var db = require('./db');

const favorite_SChema = new db.mongoose.Schema(
    {    
        user_id:{type:db.mongoose.Schema.Types.ObjectId,ref:'userModel'},
        product_id:{type:db.mongoose.Schema.Types.ObjectId,ref:'productModel'},
        createdAt: { type: Date, required: false },
        updatedAt: { type: Date, required: false },
    },
    {

        collection:'favorite'
    }
)
let favorite_Model = db.mongoose.model('favorite_Model',favorite_SChema);

module.exports={favorite_Model}