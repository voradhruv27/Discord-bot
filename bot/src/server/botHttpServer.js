const express = require("express");
const {
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");


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

  // Returns ALL text channels in the guild (for admin embed channel selector)
  app.get("/channels", async (req, res) => {
    try {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      const channels = await guild.channels.fetch();
      const textChannels = [];

      channels.forEach((channel) => {
        if (!channel) return;
        if (channel.type === ChannelType.GuildText) {
          textChannels.push({
            id: channel.id,
            name: channel.name,
            parentName: channel.parent ? channel.parent.name : null,
          });
        }
      });

      res.json({ channels: textChannels });
    } catch (err) {
      console.error("Error fetching channels:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Creates and sends an embed with a "Start Chat" button to a channel
  app.post("/post-embed", async (req, res) => {
    const { channelId, title, description, color } = req.body;

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }

      // Build the embed from admin-provided fields
      const embed = new EmbedBuilder()
        .setTitle(title || "Support")
        .setDescription(description || "Click the button below to start a chat.")
        .setColor(color ? parseInt(color.replace("#", ""), 16) : 0x5865f2)
        .setTimestamp();

      // Attach a "Start Chat" button
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("start-chat")
          .setLabel("Start Chat")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("💬")
      );

      const sentMsg = await channel.send({
        embeds: [embed],
        components: [row],
      });

      res.json({
        status: "success",
        messageId: sentMsg.id,
        channelId: channel.id,
      });
    } catch (err) {
      console.error("Error posting embed:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Deletes an embed message from a channel
  app.delete("/delete-embed", async (req, res) => {
    const { channelId, messageId } = req.body;

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      await message.delete();
      res.json({ status: "success" });
    } catch (err) {
      console.error("Error deleting embed:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Bot HTTP server listening on port ${PORT}`);
  });
};

module.exports = { startBotHttpServer };