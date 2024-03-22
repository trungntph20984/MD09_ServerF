var ConversationModel = require('../../models/conversation.model');
var socketIo = require('socket.io');
var http = require('http');
let moment = require('moment')

var app = require('express')();
var server = http.createServer(app);
var io = socketIo(server);

var objReturn = {
    status: 1,
    msg: 'OK'
}



exports.createConversation = async (req, res) => {
    const { members } = req.body;
    var date = moment(Date.now()).utc().toDate();

    try {
        const conversation = new ConversationModel.ConversationModel({
            createdAt: date,
            members
        });

        await conversation.save();

        objReturn.data = conversation;
    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
    }

    res.json(objReturn);
};

exports.getConversationsByUser = async (req, res) => {
    const { userId } = req.params;
    let list = [];
    try {
        list = await ConversationModel.ConversationModel.find({
            members: { $in: [userId] }
        }).sort({ createdAt: -1 });

        if (list.length > 0) {
            objReturn.msg = 'có dữ liệu phù hợp';
            objReturn.data = list;
            objReturn.status = 1;
        } else {
            objReturn.status = 0;
            objReturn.msg = 'Không có dữ liệu phù hợp';
            objReturn.data = list;
        }
    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
    }

    res.json(objReturn);
};
exports.getConversationsById = async (req, res) => {
    const { conversationId, userId } = req.params;
    let objReturn = {};

    try {
        const conversation = await ConversationModel.ConversationModel.findById(
            conversationId
        );

        if (!conversation) {
            objReturn.status = 0;
            objReturn.msg = 'Không tìm thấy cuộc trò chuyện';
            objReturn.data = null;
        } else {
            const members = conversation.members.filter(member => String(member) !== userId);

            objReturn.msg = 'Có dữ liệu phù hợp';
            objReturn.data = { members };
            objReturn.status = 1;
        }
    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
        objReturn.data = null;
    }

    res.json(objReturn);
};
