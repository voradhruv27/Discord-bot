const { PermissionFlagsBits } = require("discord.js");
const newChatCommand = require("../commands/newChat");
const { createChat } = require("../services/chatService");
const { notifyChatClosedToBackend } = require("../services/backendService");

// Store commands in a Map for easy lookup by name
const commands = new Map();
commands.set(newChatCommand.data.name, newChatCommand);

module.exports = {
  name: "interactionCreate",
  once: false,

  async execute(interaction) {
    // --- SLASH COMMANDS ---
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) {
        console.warn(`Unknown command: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`Error executing /${interaction.commandName}:`, err);
        const reply = { content: "Something went wrong!", flags: 64 };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    // --- BUTTON CLICKS ---
    if (interaction.isButton()) {
      const { customId } = interaction;

      // "Start Chat" button on the admin-posted embed
      if (customId === "start-chat") {
        try {
          await interaction.deferReply({ flags: 64 }); // ephemeral, gives us time
          const channel = await createChat(interaction.guild, interaction.user);
          await interaction.editReply({
            content: `Your chat has been created: ${channel}`,
          });
        } catch (err) {
          console.error("Error handling start-chat button:", err);
          await interaction.editReply({
            content: "Failed to create chat. Please try again.",
          });
        }
        return;
      }

      // "Close Ticket" button inside a chat channel
      if (customId === "close-ticket") {
        try {
          await interaction.deferReply(); // visible to everyone in the channel

          const channel = interaction.channel;

          // Set @everyone's permissions to read-only (deny SendMessages, allow ViewChannel + ReadMessageHistory)
          await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            [PermissionFlagsBits.SendMessages]: false,
            [PermissionFlagsBits.ViewChannel]: true,
            [PermissionFlagsBits.ReadMessageHistory]: true,
          });

          // Notify the backend so admin panel can show "closed" status
          await notifyChatClosedToBackend(channel.id);

          await interaction.editReply({
            content: `This ticket has been closed by ${interaction.user.username}. The channel is now read-only.`,
          });
        } catch (err) {
          console.error("Error handling close-ticket button:", err);
          await interaction.editReply({
            content: "Failed to close ticket. Please try again.",
          });
        }
        return;
      }
    }
  },
};

