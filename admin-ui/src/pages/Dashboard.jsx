import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import MessageLog from "../components/MessageLog";
import ChatSidebar from "../components/ChatSidebar";
import { fetchChats } from "../api/chatApi";
import useSocket from "../hooks/useSocket";

export default function Dashboard() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the list of chats from the backend on first load
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const chatList = await fetchChats();
        setChats(chatList);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadChats();
  }, []);

  // Listen for real-time events via WebSocket.
  const handleSocketEvent = useCallback((event) => {
    if (event.type === "new_message") {
      const payload = event.payload;
      setChats((prev) => {
        const exists = prev.some((chat) => chat.name === payload.channelName);
        if (!exists) {
          return [...prev, { name: payload.channelName, id: payload.channelId }];
        }
        return prev;
      });
    } else if (event.type === "channel_created") {
      const payload = event.payload; // { name, id }
      setChats((prev) => {
        const exists = prev.some((chat) => chat.name === payload.name);
        if (!exists) {
          return [...prev, { name: payload.name, id: payload.id }];
        }
        return prev;
      });
    } else if (event.type === "channel_deleted") {
      const payload = event.payload; // { name, id }
      setChats((prev) => prev.filter((chat) => chat.name !== payload.name));
      setSelectedChat((prev) => {
        if (prev && prev.name === payload.name) {
          return null;
        }
        return prev;
      });
    }
  }, []);

  useSocket(handleSocketEvent);

  return (
    <div className="min-h-screen bg-surface-950 text-white flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden p-6 md:p-8 gap-6">
        {/* Sidebar — list of all chats */}
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          isLoading={isLoading}
        />

        {/* Main chat area */}
        <main className="flex-1 flex flex-col">
          {selectedChat ? (
            <MessageLog selectedChat={selectedChat} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-surface-900 border border-white/[0.08] rounded-2xl p-6 h-[600px]">
              <span className="text-4xl mb-3">👈</span>
              <p className="text-sm font-medium text-slate-500">
                Select a chat from the sidebar
              </p>
              <p className="text-xs text-slate-600 mt-1.5">
                Active support chats will appear on the left.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
