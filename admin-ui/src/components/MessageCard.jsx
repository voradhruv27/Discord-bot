const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function MessageCard({ msg, onStartChat, onVisitChat }) {
  if (msg.embed) {
    return (
      <div className="flex gap-3 max-w-[85%] mr-auto items-end mb-3 select-none">
        <div className="flex flex-col items-start w-full">
          {/* Author Name */}
          <span className="text-[10px] text-slate-500 font-semibold mb-1 px-1">
            {msg.author}
          </span>
          
          {/* Embed Box */}
          <div
            style={{ borderLeftColor: msg.embed.color || "#5865f2" }}
            className="bg-surface-950 border border-white/[0.07] border-l-[4px] rounded-xl p-4 flex flex-col gap-2 shadow-sm w-full md:max-w-md"
          >
            {msg.embed.title && (
              <div className="text-xs font-bold text-slate-100">
                {msg.embed.title}
              </div>
            )}
            {msg.embed.description && (
              <div className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                {msg.embed.description}
              </div>
            )}
            {msg.activeChatChannelId ? (
              onVisitChat && (
                <button
                  onClick={() => onVisitChat(msg.activeChatChannelId)}
                  className="mt-1 self-start py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-semibold text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
                >
                  💬 Visit Chat
                </button>
              )
            ) : (
              onStartChat && (
                <button
                  onClick={onStartChat}
                  className="mt-1 self-start py-1 px-2.5 bg-primary-600 hover:bg-primary-500 text-[10px] font-semibold text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
                >
                  💬 Start Chat
                </button>
              )
            )}
          </div>

          {/* Time */}
          <span className="text-[9px] text-slate-600 mt-1 px-1">
            {formatTime(msg.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  const isOwn = msg.isOwn || msg.author === "Admin";
  const initial = msg.author ? msg.author.charAt(0).toUpperCase() : "?";

  return (
    <div className={`flex gap-3 max-w-[85%] ${isOwn ? "ml-auto flex-row-reverse" : "mr-auto flex-row"} items-end mb-2 group`}>

      {/* Bubble Container */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Author Name */}
        <span className="text-[10px] text-slate-500 font-semibold mb-0.5 px-1.5 select-none">
          {isOwn ? "Admin" : msg.author}
        </span>

        {/* Message Bubble */}
        <div
          className={`px-3.5 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md min-w-[95px] ${
            isOwn
              ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-none hover:from-primary-550 hover:to-primary-650"
              : "bg-surface-800 border border-white/[0.05] text-slate-100 rounded-tl-none hover:bg-surface-750"
          }`}
        >
          {/* Content */}
          <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap font-normal select-text">
            {msg.content}
          </p>

          {/* Time & Status Indicator */}
          <div className="flex items-center justify-end gap-1 mt-1 opacity-50 select-none">
            <span className="text-[9px] font-medium tracking-wide">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
