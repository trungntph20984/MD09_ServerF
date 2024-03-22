var db = require('./db');

const BannerSChema = new db.mongoose.Schema(
    {    
        image_banner:{type:String,require:true},
        product_id:[{type:db.mongoose.Schema.Types.ObjectId,ref:'productModel'}],
        description: { type: String, required: true },
        createdAt: { type: Date, required: false },
        updatedAt: { type: Date, required: false },
    },
    {
        // dinh nghia ten bang du lieu 
        collection:'banner'
    }
)
let bannerModel = db.mongoose.model('bannerModel',BannerSChema);

module.exports={bannerModel}