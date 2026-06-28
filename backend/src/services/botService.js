const axios = require("axios");

const sendMessageToBot = async (message, channelId) => {
  return axios.post(`${process.env.BOT_SERVER_URL}/send-to-discord`, {
    message,
    channelId,
  });
};

module.exports = { sendMessageToBot };
