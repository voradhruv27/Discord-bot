const { SlashCommandBuilder } = require("discord.js");
const { createChat } = require("../services/chatService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("new-chat")
    .setDescription("Start a new support chat"),

  async execute(interaction) {
    try {
      // createChat handles: channel creation, welcome embed, backend notification
      const channel = await createChat(interaction.guild, interaction.user);

      // Reply to the user (only they can see this)
      await interaction.reply({
        content: `Your chat has been created: ${channel}`,
        flags: 64, // ephemeral
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
