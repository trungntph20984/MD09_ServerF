var MessageModel = require('../../models/message.model');
var ConversationModel = require('../../models/conversation.model');

var socketIo = require('socket.io');
var http = require('http');
let moment = require('moment')

var app = require('express')();
var server = http.createServer(app);
var fs = require('fs');

var objReturn = {
    status: 1,
    msg: 'OK'
}


exports.createMessage = async (req, res) => {
    const { conversationId, sender, text } = req.body;
    var date = moment(Date.now()).utc().toDate();

    try {
        const message = new MessageModel.MessageModel({
            conversationId,
            sender,
            text,
            createdAt: date
        });

        if (req.file) {
            try {
                fs.renameSync(req.file.path, './public/imgMessage/' + message._id + '_' + req.file.originalname);
                message.text = '/imgMessage/' + message._id + '_' + req.file.originalname;
            } catch (error) {
                console.log("Ảnh bị lỗi rồi: " + error);
            }
        } else {
        }

        const updatedCD = await ConversationModel.ConversationModel.findByIdAndUpdate(
            conversationId,
            { createdAt: date }, { new: true });
        // console.log(updatedCD);

        await message.save();
        // Phát một sự kiện 'new_message' với tin nhắn mới
        // io.emit('receive_message', message);
        objReturn.data = message;
    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
    }

    res.json(objReturn);
};

exports.getMessagesByConversation = async (req, res) => {
    let list = [];

    const { conversationId } = req.params;

    try {
        list = await MessageModel.MessageModel.find({
            conversationId
        });

        if (list.length > 0) {
            objReturn.data = list;
            objReturn.msg = 'có dữ liệu phù hợp';
            objReturn.status = 1;

        } else {
            objReturn.status = 0;
            objReturn.data = list;
            objReturn.msg = 'Không có tin nhắn nào trong cuộc trò chuyện này';
        }
    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
    }

    res.json(objReturn);
};
