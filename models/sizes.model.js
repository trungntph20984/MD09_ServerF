var db = require('./db');

const SizeSChema = new db.mongoose.Schema(
    {    
        name:{type:String,require:true},
        
    },
    {
        collection:'size'
    }
)
let sizeModel = db.mongoose.model('sizeModel',SizeSChema);

module.exports={sizeModel}