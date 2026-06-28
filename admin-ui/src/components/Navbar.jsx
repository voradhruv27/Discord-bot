export default function Navbar() {
  return (
    <nav className="bg-surface-800 border-b border-surface-700 shadow-lg shadow-surface-950/50 sticky top-0 z-50">
      {/* Accent top line */}
      <div className="h-0.5 bg-linear-to-r from-primary-600 via-primary-400 to-primary-600" />

      <div className="px-6 py-3.5 flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-3">
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

        {/* Status Badge */}
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-2 bg-success-500/10 border border-success-500/20 text-success-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse shadow-sm shadow-success-500/50" />
            Bot Online
          </span>
        </div>
      </div>
    </nav>
  );
}
