require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { initWebSocketServer } = require("./src/services/websocketService");
const messageRoutes = require("./src/routes/messageRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const embedRoutes = require("./src/routes/embedRoutes");
const errorHandler = require("./src/middlewares/errorHandler");
const { testConnection } = require("./src/config/db");
const { initTables: initChatTables } = require("./src/store/chatStore");
const { initTables: initEmbedTables } = require("./src/store/embedStore");

const PORT = process.env.PORT || 5001;


// --- 1. CONFIG & HTTP SERVER SETUP ---
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// --- 2. WEBSOCKET SERVER SETUP ---
initWebSocketServer(server)

// --- 3. ROUTE REGISTRATIONS ---
app.use("/api", messageRoutes);
app.use("/api", embedRoutes);
app.use("/api/admin", adminRoutes);

// --- 4. GLOBAL ERROR HANDLER ---
app.use(errorHandler);

// --- 5. START SERVER ---
const startServer = async () => {
  try {
    // Test PostgreSQL connection
    await testConnection();

    // Create tables if they don't exist
    await initChatTables();
    await initEmbedTables();

    server.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
