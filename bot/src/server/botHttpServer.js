const express = require("express");


const startBotHttpServer = (client) => {

  const PORT = process.env.PORT || 3001;

  const app = express();
  app.use(express.json());

  // Backend sends requests here to broadcast messages to Discord channels
  app.post("/send-to-discord", async (req, res) => {
    const { message, channelId } = req.body;

    try {
      const targetChannelId = channelId || process.env.CHANNEL_ID;

      console.log("Bot received command to send message to channel.");
      
      const channel = await client.channels.fetch(targetChannelId);
      if (!channel) {
        throw new Error("Channel not found.");
      }
      
      await channel.send(message);
      res.json({ status: "success", message: "Message sent successfully" });
    } catch (err) {
      console.error("Error sending message to Discord:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Bot HTTP server listening on port ${PORT}`);
  });
};

module.exports = { startBotHttpServer };
