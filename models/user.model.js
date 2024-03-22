var db = require('./db');
var userSchema = new db.mongoose.Schema(
    {
        avata: { type: String, required: false },
        username: { type: String, required: false },
        password: { type: String, required: false },
        email: { type: String, required: false },
        address: { type: db.mongoose.Schema.Types.ObjectId, ref: 'addressModel' },
        role: { type: String, required: true },
        full_name: { type: String, required: true },
        phone_number: { type: String, required: true },
        status: { type: Boolean, require: true },
        token: { type: String, require: false },
        socketId: { type: String, require: false },
        deviceId: { type: String, require: false },
        created_at: { type: Date, require: false },
    },
    { collection: 'users' }
);

userSchema.query.filteredSelect = function () {
    return this.select({ avata: 0, username: 0, password: 0, email: 0, address: 0, deviceId: 0, created_at: 0, __v: 0, socketId: 0 });
};

userSchema.query.getProfile = function () {
    return this.select({ password: 0, created_at: 0, token: 0, socketId: 0, deviceId: 0 });
}

const addressChema = new db.mongoose.Schema(
    {
        user_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel' },
        address: { type: String, required: true },
        specific_addres: { type: String, required: true },
    },
    { collection: 'address' }
);

let userModel = db.mongoose.model('userModel', userSchema);
let addressModel = db.mongoose.model('addressModel', addressChema);

module.exports = { userModel, addressModel };