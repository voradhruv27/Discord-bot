const axios = require("axios");
const {
  addEmbed,
  getAllEmbeds,
  getEmbed,
  deleteEmbed: deleteEmbedRecord,
} = require("../services/embedStore");

const BOT_URL = process.env.BOT_SERVER_URL || "http://localhost:3001";

// Fetch all text channels from the bot (for the admin channel dropdown)
const getChannels = async (req, res) => {
  try {
    const response = await axios.get(`${BOT_URL}/channels`);
    res.json({ channels: response.data.channels });
  } catch (err) {
    console.error("Failed to fetch channels from bot:", err.message);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
};

// Create an embed and post it to a Discord channel
const createEmbed = async (req, res) => {
  const { channelId, title, description, color } = req.body;

  try {
    const response = await axios.post(`${BOT_URL}/post-embed`, {
      channelId,
      title,
      description,
      color,
    });

    const { messageId } = response.data;

    // Save the embed record in our in-memory store
    const embed = addEmbed(channelId, messageId, title, description, color);

    res.json({ status: "success", embed });
  } catch (err) {
    console.error("Failed to create embed:", err.message);
    res.status(500).json({ error: "Failed to create embed" });
  }
};

// Return all saved embeds
const getEmbeds = (req, res) => {
  const embeds = getAllEmbeds();
  res.json({ embeds });
};

// Delete an embed from Discord and remove the record
const deleteEmbedHandler = async (req, res) => {
  const { embedId } = req.params;

  const embed = getEmbed(embedId);
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
  deleteEmbedRecord(embedId);

  res.json({ status: "success" });
};

module.exports = {
  getChannels,
  createEmbed,
  getEmbeds,
  deleteEmbed: deleteEmbedHandler,
};
