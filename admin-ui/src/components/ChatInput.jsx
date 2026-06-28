import { useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function ChatInput({ onMessageSent }) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      await axiosInstance.post("/send", { message: text });
      onMessageSent({ author: "Admin", content: text, timestamp: new Date().toISOString(), isOwn: true });
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
        placeholder="Type a message…"
        rows={1}
        disabled={isSending}
        className="flex-1 resize-none bg-surface-800 border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-slate-200 text-[13px] leading-relaxed outline-none max-h-24 overflow-y-auto placeholder-slate-600 focus:border-primary-500/50 transition-colors font-[inherit]"
      />
      <button
        type="submit"
        disabled={!input.trim() || isSending}
        className={`w-10 h-10 rounded-xl border border-white/[0.09] flex items-center justify-center flex-shrink-0 transition-colors ${
          input.trim() && !isSending
            ? "bg-primary-600 text-white cursor-pointer hover:bg-primary-500"
            : "bg-surface-800 text-slate-600 cursor-not-allowed"
        }`}
      >
        {isSending ? (
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </form>
  );
}
