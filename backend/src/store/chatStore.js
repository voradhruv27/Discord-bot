// PostgreSQL-backed chat store.
// Replaces the old in-memory chatStore with persistent pg queries.

const { pool } = require("../config/db");

// ──────────────────────────────────────────────
// TABLE INITIALIZATION
// ──────────────────────────────────────────────

const initTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id            SERIAL PRIMARY KEY,
        channel_name  VARCHAR(255) NOT NULL,
        author        VARCHAR(255) NOT NULL,
        content       TEXT,
        channel_id    VARCHAR(255),
        message_id    VARCHAR(255) UNIQUE,
        embed         JSONB,
        timestamp     TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_status (
        channel_name  VARCHAR(255) PRIMARY KEY,
        status        VARCHAR(50) DEFAULT 'open'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS welcome_embeds (
        channel_name  VARCHAR(255) PRIMARY KEY,
        title         VARCHAR(255),
        description   TEXT,
        color         VARCHAR(50)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS embed_chat_links (
        embed_message_id  VARCHAR(255) PRIMARY KEY,
        channel_id        VARCHAR(255) NOT NULL
      );
    `);

    console.log("Chat store tables initialized");
  } catch (err) {
    console.error("Failed to initialize chat store tables:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────
// MESSAGE FUNCTIONS
// ──────────────────────────────────────────────

// Add a message to a chat channel.
// Uses ON CONFLICT to prevent duplicate messages.
const addMessage = async (channelName, message) => {
  try {
    await pool.query(
      `INSERT INTO messages (channel_name, author, content, channel_id, message_id, embed, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (message_id) DO NOTHING`,
      [
        channelName,
        message.author,
        message.content,
        message.channelId,
        message.messageId,
        message.embed ? JSON.stringify(message.embed) : null,
        message.timestamp || new Date(),
      ],
    );
  } catch (err) {
    console.error("Failed to add message:", err.message);
    throw err;
  }
};

// Get all messages for a specific chat channel.
const getMessages = async (channelName) => {
  try {
    const result = await pool.query(
      `SELECT * FROM messages WHERE channel_name = $1 ORDER BY timestamp ASC`,
      [channelName],
    );
    // Map DB column names back to camelCase for the rest of the app
    return result.rows.map((row) => ({
      author: row.author,
      content: row.content,
      channelId: row.channel_id,
      channelName: row.channel_name,
      messageId: row.message_id,
      embed: row.embed,
      timestamp: row.timestamp,
    }));
  } catch (err) {
    console.error("Failed to get messages:", err.message);
    return [];
  }
};

// Get a list of all active chat channel names.
const getAllChats = async () => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT channel_name FROM messages ORDER BY channel_name`,
    );
    return result.rows.map((row) => row.channel_name);
  } catch (err) {
    console.error("Failed to get all chats:", err.message);
    return [];
  }
};

// Delete an entire chat channel and all its messages.
const deleteChat = async (channelName) => {
  try {
    await pool.query(`DELETE FROM messages WHERE channel_name = $1`, [
      channelName,
    ]);
    await pool.query(`DELETE FROM chat_status WHERE channel_name = $1`, [
      channelName,
    ]);
    await pool.query(`DELETE FROM welcome_embeds WHERE channel_name = $1`, [
      channelName,
    ]);
  } catch (err) {
    console.error("Failed to delete chat:", err.message);
    throw err;
  }
};

// Delete a specific message from a chat channel.
const deleteMessage = async (channelName, messageId) => {
  try {
    await pool.query(
      `DELETE FROM messages WHERE channel_name = $1 AND message_id = $2`,
      [channelName, messageId],
    );
  } catch (err) {
    console.error("Failed to delete message:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────
// CHAT STATUS FUNCTIONS
// ──────────────────────────────────────────────

const setChatStatus = async (channelName, status) => {
  try {
    await pool.query(
      `INSERT INTO chat_status (channel_name, status)
       VALUES ($1, $2)
       ON CONFLICT (channel_name) DO UPDATE SET status = $2`,
      [channelName, status],
    );
  } catch (err) {
    console.error("Failed to set chat status:", err.message);
    throw err;
  }
};

const getChatStatus = async (channelName) => {
  try {
    const result = await pool.query(
      `SELECT status FROM chat_status WHERE channel_name = $1`,
      [channelName],
    );
    return result.rows.length > 0 ? result.rows[0].status : "open";
  } catch (err) {
    console.error("Failed to get chat status:", err.message);
    return "open";
  }
};

// ──────────────────────────────────────────────
// WELCOME EMBED FUNCTIONS
// ──────────────────────────────────────────────

const setWelcomeEmbed = async (channelName, embed) => {
  try {
    await pool.query(
      `INSERT INTO welcome_embeds (channel_name, title, description, color)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (channel_name) DO UPDATE SET title = $2, description = $3, color = $4`,
      [channelName, embed.title, embed.description, embed.color],
    );
  } catch (err) {
    console.error("Failed to set welcome embed:", err.message);
    throw err;
  }
};

const getWelcomeEmbed = async (channelName) => {
  try {
    const result = await pool.query(
      `SELECT title, description, color FROM welcome_embeds WHERE channel_name = $1`,
      [channelName],
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    // Return the default embed if nothing is stored
    return {
      title: "Support Ticket Opened",
      description:
        "Welcome! Please describe your issue below.\n\nWhen your issue is resolved, click Close Ticket to close this channel.",
      color: "#5865f2",
    };
  } catch (err) {
    console.error("Failed to get welcome embed:", err.message);
    return {
      title: "Support Ticket Opened",
      description:
        "Welcome! Please describe your issue below.\n\nWhen your issue is resolved, click Close Ticket to close this channel.",
      color: "#5865f2",
    };
  }
};

// ──────────────────────────────────────────────
// EMBED-TO-CHAT LINK FUNCTIONS
// ──────────────────────────────────────────────

const linkEmbedToChat = async (embedMessageId, channelId) => {
  try {
    if (!embedMessageId) return;
    await pool.query(
      `INSERT INTO embed_chat_links (embed_message_id, channel_id)
       VALUES ($1, $2)
       ON CONFLICT (embed_message_id) DO UPDATE SET channel_id = $2`,
      [embedMessageId, channelId],
    );
  } catch (err) {
    console.error("Failed to link embed to chat:", err.message);
    throw err;
  }
};

const getChatByEmbed = async (embedMessageId) => {
  try {
    const result = await pool.query(
      `SELECT channel_id FROM embed_chat_links WHERE embed_message_id = $1`,
      [embedMessageId],
    );
    return result.rows.length > 0 ? result.rows[0].channel_id : null;
  } catch (err) {
    console.error("Failed to get chat by embed:", err.message);
    return null;
  }
};

const unlinkEmbedByChat = async (channelId) => {
  try {
    await pool.query(
      `DELETE FROM embed_chat_links WHERE channel_id = $1`,
      [channelId],
    );
  } catch (err) {
    console.error("Failed to unlink embed by chat:", err.message);
    throw err;
  }
};

module.exports = {
  initTables,
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
