const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getChatMessages,
  getChats,
  notifyChannelCreated,
  notifyChannelDeleted,
  notifyMessageDeleted,
  closeChatByChannel,
  createChatFromAdmin,
} = require("../controllers/adminController");

router.get("/status", getAdminStats);
router.get("/chats", getChats);
router.get("/chats/:channelId/messages", getChatMessages);
router.post("/channels/created", notifyChannelCreated);
router.post("/channels/deleted", notifyChannelDeleted);
router.post("/messages/deleted", notifyMessageDeleted);
router.patch("/chats/:channelId/close", closeChatByChannel);
router.post("/chats/create-from-admin", createChatFromAdmin);

module.exports = router;
