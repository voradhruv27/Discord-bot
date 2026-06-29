// Sidebar showing list of all active support chats.

export default function ChatSidebar({ chats, selectedChat, onSelectChat, isLoading }) {
  return (
    <div className="flex flex-col h-[600px] bg-surface-900 border border-white/[0.08] rounded-2xl overflow-hidden w-64 flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.07] bg-surface-950">
        <h2 className="text-sm font-semibold text-slate-200">Support Chats</h2>
        <p className="text-xs text-slate-500 mt-0.5">{chats.length} active</p>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Loading channels...</p>
            </div>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-slate-600 text-center px-4">
              No active chats yet. Waiting for users to start a chat...
            </p>
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.name} className="border-b border-dotted border-white/[0.12] pb-1.5 mb-1 last:border-0 last:pb-0 last:mb-0">
              <button
                onClick={() => onSelectChat(chat)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedChat && selectedChat.name === chat.name
                    ? "bg-primary-600/20 text-primary-400 border border-primary-500/30"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 border border-transparent"
                }`}
              >
                <span className="font-medium">💬 {chat.name}</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
