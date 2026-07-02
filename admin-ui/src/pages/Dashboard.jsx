import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import MessageLog from "../components/MessageLog";
import ChatSidebar from "../components/ChatSidebar";
import EmbedManager from "../components/EmbedManager";
import { fetchChannels } from "../api/embedApi";
import useSocket from "../hooks/useSocket";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "embeds"
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all text channels from the backend on load
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoading(true);
        const channelList = await fetchChannels();
        setChannels(channelList);
      } catch (err) {
        console.error("Failed to fetch channels:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadChannels();
  }, []);

  // Listen for real-time events via WebSocket.
  const handleSocketEvent = useCallback((event) => {
    if (event.type === "new_message") {
      const payload = event.payload;
      setChannels((prev) => {
        const exists = prev.some((ch) => ch.name === payload.channelName);
        if (!exists) {
          return [
            ...prev,
            {
              id: payload.channelId,
              name: payload.channelName,
              parentName: "Support",
              status: "open",
            },
          ];
        }
        return prev;
      });
    } else if (event.type === "channel_created") {
      const payload = event.payload; // { name, id }
      setChannels((prev) => {
        const exists = prev.some((ch) => ch.id === payload.id);
        if (!exists) {
          return [
            ...prev,
            {
              id: payload.id,
              name: payload.name,
              parentName: "Support",
              status: "open",
            },
          ];
        }
        return prev;
      });
    } else if (event.type === "channel_deleted") {
      const payload = event.payload; // { name, id }
      setChannels((prev) => prev.filter((ch) => ch.id !== payload.id));
      setSelectedChannel((prev) => {
        if (prev && prev.id === payload.id) {
          return null;
        }
        return prev;
      });
    } else if (event.type === "chat_closed") {
      const payload = event.payload; // { channelId, channelName }
      setChannels((prev) =>
        prev.map((ch) => {
          if (ch.id === payload.channelId) {
            return { ...ch, status: "closed" };
          }
          return ch;
        }),
      );
      setSelectedChannel((prev) => {
        if (prev && prev.id === payload.channelId) {
          return { ...prev, status: "closed" };
        }
        return prev;
      });
    }
  }, []);

  useSocket(handleSocketEvent);

  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel);
    if (activeTab === "embeds") {
      setActiveTab("chats");
    }
  };

  return (
    <div className="h-screen bg-surface-950 text-white flex flex-col font-sans overflow-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-1 overflow-hidden p-6 md:p-8 gap-6">
        {/* Sidebar — always visible for navigation */}
        <ChatSidebar
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={handleSelectChannel}
          isLoading={isLoading}
        />

        <main className="flex-1 flex flex-col min-w-0">
          {activeTab === "chats" ? (
            selectedChannel ? (
              <MessageLog 
                key={selectedChannel.id} 
                selectedChat={selectedChannel} 
                channels={channels}
                onSelectChannel={handleSelectChannel}
              />
            ) : (
              <div className="section-container items-center justify-center text-center p-6">
                <span className="text-4xl mb-3">👈</span>
                <p className="text-sm font-medium text-slate-500">
                  Select a channel from the sidebar
                </p>
                <p className="text-xs text-slate-600 mt-1.5">
                  Select any server channel or support chat to read messages.
                </p>
              </div>
            )
          ) : (
            <EmbedManager selectedChannel={selectedChannel} channels={channels} />
          )}
        </main>
      </div>
    </div>
  );
}
