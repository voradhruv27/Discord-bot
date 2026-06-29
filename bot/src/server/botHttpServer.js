const express = require("express");
const { ChannelType } = require("discord.js");


const startBotHttpServer = (client) => {

  const PORT = process.env.PORT || 3001;

  const app = express();
  app.use(express.json());

  app.get("/active-chats", async (req, res) => {
    try {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      const channels = await guild.channels.fetch();
      const activeChats = [];

      channels.forEach((channel) => {
        if (!channel) return;
        const isSupportCategory =
          channel.parentId === process.env.CATEGORY_ID ||
          (channel.parent && channel.parent.id === process.env.CATEGORY_ID);
        if (
          channel.type === ChannelType.GuildText &&
          channel.name.startsWith("chat-") &&
          isSupportCategory
        ) {
          activeChats.push({
            name: channel.name,
            id: channel.id,
          });
        }
      });

      res.json({ chats: activeChats });
    } catch (err) {
      console.error("Error fetching active chats from Discord:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

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
      
      const sentMsg = await channel.send(message);
      res.json({ status: "success", message: "Message sent successfully", messageId: sentMsg.id });
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
