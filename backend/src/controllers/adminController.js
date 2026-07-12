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
} = require("../store/chatStore");
const { getAllEmbeds } = require("../store/embedStore");

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

    // getChatStatus is now async, so we loop instead of .map()
    const chatsWithStatus = [];
    for (const chat of botChats) {
      const status = await getChatStatus(chat.name);
      chatsWithStatus.push({ ...chat, status });
    }

    res.json({ chats: chatsWithStatus });
  } catch (err) {
    console.error("Failed to fetch active chats from bot:", err.message);
    // Fallback to locally stored chats if bot is offline
    try {
      const chatNames = await getAllChats();
      const chats = [];
      for (const name of chatNames) {
        const msgs = await getMessages(name);
        const status = await getChatStatus(name);
        chats.push({
          name,
          id: msgs[0]?.channelId || null,
          status,
        });
      }
      res.json({ chats });
    } catch (fallbackErr) {
      console.error("Fallback also failed:", fallbackErr.message);
      res.json({ chats: [] });
    }
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

    // Find channelName to retrieve the welcome embed from our store
    const allChatNames = await getAllChats();
    let channelName = null;
    for (const name of allChatNames) {
      const msgs = await getMessages(name);
      if (msgs.some((msg) => msg.channelId === channelId)) {
        channelName = name;
        break;
      }
    }

    let welcomeEmbed = null;
    if (channelName) {
      welcomeEmbed = await getWelcomeEmbed(channelName);
    } else {
      // Fallback: try to resolve channelName from active chats
      try {
        const activeResponse = await axios.get(`${botUrl}/active-chats`);
        const match = activeResponse.data.chats.find(c => c.id === channelId);
        if (match) {
          welcomeEmbed = await getWelcomeEmbed(match.name);
        }
      } catch (e) {}
    }

    // getChatByEmbed is now async — use Promise.all for parallel lookups
    const rawMessages = response.data.messages || [];
    const mappedMessages = await Promise.all(
      rawMessages.map(async (msg) => {
        const activeChatChannelId = await getChatByEmbed(msg.messageId);
        return { ...msg, activeChatChannelId };
      }),
    );

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
const notifyChannelCreated = async (req, res) => {
  const { channelName, channelId, welcomeEmbed, embedMessageId } = req.body;

  try {
    if (embedMessageId) {
      await linkEmbedToChat(embedMessageId, channelId);
    }

    if (welcomeEmbed) {
      await setWelcomeEmbed(channelName, welcomeEmbed);
    }

    broadcast({
      type: "channel_created",
      payload: {
        name: channelName,
        id: channelId,
        welcomeEmbed,
        embedMessageId: embedMessageId || null,
      },
    });

    res.json({ status: "success" });
  } catch (err) {
    console.error("Failed to handle channel created:", err.message);
    res.status(500).json({ error: "Failed to handle channel created" });
  }
};

// Handles notification from Bot that a channel was deleted
const notifyChannelDeleted = async (req, res) => {
  const { channelName, channelId } = req.body;

  try {
    await deleteChat(channelName);
    await unlinkEmbedByChat(channelId);

    broadcast({
      type: "channel_deleted",
      payload: {
        name: channelName,
        id: channelId,
      },
    });

    res.json({ status: "success" });
  } catch (err) {
    console.error("Failed to handle channel deleted:", err.message);
    res.status(500).json({ error: "Failed to handle channel deleted" });
  }
};

// Handles notification from Bot that a message was deleted
const notifyMessageDeleted = async (req, res) => {
  const { channelName, messageId } = req.body;

  try {
    await deleteMessage(channelName, messageId);

    broadcast({
      type: "message_deleted",
      payload: {
        channelName,
        messageId,
      },
    });

    res.json({ status: "success" });
  } catch (err) {
    console.error("Failed to handle message deleted:", err.message);
    res.status(500).json({ error: "Failed to handle message deleted" });
  }
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
    const allChatNames = await getAllChats();
    let channelName = null;
    for (const name of allChatNames) {
      const msgs = await getMessages(name);
      if (msgs.some((msg) => msg.channelId === channelId)) {
        channelName = name;
        break;
      }
    }

    if (!channelName) {
      try {
        const activeResponse = await axios.get(`${botUrl}/active-chats`);
        const match = activeResponse.data.chats.find(c => c.id === channelId);
        if (match) channelName = match.name;
      } catch (e) {}
    }

    if (channelName) {
      await setChatStatus(channelName, "closed");
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
      const allEmbeds = await getAllEmbeds();
      const embedRecord = allEmbeds.find(emb => emb.messageId === embedMessageId);
      if (embedRecord) {
        embedChannelId = embedRecord.channelId;
      }
    }

    const response = await axios.post(`${botUrl}/create-chat-from-admin`, {
      userId,
      embedMessageId,
      embedChannelId,
    });

    // If successfully created from admin side, link it in the store as well
    if (response.data && response.data.status === "success" && embedMessageId) {
      await linkEmbedToChat(embedMessageId, response.data.channelId);
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
