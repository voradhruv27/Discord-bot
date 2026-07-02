import axiosInstance from "./axiosInstance";

// Fetch all text channels in the guild
export const fetchChannels = async () => {
  const response = await axiosInstance.get("/channels");
  return response.data.channels;
};

// Fetch all created embeds from the backend store
export const fetchEmbeds = async () => {
  const response = await axiosInstance.get("/embeds");
  return response.data.embeds;
};

// Create and post a new embed to a Discord channel
export const createEmbed = async (embedData) => {
  // embedData: { channelId, title, description, color }
  const response = await axiosInstance.post("/embeds", embedData);
  return response.data.embed;
};

// Delete an embed from Discord and the backend store
export const deleteEmbed = async (embedId) => {
  const response = await axiosInstance.delete(`/embeds/${embedId}`);
  return response.data;
};

// Repost an existing embed to Discord and update its messageId
export const repostEmbed = async (embedId) => {
  const response = await axiosInstance.post(`/embeds/${embedId}/repost`);
  return response.data.embed;
};
