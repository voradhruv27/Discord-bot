// In-memory store for embed records.
// Each embed is stored by a unique ID so the admin panel can list, delete, or repost them.

const embeds = {};

let embedCounter = 0;

// Save a new embed record and return the generated ID
const addEmbed = (channelId, messageId, title, description, color, channelName) => {
  embedCounter += 1;
  const id = `embed-${embedCounter}`;

  embeds[id] = {
    embedId: id,
    id,
    channelId,
    channelName: channelName || `channel-${channelId}`,
    messageId,
    title,
    description,
    color,
    createdAt: new Date(),
  };

  return embeds[id];
};

// Get all embed records as an array
const getAllEmbeds = () => {
  return Object.values(embeds);
};

// Get a single embed by ID
const getEmbed = (embedId) => {
  return embeds[embedId] || null;
};

// Update the messageId of an existing embed (used when reposting)
const updateEmbedMessageId = (embedId, newMessageId) => {
  if (embeds[embedId]) {
    embeds[embedId].messageId = newMessageId;
  }
};

// Delete an embed record
const deleteEmbed = (embedId) => {
  delete embeds[embedId];
};

module.exports = {
  addEmbed,
  getAllEmbeds,
  getEmbed,
  updateEmbedMessageId,
  deleteEmbed,
};
