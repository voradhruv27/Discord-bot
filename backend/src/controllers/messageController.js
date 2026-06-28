const { sendMessageToBot } = require("../services/botService");
const { broadcast } = require("../services/websocketService");

const receiveMessage = (req, res) => {
  const { author, content, channelId } = req.body;
  console.log(`Received from Discord (${author}): "${content}"`);

  // Broadcast to all UI clients via WebSocket
  broadcast({
    type: "new_message",
    payload: {
      author,
      content,
      channelId,
      timestamp: new Date(),
    },
  });

  res.json({ status: "received", message: content });
};


// Sends a message to a Discord channel by calling the bot HTTP server.
 
const sendMessage = async (req, res, next) => {
  const { message, channelId } = req.body;

  try {
    await sendMessageToBot(message, channelId);
    res.json({ status: "sent", message });
  } catch (err) {
    next(err);
  }
};

module.exports = { receiveMessage, sendMessage };
