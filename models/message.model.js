var db = require('./db');

var MessageSchema = new db.mongoose.Schema(
    {
        conversationId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'ConversationModel' },
        sender: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel' },
        createdAt: { type: Date, required: false },
        text: String,
    },
    { collection: 'message' }
);

let MessageModel = db.mongoose.model('MessageModel', MessageSchema);

module.exports = { MessageModel };
