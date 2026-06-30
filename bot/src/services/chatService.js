const {
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { notifyChannelCreatedToBackend } = require("./backendService");

let chatCounter = 0;

const createChat = async (guild, user) => {
  chatCounter += 1;
  const channelName = `chat-${chatCounter}`;

  // Create a new text channel under the support category
  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: process.env.CATEGORY_ID, // puts it under your "Support" category
    topic: `Support chat started by ${user.username}`,
  });

  // Build the welcome embed that appears inside the new channel
  const welcomeEmbed = new EmbedBuilder()
    .setTitle("Support Ticket Opened")
    .setDescription(
      `Welcome, ${user.username}!\n\n` +
        "Please describe your issue below.\n\n" +
        "When your issue is resolved, click **Close Ticket** to close this channel."
    )
    .setColor(0x5865f2) // Discord blurple
    .setTimestamp();

  // Build the "Close Ticket" button
  const closeButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close-ticket") // we read this ID in interactionCreate.js
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Danger) // red button
      .setEmoji("🔒")
  );

  // Send the welcome embed + button into the new channel
  await channel.send({
    embeds: [welcomeEmbed],
    components: [closeButton],
  });

  // Notify the backend that a new channel was created
  await notifyChannelCreatedToBackend(channelName, channel.id);

  return channel;
};

module.exports = { createChat };
