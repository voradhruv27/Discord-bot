import { useEffect, useState, useRef } from "react";
import MessageCard from "./MessageCard";
import ChatInput from "./ChatInput";
import useSocket from "../hooks/useSocket";
import { fetchChatMessages, closeChat } from "../api/chatApi";
import axiosInstance from "../api/axiosInstance";

const STATUS_DOT = {
  connected: "bg-green-400",
  connecting: "bg-yellow-400 animate-pulse",
  disconnected: "bg-red-500",
};

export default function MessageLog({ selectedChat, channels = [], onSelectChannel }) {
  const [messages, setMessages] = useState([]);
  const [welcomeEmbed, setWelcomeEmbed] = useState(null);
  const bottomRef = useRef(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const [isStartingChat, setIsStartingChat] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Clear success and error messages after some time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleStartChatDirect = async (messageId) => {
    setIsStartingChat(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await axiosInstance.post("/admin/chats/create-from-admin", {
        userId: "1520461059876585713",
        embedMessageId: messageId,
      });
      setSuccessMessage("Support ticket channel created successfully!");

      if (res.data && res.data.channelId && onSelectChannel) {
        const newChan = {
          id: res.data.channelId,
          name: res.data.channelName,
          parentName: "Support",
          status: "open",
        };
        onSelectChannel(newChan);
      }
    } catch (err) {
      console.error("Failed to start chat from admin:", err);
      setErrorMessage("Failed to start chat with bot user ID.");
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleVisitChat = (channelId) => {
    if (onSelectChannel) {
      const targetChan = channels.find((c) => c.id === channelId) || {
        id: channelId,
        name: "chat",
        parentName: "Support",
        status: "open",
      };
      onSelectChannel(targetChan);
    }
  };

  // Fetch messages from backend whenever the selected chat changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const data = await fetchChatMessages(selectedChat.id);
        setMessages(data.messages || []);
        setWelcomeEmbed(data.welcomeEmbed || null);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
        setWelcomeEmbed(null);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedChat.id]);

  const handleCloseTicket = async () => {
    try {
      await closeChat(selectedChat.id);
    } catch (err) {
      console.error("Failed to close ticket:", err);
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen to real-time messages via WebSocket
  // Only add messages that belong to the currently selected chat
  const status = useSocket((event) => {
    if (event.type === "new_message") {
      const payload = event.payload;
      if (payload.channelName === selectedChat.name) {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.messageId && msg.messageId === payload.messageId,
          );
          if (exists) return prev;
          return [...prev, { ...payload, isOwn: false }];
        });
      }
    } else if (event.type === "message_deleted") {
      const payload = event.payload; // { channelName, messageId }
      if (payload.channelName === selectedChat.name) {
        setMessages((prev) =>
          prev.filter((msg) => msg.messageId !== payload.messageId),
        );
      }
    } else if (event.type === "channel_created") {
      const payload = event.payload;
      // Update the embed message that triggered this chat so its button switches to "Visit Chat"
      if (payload.embedMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === payload.embedMessageId
              ? { ...msg, activeChatChannelId: payload.id }
              : msg,
          ),
        );
      }
    }
  });

  // When admin sends a message, add it to the local list immediately
  const handleMessageSent = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Get the channel ID directly from the selected chat object
  const channelId = selectedChat.id;

  return (
    <div className="section-container">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-950 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status] ?? STATUS_DOT.disconnected}`}
          />
          <span className="text-slate-200 text-sm font-semibold">
            {selectedChat.name}
          </span>
        </div>

        {/* Close Ticket or Closed Badge */}
        {selectedChat.status === "closed" ? (
          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider scale-90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            🔴 Ticket Closed
          </span>
        ) : (
          <button
            onClick={handleCloseTicket}
            className="py-1.5 px-3 bg-red-655/15 hover:bg-red-550/25 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            🔒 Close Ticket
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mx-4 mt-3 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg flex-shrink-0">
          ⚠️ {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mx-4 mt-3 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-lg flex-shrink-0">
          ✅ {successMessage}
        </div>
      )}

      {/* ── Messages list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {isLoadingMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <span className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs font-medium text-slate-500">Loading chat history...</p>
          </div>
        ) : (
          <>
            {/* Render Welcome Embed at the very top */}
            {selectedChat.name.startsWith("chat-") && welcomeEmbed && (
              <div
                style={{ borderLeftColor: welcomeEmbed.color || "#5865f2" }}
                className="bg-surface-950 border border-white/[0.07] border-l-[4px] rounded-xl p-4 mb-2 flex flex-col gap-2 max-w-[85%]"
              >
                <div className="text-xs font-bold text-slate-100">
                  {welcomeEmbed.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {welcomeEmbed.description}
                </div>
                {selectedChat.status !== "closed" && (
                  <button
                    onClick={handleCloseTicket}
                    className="mt-1 self-start py-1 px-2 bg-red-500/10 hover:bg-red-500/20 text-[10px] font-semibold text-red-400 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    🔒 Close Ticket
                  </button>
                )}
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <span className="text-2xl mb-2">💬</span>
                <p className="text-xs font-medium text-slate-500">
                  No chat messages yet
                </p>
              </div>
            ) : (
              messages
                .filter((msg) => !(selectedChat.name.startsWith("chat-") && msg.embed && msg.embed.title === "Support Ticket Opened"))
                .map((msg, idx) => (
                  <MessageCard
                    key={idx}
                    msg={msg}
                    onStartChat={!selectedChat.name.startsWith("chat-") ? () => handleStartChatDirect(msg.messageId) : null}
                    onVisitChat={handleVisitChat}
                  />
                ))
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <ChatInput
        selectedChat={selectedChat}
        channelId={channelId}
        onMessageSent={handleMessageSent}
        isClosed={selectedChat.status === "closed"}
      />
    </div>
  );
}
