import Navbar from "../components/Navbar";
import MessageLog from "../components/MessageLog";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-surface-950 text-white flex flex-col font-sans">
      <Navbar />

      <main className="relative flex-1 max-w-2xl w-full mx-auto p-6 md:p-8">
        <MessageLog />
      </main>
    </div>
  );
}
