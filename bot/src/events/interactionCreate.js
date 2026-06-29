const newChatCommand = require("../commands/newChat");

// Store commands in a Map for easy lookup by name
const commands = new Map();
commands.set(newChatCommand.data.name, newChatCommand);

module.exports = {
  name: "interactionCreate",
  once: false, // listen for EVERY interaction, not just the first one

  async execute(interaction) {
    // Only handle slash commands, ignore buttons/menus/etc.
    if (!interaction.isChatInputCommand()) return;

    // Find the matching command handler by name
    const command = commands.get(interaction.commandName);

    // If no handler found, ignore it
    if (!command) {
      console.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }

    // Run the command handler
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Error executing /${interaction.commandName}:`, err);
      // If we haven't replied yet, send an error message
      const reply = { content: "Something went wrong!", flags: 64 };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};
