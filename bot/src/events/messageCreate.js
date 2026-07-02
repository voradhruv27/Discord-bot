const { forwardMessageToBackend } = require("../services/backendService");

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    // Check if it's an admin message sent from the Admin UI via the bot client
    const isOwnAdmin = message.author.id === message.client.user.id && 
                      message.embeds.length === 0 && 
                      !(message.content && message.content.startsWith("Your chat has been created:")) &&
                      !(message.content && message.content.startsWith("This ticket has been closed by"));

    if (isOwnAdmin) {
      // Ignore admin text replies from the bot because the Admin UI already appends them locally
      return;
    }

    let author = message.author.username;
    let content = message.content || "";

    // If it's a message from the bot itself (system notice or embed card)
    if (message.author.id === message.client.user.id) {
      author = "System";
      if (!content && message.embeds.length > 0) {
        const emb = message.embeds[0];
        content = `${emb.title ? `**${emb.title}**\n` : ""}${emb.description || ""}`;
      }
    } else if (message.author.bot) {
      // If it's another bot (not ours), we can still display it
      if (!content && message.embeds.length > 0) {
        const emb = message.embeds[0];
        content = `${emb.title ? `**${emb.title}**\n` : ""}${emb.description || ""}`;
      }
    }

    let embed = null;
    if (message.embeds.length > 0) {
      embed = {
        title: message.embeds[0].title,
        description: message.embeds[0].description,
        color: message.embeds[0].hexColor || "#5865f2"
      };
    }

    console.log(
      `[${message.channel.name}] ${author}: "${content}"`
    );

    await forwardMessageToBackend(
      author,
      content,
      message.channel.id,
      message.channel.name,
      message.id,
      embed
    );
  },
};
