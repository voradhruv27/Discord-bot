// Run this script ONCE to register slash commands with Discord.
// Usage: node src/commands/registerCommands.js

require("dotenv").config();
const { REST, Routes } = require("discord.js");
const newChatCommand = require("./newChat");

// Collect all command definitions into an array
const commands = [newChatCommand.data.toJSON()];

// Create a REST client to talk to Discord's API
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

const registerCommands = async () => {
  try {
    console.log("Registering slash commands...");

    // Register commands for your specific server (guild)
    // Guild commands update instantly (global commands take up to 1 hour)
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID, // Your bot's application ID
        process.env.GUILD_ID, // Your Discord server ID
      ),
      { body: commands },
    );

    console.log("Slash commands registered successfully!");
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
};

registerCommands();