import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  fetchChannels,
  fetchEmbeds,
  createEmbed,
  deleteEmbed,
  repostEmbed,
} from "../api/embedApi";

export default function EmbedManager({ selectedChannel, channels }) {
  const [embeds, setEmbeds] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#5865f2"); // Default Discord Blurple
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Clear success and error messages after some time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChatDirect = async () => {
    setIsStartingChat(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await axiosInstance.post("/admin/chats/create-from-admin", { userId: "1520461059876585713" });
      setSuccessMessage("Support ticket channel created successfully!");

      // Re-fetch all embeds to keep state clean
      const embedList = await fetchEmbeds();
      setEmbeds(embedList);
    } catch (err) {
      console.error("Failed to start chat from admin:", err);
      setErrorMessage("Failed to start chat with bot user ID.");
    } finally {
      setIsStartingChat(false);
    }
  };

  // Load existing embeds on mount
  useEffect(() => {
    const loadEmbeds = async () => {
      try {
        setIsLoading(true);
        const embedList = await fetchEmbeds();
        setEmbeds(embedList);
      } catch (err) {
        console.error("Failed to load embeds:", err);
        setErrorMessage("Failed to load active embeds.");
      } finally {
        setIsLoading(false);
      }
    };
    loadEmbeds();
  }, []);

  // Sync selection with sidebar selected channel
  useEffect(() => {
    if (selectedChannel) {
      setSelectedChannelId(selectedChannel.id);
    } else if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [selectedChannel, channels]);

  const handlePostEmbed = async (e) => {
    e.preventDefault();
    if (!selectedChannelId) {
      setErrorMessage("Please select a target channel.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const channelObj = channels.find((c) => c.id === selectedChannelId);
      const channelName = channelObj ? channelObj.name : "";

      await createEmbed({
        channelId: selectedChannelId,
        channelName,
        title,
        description,
        color,
      });

      // Re-fetch all embeds from the backend store to display updated list
      const embedList = await fetchEmbeds();
      setEmbeds(embedList);

      setTitle("");
      setDescription("");
      setSuccessMessage("Embed posted successfully!");
    } catch (err) {
      console.error("Failed to post embed:", err);
      setErrorMessage(
        "Failed to post embed. Ensure bot is running and online.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmbed = async (embedId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteEmbed(embedId);
      setEmbeds((prev) => prev.filter((emb) => emb.id !== embedId));
      setSuccessMessage("Embed deleted successfully.");
    } catch (err) {
      console.error("Failed to delete embed:", err);
      setErrorMessage("Failed to delete embed from Discord/backend.");
    }
  };

  const handleRepostEmbed = async (emb) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      // Repost using the API
      const updatedEmbed = await repostEmbed(emb.id);

      // Update local state by replacing the old embed record with the updated one
      setEmbeds((prev) =>
        prev.map((item) => (item.id === emb.id ? updatedEmbed : item)),
      );
      setSuccessMessage("Embed reposted successfully!");
    } catch (err) {
      console.error("Failed to repost embed:", err);
      setErrorMessage("Failed to repost embed.");
    }
  };

  const getChannelName = (channelId) => {
    const channel = channels.find((c) => c.id === channelId);
    return channel ? channel.name : "Unknown Channel";
  };

  return (
    <div className="section-container p-6 md:p-8">
        <h2 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <span>📢</span> Create Support Embed
        </h2>

        {errorMessage && (
          <div className="mb-4 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-lg">
            ✅ {successMessage}
          </div>
        )}

        <form
          onSubmit={handlePostEmbed}
          className="flex-1 overflow-y-auto space-y-4 pr-1"
        >
          {/* Target Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Post to Channel
            </label>
            <select
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              disabled={isLoading || channels.length === 0}
              className="w-full bg-surface-950 border border-white/[0.12] rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary-500 transition-colors"
            >
              {channels.length === 0 ? (
                <option>No text channels found</option>
              ) : (
                channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.name} {ch.parentName ? `(${ch.parentName})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Embed Title
            </label>
            <input
              type="text"
              placeholder="e.g. Need Help? Open a Support Ticket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-surface-950 border border-white/[0.12] rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Description */}
          <div className="flex-1 flex flex-col min-h-[140px]">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Embed Description
            </label>
            <textarea
              placeholder="Provide instructions for the user..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full flex-1 bg-surface-950 border border-white/[0.12] rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary-500 transition-colors resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Accent Color
            </label>
            <div className="flex gap-2.5">
              {[
                { name: "blurple", hex: "#5865f2" },
                { name: "green", hex: "#57f287" },
                { name: "yellow", hex: "#fee75c" },
                { name: "red", hex: "#ed4245" },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setColor(preset.hex)}
                  style={{ backgroundColor: preset.hex }}
                  className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                    color === preset.hex
                      ? "border-white scale-110 shadow-md shadow-white/10"
                      : "border-transparent hover:scale-105"
                  }`}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full py-2.5 px-4 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:bg-primary-700 cursor-pointer"
          >
            {isSubmitting
              ? "Posting to Discord..."
              : "🚀 Post Embed to Channel"}
          </button>
        </form>
    </div>
  );
}
