var db = require('./db');

const CategorySChema = new db.mongoose.Schema(
    {    
        name:{type:String,require:true},
    },
    {
        // dinh nghia ten bang du lieu 
        collection:'category'
    }
)
let categoryModel = db.mongoose.model('categoryModel',CategorySChema);

module.exports={categoryModel}