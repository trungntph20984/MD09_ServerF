var db = require('./db');
const productSchema = new db.mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: [String], required: false },
        category_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'categoryModel' },
        price: { type: Number, required: true },
        discount: { type: Number, required: false },
        rating: { type: Number, require: false },
        createdAt: { type: Date, required: false },
        updatedAt: { type: Date, required: false },
    },
    { collection: 'product' }
);


productSchema.query.getIdAndName = function () {
    return this.select({description : 0, __v: 0,image : 0,category_id : 0, price: 0, discount: 0, rating: 0 , createdAt: 0, updatedAt: 0});
};

let productModel = db.mongoose.model('productModel', productSchema);

const commentSchema = new db.mongoose.Schema(
    {
        product_detail_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'product_size_color_Model' },
        product_id : {type : db.mongoose.Schema.Types.ObjectId, ref : 'productModel'},
        user_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel' },
        comment: { type: String, require: true },
        rating: { type: Number, require: true },    
        date: { type: Date, require: true },
        updatedAt : {type: Date , require: false},
        images : {type : Array , require : false},
        discount: { type: Number, require: false },
    },
    {
        collection: 'Comment'
    }
);
let commentModel = db.mongoose.model('commentModel', commentSchema);


module.exports = { productModel, commentModel };