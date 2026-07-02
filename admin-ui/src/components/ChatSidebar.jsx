// Sidebar showing list of all text channels and support chats.

export default function ChatSidebar({ channels, selectedChannel, onSelectChannel, isLoading }) {
  // Split channels into support tickets vs general server channels
  const supportChats = channels.filter((c) => c.name.startsWith("chat-"));
  const serverChannels = channels.filter((c) => !c.name.startsWith("chat-"));

  return (
    <div className="flex flex-col h-full bg-surface-900 border border-white/[0.08] rounded-2xl overflow-hidden w-64 flex-shrink-0 select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.07] bg-surface-950">
        <h2 className="text-sm font-semibold text-slate-200">Discord Channels</h2>
        <p className="text-xs text-slate-500 mt-0.5">{channels.length} total channels</p>
      </div>

      {/* Main scrolling channels container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] text-slate-500">Loading channels...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Section 1: Server Channels */}
            {serverChannels.length > 0 && (
              <div>
                <div className="px-2.5 pb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  📁 Server Channels
                </div>
                <div className="space-y-0.5">
                  {serverChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => onSelectChannel(channel)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedChannel && selectedChannel.id === channel.id
                          ? "bg-primary-600/20 text-primary-400 border border-primary-500/30"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <span className="text-slate-500 font-semibold">#</span>
                      <span className="font-medium truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Support Chats */}
            <div>
              <div className="px-2.5 pb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                🎫 Support Chats
              </div>
              <div className="space-y-0.5">
                {supportChats.length === 0 ? (
                  <div className="px-2.5 py-3 text-center bg-white/[0.02] border border-dashed border-white/[0.05] rounded-xl">
                    <p className="text-[11px] text-slate-600 leading-normal">
                      No active tickets. Waiting for users to start...
                    </p>
                  </div>
                ) : (
                  supportChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => onSelectChannel(chat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all flex items-center justify-between cursor-pointer ${
                        selectedChannel && selectedChannel.id === chat.id
                          ? "bg-primary-600/20 text-primary-400 border border-primary-500/30"
                          : chat.status === "closed"
                          ? "text-slate-500 hover:bg-white/[0.02] hover:text-slate-400 border border-transparent opacity-80"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <span className="font-medium flex items-center gap-1.5 truncate">
                        <span>{chat.status === "closed" ? "🔒" : "💬"}</span>
                        <span className="truncate">{chat.name}</span>
                      </span>
                      {chat.status === "closed" && (
                        <span className="text-[9px] bg-white/[0.06] text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider scale-90">
                          Closed
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
