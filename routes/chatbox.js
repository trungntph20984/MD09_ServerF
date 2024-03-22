var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer();
const checkLogin = require('../meddlewares/check_login');


var mChatBoxController = require('../controllers/chatbox.controller')

router.get('/', checkLogin.requiresLogin, mChatBoxController.index);
router.post('/', checkLogin.requiresLogin, mChatBoxController.index);

// router.get('/r/:id', mChatBoxController.index);
// router.post('/r/:id', mChatBoxController.index);
router.post('/api/message', checkLogin.requiresLogin, mChatBoxController.postMessage);
router.get('/api/message/:conversationId', checkLogin.requiresLogin, mChatBoxController.getMessages);


module.exports = router;
