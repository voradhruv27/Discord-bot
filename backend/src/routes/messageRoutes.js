const express = require("express");
const router = express.Router();
const { receiveMessage, sendMessage } = require("../controllers/messageController");

router.post("/receive", receiveMessage);
router.post("/send", sendMessage);

module.exports = router;
