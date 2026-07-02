const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
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
          // Disable the button immediately to prevent double clicks while processing
          const originalComponents = interaction.message.components;
          const disabledComponents = originalComponents.map(row => {
            const newRow = ActionRowBuilder.from(row);
            newRow.components.forEach(comp => {
              if (comp.data.custom_id === "start-chat") {
                comp.setDisabled(true);
              }
            });
            return newRow;
          });

          await interaction.update({ components: disabledComponents });

          const channel = await createChat(interaction.guild, interaction.user, interaction.message.id);

          // Create the "Visit Chat" link button
          const visitButtonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Visit Chat")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
              .setEmoji("💬")
          );

          // Edit the original message to display the Visit Chat link button instead of Start Chat
          await interaction.message.edit({ components: [visitButtonRow] });

          await interaction.followUp({
            content: `Your chat has been created! [Visit Chat](https://discord.com/channels/${interaction.guild.id}/${channel.id})`,
            flags: 64,
          });
        } catch (err) {
          console.error("Error handling start-chat button:", err);

          // Re-enable the button on error so they can try again
          try {
            const originalComponents = interaction.message.components;
            const enabledComponents = originalComponents.map(row => {
              const newRow = ActionRowBuilder.from(row);
              newRow.components.forEach(comp => {
                if (comp.data.custom_id === "start-chat") {
                  comp.setDisabled(false);
                }
              });
              return newRow;
            });
            await interaction.message.edit({ components: enabledComponents });
          } catch (editErr) {
            console.error("Failed to re-enable button on error:", editErr.message);
          }

          await interaction.followUp({
            content: "Failed to create chat. Please try again.",
            flags: 64,
          });
        }
        return;
      }

      // "Close Ticket" button inside a chat channel
      if (customId === "close-ticket") {
        try {
          // Disable the button immediately to prevent double clicks while processing
          const originalComponents = interaction.message.components;
          const disabledComponents = originalComponents.map(row => {
            const newRow = ActionRowBuilder.from(row);
            newRow.components.forEach(comp => {
              if (comp.data.custom_id === "close-ticket") {
                comp.setDisabled(true);
              }
            });
            return newRow;
          });

          // Acknowledge interaction by updating components
          await interaction.update({ components: disabledComponents });

          const channel = interaction.channel;

          // Set @everyone's permissions to read-only
          await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            [PermissionFlagsBits.SendMessages]: false,
            [PermissionFlagsBits.ViewChannel]: true,
            [PermissionFlagsBits.ReadMessageHistory]: true,
          });

          // Notify the backend so admin panel can show "closed" status
          await notifyChatClosedToBackend(channel.id);

          await channel.send({
            content: `This ticket has been closed by ${interaction.user.username}. The channel is now read-only.`,
          });
        } catch (err) {
          console.error("Error handling close-ticket button:", err);
          
          // Re-enable the button if it fails so they can retry
          try {
            const originalComponents = interaction.message.components;
            const enabledComponents = originalComponents.map(row => {
              const newRow = ActionRowBuilder.from(row);
              newRow.components.forEach(comp => {
                if (comp.data.custom_id === "close-ticket") {
                  comp.setDisabled(false);
                }
              });
              return newRow;
            });
            await interaction.message.edit({ components: enabledComponents });
          } catch (editErr) {
            console.error("Failed to re-enable button on error:", editErr.message);
          }

          const channel = interaction.channel;
          await channel.send({
            content: `Failed to close ticket: ${err.message}. Please try again.`,
          });
        }
        return;
      }
    }
  },
};

