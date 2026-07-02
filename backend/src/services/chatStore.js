// In-memory store for chat messages, grouped by channel name.

// Structure: { "chat-1": [msg1, msg2, ...], "chat-2": [msg1, ...] }
const chats = {};

// Add a message to a chat channel.
// If the channel doesn't exist yet, create it.

const addMessage = (channelName, message) => {
  if (!chats[channelName]) {
    chats[channelName] = [];
  }
  // Prevent duplicate messages if any are received twice
  const alreadyExists = chats[channelName].some(
    (msg) => msg.messageId && msg.messageId === message.messageId,
  );
  if (!alreadyExists) {
    chats[channelName].push(message);
  }
};

// Get all messages for a specific chat channel.
// Returns an empty array if the channel doesn't exist.
const getMessages = (channelName) => {
  return chats[channelName] || [];
};

// Get a list of all active chat channel names.
// Returns something like: ["chat-1", "chat-2", "chat-3"]
const getAllChats = () => {
  return Object.keys(chats);
};

// Delete an entire chat channel from store
const deleteChat = (channelName) => {
  delete chats[channelName];
};

// Delete a specific message from a chat channel
const deleteMessage = (channelName, messageId) => {
  if (chats[channelName]) {
    chats[channelName] = chats[channelName].filter(
      (msg) => msg.messageId !== messageId,
    );
  }
};

// --- Chat status tracking (open / closed) ---
const chatStatus = {};

const setChatStatus = (channelName, status) => {
  chatStatus[channelName] = status;
};

const getChatStatus = (channelName) => {
  return chatStatus[channelName] || "open";
};

// --- Welcome embed tracking ---
const welcomeEmbeds = {};

const setWelcomeEmbed = (channelName, embed) => {
  welcomeEmbeds[channelName] = embed;
};

const getWelcomeEmbed = (channelName) => {
  return (
    welcomeEmbeds[channelName] || {
      title: "Support Ticket Opened",
      description: `Welcome! Please describe your issue below.\n\nWhen your issue is resolved, click Close Ticket to close this channel.`,
      color: "#5865f2",
    }
  );
};

// --- Embed-to-Chat mapping tracking ---
const activeChatsByEmbed = {};

const linkEmbedToChat = (embedMessageId, channelId) => {
  if (embedMessageId) {
    activeChatsByEmbed[embedMessageId] = channelId;
  }
};

const getChatByEmbed = (embedMessageId) => {
  return activeChatsByEmbed[embedMessageId] || null;
};

const unlinkEmbedByChat = (channelId) => {
  for (const key in activeChatsByEmbed) {
    if (activeChatsByEmbed[key] === channelId) {
      delete activeChatsByEmbed[key];
    }
  }
};

module.exports = {
  addMessage,
  getMessages,
  getAllChats,
  deleteChat,
  deleteMessage,
  setChatStatus,
  getChatStatus,
  setWelcomeEmbed,
  getWelcomeEmbed,
  linkEmbedToChat,
  getChatByEmbed,
  unlinkEmbedByChat,
};
