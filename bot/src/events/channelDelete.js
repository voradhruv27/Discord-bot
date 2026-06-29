const { notifyChannelDeletedToBackend } = require("../services/backendService");

module.exports = {
  name: "channelDelete",
  once: false,
  async execute(channel) {
    if (!channel.name || !channel.name.startsWith("chat-")) return;

    console.log(`[${channel.name}] Channel was deleted on Discord.`);
    await notifyChannelDeletedToBackend(channel.name, channel.id);
  },
};
