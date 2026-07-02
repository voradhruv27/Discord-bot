export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-surface-800 border-b border-surface-700 shadow-lg shadow-surface-950/50 sticky top-0 z-50">
      {/* Accent top line */}
      <div className="h-0.5 bg-linear-to-r from-primary-600 via-primary-400 to-primary-600" />

      <div className="px-6 py-3 flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-3 w-48">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-900/50">
            <span className="text-lg leading-none">🤖</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              Discord Bot
            </h1>
            <p className="text-[11px] text-surface-400 leading-tight font-medium">
              Control Panel
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-surface-950/60 p-1 rounded-xl border border-white/[0.05]">
          <button
            onClick={() => setActiveTab("chats")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "chats"
                ? "bg-primary-600 text-white shadow-sm shadow-primary-900/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            💬 Support Chats
          </button>
          <button
            onClick={() => setActiveTab("embeds")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "embeds"
                ? "bg-primary-600 text-white shadow-sm shadow-primary-900/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📢 Embed Creator
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-end space-x-4 w-48">
          <span className="flex items-center gap-2 bg-success-500/10 border border-success-500/20 text-success-400 text-[11px] font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse shadow-sm shadow-success-500/50" />
            Bot Online
          </span>
        </div>
      </div>
    </nav>
  );
}
