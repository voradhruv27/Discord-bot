const { forwardMessageToBackend } = require("../services/backendService");

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if (message.author.bot) return; // Ignore messages from bots

    if (!message.channel.name.startsWith("chat-")) return; //Only forward messages from chat channels (chat-1, chat-2, etc.)

    console.log(
      `[${message.channel.name}] ${message.author.username}: "${message.content}"`,
    );
    await forwardMessageToBackend(
      message.author.username,
      message.content,
      message.channel.id,
      message.channel.name,
      message.id
    );
  },
};
