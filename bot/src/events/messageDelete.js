const { notifyMessageDeletedToBackend } = require("../services/backendService");

module.exports = {
  name: "messageDelete",
  once: false,
  async execute(message) {
    if (!message.channel.name || !message.channel.name.startsWith("chat-")) return;

    console.log(`[${message.channel.name}] Message deleted on Discord (ID: ${message.id}).`);
    await notifyMessageDeletedToBackend(message.channel.name, message.id);
  },
};
