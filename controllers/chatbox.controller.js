var fs = require('fs');
const mCOMD = require('../models/conversation.model');
const mMEMD = require('../models/message.model');
const mUSMD = require('../models/user.model');
const mongoose = require('mongoose');
var moment = require('moment-timezone');
var http = require('http');

let title = 'Khung Chat'
let heading = 'Chăm Sóc Khách Hàng'
let msg = ''
let msg2 = ''

const { log } = require('console');

exports.index = async (req, res, next) => {
    try {
        const mID_ADMIN_LOGIN = res.locals.user._id;
        // const mID_ADMIN_LOGIN = "65849105a6299a9efc3909db";

        const conversations = await mCOMD.ConversationModel.find({ members: mID_ADMIN_LOGIN })
            .populate('members', 'username')
            .sort({ createdAt: -1 });

        await Promise.all(conversations.map(async (conversation) => {
            await Promise.all(conversation.members.map(async (member) => {
                if (member._id.toString() !== mID_ADMIN_LOGIN) {
                    const otherUserId = member._id.toString();
                    const otherUser = await mUSMD.userModel.findById(otherUserId);

                    if (otherUser) {
                        // console.log("Full Name:", otherUser.full_name);
                        // console.log("Avata:", otherUser.avata);
                        member.full_name = otherUser.full_name; // Cập nhật thông tin user
                        member.avata = otherUser.avata; // Cập nhật thông tin user
                    } else {
                        console.error("Không tìm thấy thông tin người dùng có ID:", otherUserId);
                    }
                }
            }));
        }));

        res.render('chatBox/index', {
            title: title,
            heading: heading,
            idsender: mID_ADMIN_LOGIN,
            conversations: conversations,

        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
exports.getMessages = async (req, res, next) => {
    try {
        const mID_ADMIN_LOGIN = res.locals.user._id;
        const conversationId = req.params.conversationId;

        // Lấy danh sách tin nhắn cho cuộc trò chuyện
        const messages = await mMEMD.MessageModel.find({ conversationId: conversationId })
            .populate('sender', 'username');

        res.render('chatBox/chat', {
            title: 'Chat',
            heading: 'Chat',
            messages: messages,
            conversationId: conversationId,
            userId: mID_ADMIN_LOGIN,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
exports.postMessage = async (req, res, next) => {
    try {
        const mID_ADMIN_LOGIN = res.locals.user._id;
        const conversationId = req.params.conversationId;
        const text = req.body.text;
        var date = moment(Date.now()).utc().toDate();

        // Tạo tin nhắn mới
        const newMessage = new mMEMD.MessageModel({
            conversationId: conversationId,
            sender: mID_ADMIN_LOGIN,
            text: text,
            createdAt: date,
        });

        if (req.file) {
            try {
                fs.renameSync(req.file.path, './public/imgMessage/' + newMessage._id + '_' + req.file.originalname);
                newMessage.text = '/imgMessage/' + message._id + '_' + req.file.originalname;
            } catch (error) {
                console.log("Ảnh bị lỗi rồi: " + error);
            }
        } else {
        }

        // Lưu tin nhắn vào cơ sở dữ liệu
        await newMessage.save();

        // Redirect về trang chat
        res.redirect(`/chat/${conversationId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



