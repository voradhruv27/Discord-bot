const axios = require("axios");

const forwardMessageToBackend = async (author, content, channelId) => {
  try {
    await axios.post(`${process.env.BACKEND_URL}/api/receive`, {
      author,
      content,
      channelId,
    });
  } catch (err) {
    console.error("Failed to forward message to backend:", err.message);
  }
};

module.exports = { forwardMessageToBackend };
