var db = require('./db');

var notificationSchema = new db.mongoose.Schema(
    {
        id_user : {type : db.mongoose.Schema.Types.ObjectId , ref : 'userModel'},
        payload : {type : String , require : false},
        statu_payload : {type : String , require : false},
        image : {type : String , require : false},
        title : {type : String , require : true},
        content : {type : String , require : true},
        date : {type : Date , require : false},
        status : {type : Boolean , require : true}
    },
    { collection: 'notification' }
);

let notificationModel = db.mongoose.model('notificationModel', notificationSchema);

module.exports = { notificationModel };