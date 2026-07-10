// PostgreSQL connection pool configuration.
// All store files import `pool` from here to run queries.

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Quick connection test — call once at server startup
const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log(
      "PostgreSQL connected successfully at:",
      result.rows[0].now,
    );
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
    process.exit(1); // Stop the server if DB is unreachable
  }
};

module.exports = { pool, testConnection };
