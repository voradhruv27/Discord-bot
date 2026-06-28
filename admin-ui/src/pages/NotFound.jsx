export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-950 text-white font-sans flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-surface-800 border border-surface-700 rounded-3xl p-10 max-w-sm w-full shadow-2xl shadow-surface-950/80">
        <span className="text-6xl mb-5 block">🔍</span>
        <h1 className="text-2xl font-bold text-white mb-2">404 — Not Found</h1>
        <p className="text-surface-400 text-sm mb-7 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block w-full px-6 py-3 bg-primary-600 hover:bg-primary-500 active:scale-95 rounded-xl font-semibold text-sm text-white transition-all duration-200 shadow-md shadow-primary-900/40"
        >
          ← Go back to Dashboard
        </a>
      </div>
    </div>
  );
}
