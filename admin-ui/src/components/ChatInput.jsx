// admin-ui/src/components/ChatInput.jsx
import { useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function ChatInput({ selectedChat, channelId, onMessageSent, isClosed }) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();

    // Do not send if input is empty, sending is in progress, no channel ID, or channel is closed
    if (!text || isSending || !channelId || isClosed) return;

    setIsSending(true);
    try {
      const response = await axiosInstance.post("/send", {
        message: text,
        channelId,
        channelName: selectedChat.name,
      });

      // Update local message list so message displays in Admin UI
      onMessageSent({
        author: "Admin",
        content: text,
        channelId,
        channelName: selectedChat.name,
        messageId: response.data.messageId || null,
        timestamp: new Date().toISOString(),
        isOwn: true,
      });

      setInput("");
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex items-end gap-2.5 px-3.5 py-3 bg-surface-950 border-t border-white/[0.07] flex-shrink-0"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isClosed
            ? "🔒 This ticket has been closed and is read-only."
            : channelId
            ? "Type a message…"
            : "Waiting for channel details…"
        }
        rows={1}
        disabled={isSending || !channelId || isClosed}
        className={`flex-1 resize-none border rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed outline-none max-h-24 overflow-y-auto placeholder-slate-600 transition-colors font-[inherit] ${
          isClosed
            ? "bg-surface-900/50 border-white/[0.04] text-slate-500 cursor-not-allowed opacity-60"
            : "bg-surface-800 border-white/[0.09] text-slate-200 focus:border-primary-500/50"
        }`}
      />
      <button
        type="submit"
        disabled={!input.trim() || isSending || !channelId || isClosed}
        className={`w-10 h-10 rounded-xl border border-white/[0.09] flex items-center justify-center flex-shrink-0 transition-colors ${
          input.trim() && !isSending && channelId && !isClosed
            ? "bg-primary-600 text-white cursor-pointer hover:bg-primary-500"
            : "bg-surface-800 text-slate-600 cursor-not-allowed"
        }`}
      >
        {isSending ? (
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </form>
  );
}
