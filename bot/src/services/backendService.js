const axios = require("axios");

const forwardMessageToBackend = async (
  author,
  content,
  channelId,
  channelName,
  messageId,
  embed,
) => {
  try {
    await axios.post(`${process.env.BACKEND_URL}/api/receive`, {
      author,
      content,
      channelId,
      channelName,
      messageId,
      embed,
    });
  } catch (err) {
    console.error("Failed to forward message to backend:", err.message);
  }
};

const notifyChannelCreatedToBackend = async (channelName, channelId, welcomeEmbed, embedMessageId) => {
  try {
    await axios.post(`${process.env.BACKEND_URL}/api/admin/channels/created`, {
      channelName,
      channelId,
      welcomeEmbed,
      embedMessageId,
    });
  } catch (err) {
    console.error("Failed to notify backend of channel creation:", err.message);
  }
};

const notifyChannelDeletedToBackend = async (channelName, channelId) => {
  try {
    await axios.post(`${process.env.BACKEND_URL}/api/admin/channels/deleted`, {
      channelName,
      channelId,
    });
  } catch (err) {
    console.error("Failed to notify backend of channel deletion:", err.message);
  }
};

const notifyMessageDeletedToBackend = async (channelName, messageId) => {
  try {
    await axios.post(`${process.env.BACKEND_URL}/api/admin/messages/deleted`, {
      channelName,
      messageId,
    });
  } catch (err) {
    console.error("Failed to notify backend of message deletion:", err.message);
  }
};

const notifyChatClosedToBackend = async (channelId) => {
  try {
    await axios.patch(
      `${process.env.BACKEND_URL}/api/admin/chats/${channelId}/close`,
      { source: "discord" }
    );
  } catch (err) {
    console.error("Failed to notify backend of chat closure:", err.message);
  }
};

module.exports = {
  forwardMessageToBackend,
  notifyChannelCreatedToBackend,
  notifyChannelDeletedToBackend,
  notifyMessageDeletedToBackend,
  notifyChatClosedToBackend,
};
