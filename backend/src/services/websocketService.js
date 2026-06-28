const WebSocket = require("ws");

let wss = null;

const initWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Web UI client connected via WebSocket");

    ws.on("close", () => {
      console.log("Web UI client disconnected");
    });
  });
};

const broadcast = (data) => {
  if (!wss) return;
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

module.exports = { initWebSocketServer, broadcast };
