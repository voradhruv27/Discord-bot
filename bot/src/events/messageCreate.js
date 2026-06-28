const { forwardMessageToBackend } = require("../services/backendService");

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if (message.author.bot) return; // Ignore messages from bots

    console.log(`Discord message received from ${message.author.username}: "${message.content}"`);
    await forwardMessageToBackend(message.author.username, message.content, message.channel.id);
  },
};
