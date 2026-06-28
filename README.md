# Discord Bot — Admin Panel

A modular Discord bot control system with a real-time Express backend API and a React + Vite + Tailwind CSS v4 Admin Dashboard. Monitor live Discord messages and send messages to your Discord channel directly from the web UI.

---

## Architecture Overview

- The **Bot** listens on Discord and forwards every incoming message to the Backend via HTTP.
- The **Backend** broadcasts received messages to all connected Admin UI clients over WebSocket.
- The **Admin UI** lets you view the live message feed and send messages back to Discord via the Backend → Bot.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Discord Bot | [Discord.js v14]|
| Bot HTTP Server | Express v5 |
| Backend API | Express v5, Node.js |
| WebSocket |
| HTTP Client | Axios |
| Admin UI | React 19, Vite 8 |
| UI Styling | Tailwind CSS v4 |
| Font | Inter (Google Fonts) |

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **Discord Application** with a Bot token — create one at [discord.dev/applications](https://discord.com/developers/applications)
- The bot must be invited to your server with the following permissions:
  - `Send Messages`
  - `Read Message History`
  - `View Channels`
- The bot must have the **Message Content** privileged intent enabled in the Discord Developer Portal.

---

## Environment Variables

Each service has its own `.env` file. Copy the `.env.example` file in each folder and fill in your values.

## Installation & Setup

Clone the repository and install dependencies for all three services:

```bash
# 1. Bot
cd bot
npm install

# 2. Backend
cd ../backend
npm install

# 3. Admin UI
cd ../admin-ui
npm install
```

Then configure the environment variables as described above.

---

## Running the Services

Open **three separate terminal windows** and run each service:

### Terminal 1 — Discord Bot

```bash
cd bot
node index.js
```

> Starts the Discord bot and an internal HTTP server on port `3001`.

### Terminal 2 — Backend API & WebSocket Server

```bash
cd backend
node index.js
```

> Starts the Express API and WebSocket server on port `5001`.

### Terminal 3 — Admin Dashboard UI

```bash
cd admin-ui
npm run dev
```

> Starts the Vite development server at **[http://localhost:5173](http://localhost:5173)**.

---

## API Reference

All API endpoints are served by the **Backend** on port `5001`.

## How It Works

1. **A user sends a message in Discord** → the Bot's `messageCreate` event fires.
2. The Bot calls `POST /api/receive` on the Backend with the message payload.
3. The Backend's `messageController` broadcasts the message to all connected Admin UI WebSocket clients as a `new_message` event.
4. The **Admin UI's `MessageLog`** component receives the event and renders it in the live feed instantly.
5. **To send a message** from the Admin UI, the `MessageInput` component calls `POST /api/send` on the Backend.
6. The Backend calls the Bot's internal HTTP server (`http://localhost:3001`), which uses the Discord.js client to send the message to the configured channel.