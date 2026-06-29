import { useEffect, useState, useRef } from "react";
import MessageCard from "./MessageCard";
import ChatInput from "./ChatInput";
import useSocket from "../hooks/useSocket";
import { fetchChatMessages } from "../api/chatApi";

const STATUS_DOT = {
  connected: "bg-green-400",
  connecting: "bg-yellow-400 animate-pulse",
  disconnected: "bg-red-500",
};

export default function MessageLog({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // Fetch messages from backend whenever the selected chat changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await fetchChatMessages(selectedChat.name);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      }
    };
    loadMessages();
  }, [selectedChat.name]);

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
          const exists = prev.some((msg) => msg.messageId && msg.messageId === payload.messageId);
          if (exists) return prev;
          return [...prev, { ...payload, isOwn: false }];
        });
      }
    } else if (event.type === "message_deleted") {
      const payload = event.payload; // { channelName, messageId }
      if (payload.channelName === selectedChat.name) {
        setMessages((prev) => prev.filter((msg) => msg.messageId !== payload.messageId));
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
    <div className="flex flex-col h-[600px] bg-surface-900 border border-white/[0.08] rounded-2xl overflow-hidden">
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
      </div>

      {/* ── Messages list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-3">💬</span>
            <p className="text-sm font-medium text-slate-500">
              No msg yet
            </p>
            <p className="text-xs text-slate-600 mt-1.5 max-w-[180px] leading-relaxed">
              Messages in this chat will appear here.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => <MessageCard key={idx} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <ChatInput
        selectedChat={selectedChat}
        channelId={channelId}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
