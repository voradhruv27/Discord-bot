const axios = require("axios");
const {
  addEmbed,
  getAllEmbeds,
  getEmbed,
  updateEmbedMessageId,
  deleteEmbed: deleteEmbedRecord,
} = require("../store/embedStore");
const { getChatStatus } = require("../store/chatStore");

const BOT_URL = process.env.BOT_SERVER_URL || "http://localhost:3001";

// Fetch all text channels from the bot (for the admin sidebar & channel selector)
const getChannels = async (req, res) => {
  try {
    const response = await axios.get(`${BOT_URL}/channels`);
    const botChannels = response.data.channels || [];

    // getChatStatus is now async, so we loop instead of .map()
    const channelsWithStatus = [];
    for (const channel of botChannels) {
      const status = channel.name.startsWith("chat-")
        ? await getChatStatus(channel.name)
        : null;
      channelsWithStatus.push({ ...channel, status });
    }

    res.json({ channels: channelsWithStatus });
  } catch (err) {
    console.error("Failed to fetch channels from bot:", err.message);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
};

// Create an embed and post it to a Discord channel
const createEmbed = async (req, res) => {
  const { channelId, title, description, color, channelName } = req.body;

  try {
    const response = await axios.post(`${BOT_URL}/post-embed`, {
      channelId,
      title,
      description,
      color,
    });

    const { messageId } = response.data;

    // Save the embed record in PostgreSQL
    const embed = await addEmbed(channelId, messageId, title, description, color, channelName);

    res.json({ status: "success", embed });
  } catch (err) {
    console.error("Failed to create embed:", err.message);
    res.status(500).json({ error: "Failed to create embed" });
  }
};

// Return all saved embeds
const getEmbeds = async (req, res) => {
  try {
    const embeds = await getAllEmbeds();
    res.json({ embeds });
  } catch (err) {
    console.error("Failed to get embeds:", err.message);
    res.status(500).json({ error: "Failed to get embeds" });
  }
};

// Delete an embed from Discord and remove the record
const deleteEmbedHandler = async (req, res) => {
  const { embedId } = req.params;

  const embed = await getEmbed(embedId);
  if (!embed) {
    return res.status(404).json({ error: "Embed not found" });
  }

  try {
    await axios.delete(`${BOT_URL}/delete-embed`, {
      data: { channelId: embed.channelId, messageId: embed.messageId },
    });
  } catch (err) {
    console.error("Failed to delete embed from Discord:", err.message);
  }

  // Remove the record from our store either way
  await deleteEmbedRecord(embedId);

  res.json({ status: "success" });
};

// Reposts an existing embed to Discord and updates its messageId
const repostEmbed = async (req, res) => {
  const { embedId } = req.params;

  const embed = await getEmbed(embedId);
  if (!embed) {
    return res.status(404).json({ error: "Embed not found" });
  }

  try {
    const response = await axios.post(`${BOT_URL}/post-embed`, {
      channelId: embed.channelId,
      title: embed.title,
      description: embed.description,
      color: embed.color,
    });

    const { messageId } = response.data;

    // Update the record with the new message ID
    await updateEmbedMessageId(embedId, messageId);

    // Retrieve and return the updated embed
    const updatedEmbed = await getEmbed(embedId);
    res.json({ status: "success", embed: updatedEmbed });
  } catch (err) {
    console.error("Failed to repost embed:", err.message);
    res.status(500).json({ error: "Failed to repost embed" });
  }
};

module.exports = {
  getChannels,
  createEmbed,
  getEmbeds,
  deleteEmbed: deleteEmbedHandler,
  repostEmbed,
};
