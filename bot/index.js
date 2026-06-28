require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { startBotHttpServer } = require("./src/server/botHttpServer");

// Import events
const readyEvent = require("./src/events/ready");
const messageCreateEvent = require("./src/events/messageCreate");

// Initialize Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Register events
const registerEvent = (event) => {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
};

registerEvent(readyEvent);
registerEvent(messageCreateEvent);

// Start internal HTTP Server
startBotHttpServer(client);

// Log in to Discord
client.login(process.env.BOT_TOKEN);
