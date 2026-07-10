const { sendMessageToBot } = require("../services/botService");
const { broadcast } = require("../services/websocketService");
const { addMessage } = require("../store/chatStore");

const receiveMessage = async (req, res) => {
  const { author, content, channelId, channelName, messageId, embed } = req.body;
  console.log(`[${channelName}] Received from Discord (${author}): "${content}"`);

  try {
    // Build a message object
    const message = {
      author,
      content,
      channelId,
      channelName,
      messageId,
      timestamp: new Date(),
      embed,
    };

    // Store in PostgreSQL
    await addMessage(channelName, message);

    // Broadcast to all UI clients via WebSocket
    broadcast({
      type: "new_message",
      payload: message,
    });

    res.json({ status: "received", message: content });
  } catch (err) {
    console.error("Failed to receive message:", err.message);
    res.status(500).json({ error: "Failed to store message" });
  }
};

// Sends a message to a Discord channel by calling the bot HTTP server.

const sendMessage = async (req, res, next) => {
  const { message, channelId, channelName } = req.body;

  try {
    const result = await sendMessageToBot(message, channelId);
    const messageId = result.messageId || null;

    // Persist Admin message in PostgreSQL
    if (channelName) {
      await addMessage(channelName, {
        author: "Admin",
        content: message,
        channelId,
        channelName,
        messageId,
        timestamp: new Date(),
      });
    }

    res.json({ status: "sent", message, messageId });
  } catch (err) {
    next(err);
  }
};

module.exports = { receiveMessage, sendMessage };
