// Basic controller for Admin operations.

const axios = require("axios");
const { getAllChats, getMessages, deleteChat, deleteMessage, setChatStatus } = require("../services/chatStore");

const getAdminStats = (req, res) => {
  res.json({
    status: "active",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
};

// Returns a list of all active chat channel names and IDs.
const getChats = async (req, res) => {
  try {
    const botUrl = process.env.BOT_SERVER_URL || "http://localhost:3001";
    const response = await axios.get(`${botUrl}/active-chats`);
    const botChats = response.data.chats || [];
    res.json({ chats: botChats });
  } catch (err) {
    console.error("Failed to fetch active chats from bot:", err.message);
    // Fallback to locally stored chats in-memory if bot is offline
    const chats = getAllChats().map((name) => ({
      name,
      id: getMessages(name)[0]?.channelId || null,
    }));
    res.json({ chats });
  }
};

// Returns all messages for a specific chat channel.
// The channel name comes from the URL parameter
const getChatMessages = (req, res) => {
  const { channelName } = req.params;
  const messages = getMessages(channelName);
  res.json({ messages });
}

// Handles notification from Bot that a new channel was created and broadcasts to websocket clients
const { broadcast } = require("../services/websocketService");
const notifyChannelCreated = (req, res) => {
  const { channelName, channelId } = req.body;

  broadcast({
    type: "channel_created",
    payload: {
      name: channelName,
      id: channelId,
    },
  });

  res.json({ status: "success" });
};

// Handles notification from Bot that a channel was deleted
const notifyChannelDeleted = (req, res) => {
  const { channelName, channelId } = req.body;

  deleteChat(channelName);

  broadcast({
    type: "channel_deleted",
    payload: {
      name: channelName,
      id: channelId,
    },
  });

  res.json({ status: "success" });
};

// Handles notification from Bot that a message was deleted
const notifyMessageDeleted = (req, res) => {
  const { channelName, messageId } = req.body;

  deleteMessage(channelName, messageId);

  broadcast({
    type: "message_deleted",
    payload: {
      channelName,
      messageId,
    },
  });

  res.json({ status: "success" });
};

// Handles notification from Bot that a chat was closed (ticket closed)
const closeChatByChannel = (req, res) => {
  const { channelId } = req.params;

  // Find channel name by channelId from the stored messages
  const allChatNames = getAllChats();
  const channelName = allChatNames.find((name) => {
    const msgs = getMessages(name);
    return msgs.some((msg) => msg.channelId === channelId);
  });

  if (channelName) {
    setChatStatus(channelName, "closed");
  }

  broadcast({
    type: "chat_closed",
    payload: { channelId, channelName: channelName || null },
  });

  res.json({ status: "success" });
};

module.exports = {
  getAdminStats,
  getChats,
  getChatMessages,
  notifyChannelCreated,
  notifyChannelDeleted,
  notifyMessageDeleted,
  closeChatByChannel,
};
