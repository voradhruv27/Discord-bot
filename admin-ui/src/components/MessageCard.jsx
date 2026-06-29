const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function MessageCard({ msg }) {
  const isOwn = msg.isOwn || msg.author === "Admin";
  const initial = msg.author ? msg.author.charAt(0).toUpperCase() : "?";

  return (
    <div className={`flex gap-3 max-w-[85%] ${isOwn ? "ml-auto flex-row-reverse" : "mr-auto flex-row"} items-end mb-2 group`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 select-none shadow-md transition-transform duration-300 group-hover:scale-105 ${
          isOwn
            ? "bg-gradient-to-tr from-primary-500 to-indigo-500 text-white border border-primary-400/20"
            : "bg-surface-700 text-slate-200 border border-white/5"
        }`}
      >
        {isOwn ? "A" : initial}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Author Name */}
        <span className="text-[10px] text-slate-500 font-semibold mb-0.5 px-1.5 select-none">
          {isOwn ? "Admin" : msg.author}
        </span>

        {/* Message Bubble */}
        <div
          className={`px-3.5 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
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
            {isOwn && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-100"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
