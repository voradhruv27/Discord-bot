// Basic controller for Admin operations.

const axios = require("axios");
const {
  getAllChats,
  getMessages,
  deleteChat,
  deleteMessage,
  setChatStatus,
  getChatStatus,
  setWelcomeEmbed,
  getWelcomeEmbed,
  linkEmbedToChat,
  getChatByEmbed,
  unlinkEmbedByChat,
} = require("../services/chatStore");
const { getEmbed, getAllEmbeds } = require("../services/embedStore");

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
    const chatsWithStatus = botChats.map((chat) => ({
      ...chat,
      status: getChatStatus(chat.name),
    }));
    res.json({ chats: chatsWithStatus });
  } catch (err) {
    console.error("Failed to fetch active chats from bot:", err.message);
    // Fallback to locally stored chats in-memory if bot is offline
    const chats = getAllChats().map((name) => ({
      name,
      id: getMessages(name)[0]?.channelId || null,
      status: getChatStatus(name),
    }));
    res.json({ chats });
  }
};

// Returns all messages for a specific chat channel.
// The channel name comes from the URL parameter
const getChatMessages = async (req, res) => {
  const { channelId } = req.params;
  try {
    const botUrl = process.env.BOT_SERVER_URL || "http://localhost:3001";
    const response = await axios.get(
      `${botUrl}/channels/${channelId}/messages`,
    );

    // Find channelName to retrieve the welcome embed from our chatStore
    const allChatNames = getAllChats();
    const channelName = allChatNames.find((name) => {
      const msgs = getMessages(name);
      return msgs.some((msg) => msg.channelId === channelId);
    });

    let welcomeEmbed = null;
    if (channelName) {
      welcomeEmbed = getWelcomeEmbed(channelName);
    } else {
      // Fallback: try to resolve channelName from active chats
      try {
        const activeResponse = await axios.get(`${botUrl}/active-chats`);
        const match = activeResponse.data.chats.find(c => c.id === channelId);
        if (match) {
          welcomeEmbed = getWelcomeEmbed(match.name);
        }
      } catch (e) {}
    }

    const mappedMessages = (response.data.messages || []).map(msg => {
      const activeChatChannelId = getChatByEmbed(msg.messageId);
      return { ...msg, activeChatChannelId };
    });

    res.json({
      messages: mappedMessages,
      welcomeEmbed,
    });
  } catch (err) {
    console.error("Failed to fetch chat messages from bot:", err.message);
    res.json({ messages: [], welcomeEmbed: null });
  }
};

// Handles notification from Bot that a new channel was created and broadcasts to websocket clients
const { broadcast } = require("../services/websocketService");
const notifyChannelCreated = (req, res) => {
  const { channelName, channelId, welcomeEmbed, embedMessageId } = req.body;

  if (embedMessageId) {
    linkEmbedToChat(embedMessageId, channelId);
  }

  if (welcomeEmbed) {
    setWelcomeEmbed(channelName, welcomeEmbed);
  }

  broadcast({
    type: "channel_created",
    payload: {
      name: channelName,
      id: channelId,
      welcomeEmbed,
    },
  });

  res.json({ status: "success" });
};

// Handles notification from Bot that a channel was deleted
const notifyChannelDeleted = (req, res) => {
  const { channelName, channelId } = req.body;

  deleteChat(channelName);
  unlinkEmbedByChat(channelId);

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

// Handles Close Ticket action from Admin UI (or notification from Bot)
const closeChatByChannel = async (req, res) => {
  const { channelId } = req.params;
  const { source } = req.body || {};

  try {
    const botUrl = process.env.BOT_SERVER_URL || "http://localhost:3001";
    // Notify the bot to make the channel read-only on Discord (safe and idempotent)
    await axios.post(`${botUrl}/channels/${channelId}/close`, { source });

    // Find channel name by channelId from stored messages or active chats
    const allChatNames = getAllChats();
    let channelName = allChatNames.find((name) => {
      const msgs = getMessages(name);
      return msgs.some((msg) => msg.channelId === channelId);
    });

    if (!channelName) {
      try {
        const activeResponse = await axios.get(`${botUrl}/active-chats`);
        const match = activeResponse.data.chats.find(c => c.id === channelId);
        if (match) channelName = match.name;
      } catch (e) {}
    }

    if (channelName) {
      setChatStatus(channelName, "closed");
    }

    broadcast({
      type: "chat_closed",
      payload: { channelId, channelName: channelName || null },
    });

    res.json({ status: "success" });
  } catch (err) {
    console.error("Failed to close chat channel:", err.message);
    res.status(500).json({ error: "Failed to close chat channel" });
  }
};

// Creates a new chat channel for a user on behalf of the Admin panel
const createChatFromAdmin = async (req, res) => {
  const { userId, embedMessageId } = req.body;

  try {
    const botUrl = process.env.BOT_SERVER_URL || "http://localhost:3001";
    
    let embedChannelId = null;
    if (embedMessageId) {
      const embedRecord = getAllEmbeds().find(emb => emb.messageId === embedMessageId);
      if (embedRecord) {
        embedChannelId = embedRecord.channelId;
      }
    }

    const response = await axios.post(`${botUrl}/create-chat-from-admin`, { 
      userId, 
      embedMessageId, 
      embedChannelId 
    });
    
    // If successfully created from admin side, link it in the store as well
    if (response.data && response.data.status === "success" && embedMessageId) {
      linkEmbedToChat(embedMessageId, response.data.channelId);
    }

    res.json(response.data);
  } catch (err) {
    console.error("Failed to create chat from admin:", err.message);
    res.status(500).json({ error: "Failed to create chat from admin" });
  }
};

module.exports = {
  getAdminStats,
  getChats,
  getChatMessages,
  notifyChannelCreated,
  notifyChannelDeleted,
  notifyMessageDeleted,
  closeChatByChannel,
  createChatFromAdmin,
};
