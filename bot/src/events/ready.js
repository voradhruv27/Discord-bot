module.exports = {
  name: "clientReady",
  once: true,
  execute(client) {
    console.log(`Discord Bot is online as ${client.user.tag}`);
  },
};
