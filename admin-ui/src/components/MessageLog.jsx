import { useEffect, useState, useRef } from "react";
import MessageCard from "./MessageCard";
import ChatInput from "./ChatInput";
import useSocket from "../hooks/useSocket";

const STORAGE_KEY = "discord_message_log";
const MAX_MESSAGES = 200;

const STATUS_DOT = {
  connected:    "bg-green-400",
  connecting:   "bg-yellow-400 animate-pulse",
  disconnected: "bg-red-500",
};

export default function MessageLog() {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* ignore */ }
  }, [messages]);

  // Listen to real-time messages via custom hook
  const status = useSocket((payload) => {
    setMessages((prev) =>
      [...prev, { ...payload, isOwn: false }].slice(-MAX_MESSAGES)
    );
  });

  const handleMessageSent = (msg) => {
    setMessages((prev) => [...prev, msg].slice(-MAX_MESSAGES));
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col h-[600px] bg-surface-900 border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-950 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status] ?? STATUS_DOT.disconnected}`} />
          <span className="text-slate-200 text-sm font-semibold">Live Message Feed</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-red-400 font-semibold px-2.5 py-1 rounded-lg border border-red-400/25 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Messages list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-3">💬</span>
            <p className="text-sm font-medium text-slate-500">No messages yet</p>
            <p className="text-xs text-slate-600 mt-1.5 max-w-[180px] leading-relaxed">
              Discord messages will appear here in real-time.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageCard key={idx} msg={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <ChatInput onMessageSent={handleMessageSent} />
    </div>
  );
}
