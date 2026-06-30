require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { initWebSocketServer } = require("./src/services/websocketService");
const messageRoutes = require("./src/routes/messageRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const embedRoutes = require("./src/routes/embedRoutes");
const errorHandler = require("./src/middlewares/errorHandler");

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
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
