const { sendMessageToBot } = require("../services/botService");
const { broadcast } = require("../services/websocketService");
const { addMessage } = require("../services/chatStore");

const receiveMessage = (req, res) => {
  const { author, content, channelId, channelName, messageId } = req.body;
  console.log(`[${channelName}] Received from Discord (${author}): "${content}"`);
  
  // Build a message object
  const message = {
    author,
    content,
    channelId,
    channelName,
    messageId,
    timestamp: new Date(),
  };

  // Store in our chat store
  addMessage(channelName, message);

  // Broadcast to all UI clients via WebSocket
  broadcast({
    type: "new_message",
    payload: message,
  });

  res.json({ status: "received", message: content });
};


// Sends a message to a Discord channel by calling the bot HTTP server.
 
const sendMessage = async (req, res, next) => {
  const { message, channelId, channelName } = req.body;

  try {
    const result = await sendMessageToBot(message, channelId);
    const messageId = result.messageId || null;

    // Persist Admin message in-memory so it is saved in chat history
    if (channelName) {
      addMessage(channelName, {
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
