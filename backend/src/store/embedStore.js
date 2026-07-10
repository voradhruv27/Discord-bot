// PostgreSQL-backed embed store.

const { pool } = require("../config/db");

// ──────────────────────────────────────────────
// TABLE INITIALIZATION
// ──────────────────────────────────────────────

const initTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS embeds (
        id            SERIAL PRIMARY KEY,
        embed_id      VARCHAR(255) UNIQUE NOT NULL,
        channel_id    VARCHAR(255) NOT NULL,
        channel_name  VARCHAR(255),
        message_id    VARCHAR(255),
        title         VARCHAR(255),
        description   TEXT,
        color         VARCHAR(50),
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("Embed store tables initialized");
  } catch (err) {
    console.error("Failed to initialize embed store tables:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────
// EMBED FUNCTIONS
// ──────────────────────────────────────────────

// Save a new embed record and return it
const addEmbed = async (channelId, messageId, title, description, color, channelName) => {
  try {
    // Use the SERIAL id to generate a consistent embed_id string
    const result = await pool.query(
      `INSERT INTO embeds (embed_id, channel_id, channel_name, message_id, title, description, color)
       VALUES ('embed-' || nextval('embeds_id_seq'), $1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        channelId,
        channelName || `channel-${channelId}`,
        messageId,
        title,
        description,
        color,
      ],
    );

    const row = result.rows[0];
    return mapRowToEmbed(row);
  } catch (err) {
    console.error("Failed to add embed:", err.message);
    throw err;
  }
};

// Get all embed records as an array
const getAllEmbeds = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM embeds ORDER BY created_at ASC`,
    );
    return result.rows.map(mapRowToEmbed);
  } catch (err) {
    console.error("Failed to get all embeds:", err.message);
    return [];
  }
};

// Get a single embed by embed_id (e.g. "embed-3")
const getEmbed = async (embedId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM embeds WHERE embed_id = $1`,
      [embedId],
    );
    return result.rows.length > 0 ? mapRowToEmbed(result.rows[0]) : null;
  } catch (err) {
    console.error("Failed to get embed:", err.message);
    return null;
  }
};

// Update the messageId of an existing embed (used when reposting)
const updateEmbedMessageId = async (embedId, newMessageId) => {
  try {
    await pool.query(
      `UPDATE embeds SET message_id = $1 WHERE embed_id = $2`,
      [newMessageId, embedId],
    );
  } catch (err) {
    console.error("Failed to update embed message ID:", err.message);
    throw err;
  }
};

// Delete an embed record
const deleteEmbed = async (embedId) => {
  try {
    await pool.query(`DELETE FROM embeds WHERE embed_id = $1`, [embedId]);
  } catch (err) {
    console.error("Failed to delete embed:", err.message);
    throw err;
  }
};

// ──────────────────────────────────────────────
// HELPER — map DB row to camelCase object
// ──────────────────────────────────────────────

const mapRowToEmbed = (row) => ({
  embedId: row.embed_id,
  id: row.embed_id,
  channelId: row.channel_id,
  channelName: row.channel_name,
  messageId: row.message_id,
  title: row.title,
  description: row.description,
  color: row.color,
  createdAt: row.created_at,
});

module.exports = {
  initTables,
  addEmbed,
  getAllEmbeds,
  getEmbed,
  updateEmbedMessageId,
  deleteEmbed,
};
