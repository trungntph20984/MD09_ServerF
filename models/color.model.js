var db = require('./db');

const ColorSChema = new db.mongoose.Schema(
    {    
        name:{type:String,require:true},
        colorcode:{type:String,require:false},
    },
    {
        // dinh nghia ten bang du lieu 
        collection:'color'
    }
)
let colorModel = db.mongoose.model('colorModel',ColorSChema);

module.exports={colorModel}