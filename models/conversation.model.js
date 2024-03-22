var db = require('./db');

var ConversationSchema = new db.mongoose.Schema(
    {
        members: [{

            type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel',


        }],
        createdAt: { type: Date, required: false },
        name: { type: String, required: false },
        image: { type: String, required: false }
    },
    { collection: 'conversation' }
);

let ConversationModel = db.mongoose.model('ConversationModel', ConversationSchema);

module.exports = { ConversationModel };

