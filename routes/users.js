const express = require('express');
const router = express.Router();
const userCtrl = require('..//controllers/user.controller');
const checkLogin = require('../meddlewares/check_login');

const multer = require('multer');
const upLoader = multer({ dest: './tmp' });

router.get("/", checkLogin.requiresLogin, userCtrl.list);
router.get("/add", checkLogin.requiresLogin, userCtrl.add);
router.post("/add", upLoader.single("img-avata"), userCtrl.add);
router.get("/:id", checkLogin.requiresLogin, userCtrl.details);
router.post("/:id", upLoader.single("img-avata"), userCtrl.edit);

router.get("/lock/:idUser", checkLogin.requiresLogin, userCtrl.lock);
router.get("/un-lock/:idUser", checkLogin.requiresLogin, userCtrl.unLock);

module.exports = router;
