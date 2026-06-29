const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const { notifyChannelCreatedToBackend } = require("../services/backendService");

let chatCounter = 0;

module.exports = {
  // --- 1. COMMAND DEFINITION ---
  // This tells Discord what the command looks like (name, description)
  data: new SlashCommandBuilder()
    .setName("new-chat")
    .setDescription("Start a new support chat"),

  // --- 2. COMMAND HANDLER ---
  // This runs when a user actually uses the command
  async execute(interaction) {

    chatCounter += 1;
    const channelName = `chat-${chatCounter}`;

    try {
      // Grab the server (guild) where the command was used
      const guild = interaction.guild;

      // Create a new text channel inside the support category
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: process.env.CATEGORY_ID, // puts it under your "Support" category
        topic: `Support chat started by ${interaction.user.username}`,
      });

      // Notify the backend that a new support channel has been created
      await notifyChannelCreatedToBackend(channelName, channel.id);

      // Reply to the user (only they can see this message)
      await interaction.reply({
        content: `Your chat has been created: ${channel}`,
        flags: 64, // ephemeral — only the user sees this reply
      });
    } catch (err) {
      console.error("Failed to create chat channel:", err.message);
      await interaction.reply({
        content: "Failed to create chat. Please try again.",
        flags: 64,
      });
    }
  },
};
