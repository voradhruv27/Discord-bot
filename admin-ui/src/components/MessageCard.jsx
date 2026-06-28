const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function MessageCard({ msg }) {
  return (
    <div className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[60%] min-w-[120px] rounded-xl border border-white/10 overflow-hidden ${
          msg.isOwn ? "bg-[#1e2a4a]" : "bg-surface-800"
        }`}
      >
        {/* Name bar */}
        <div
          className={`px-2.5 pt-1.5 pb-1 border-b border-white/[0.08] text-xs font-bold tracking-wide ${
            msg.isOwn ? "text-primary-400" : "text-slate-400"
          }`}
        >
          {msg.author}
        </div>

        {/* Message body */}
        <div className="px-2.5 pt-2 pb-1 text-[13px] text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
          {msg.content}
        </div>

        {/* Timestamp */}
        <div className="px-2.5 pb-1.5 text-right text-[11px] text-slate-600">
          {formatTime(msg.timestamp)}
        </div>
      </div>
    </div>
  );
}
