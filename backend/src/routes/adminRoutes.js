const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getChatMessages,
  getChats,
  notifyChannelCreated,
  notifyChannelDeleted,
  notifyMessageDeleted,
} = require("../controllers/adminController");

router.get("/status", getAdminStats);
router.get("/chats", getChats);
router.get("/chats/:channelName/messages", getChatMessages);
router.post("/channels/created", notifyChannelCreated);
router.post("/channels/deleted", notifyChannelDeleted);
router.post("/messages/deleted", notifyMessageDeleted);

module.exports = router;
