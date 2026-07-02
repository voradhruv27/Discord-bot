// API helpers for fetching chat data from the backend.

import axiosInstance from "./axiosInstance";

// Fetch the list of all active chat channel names.
export const fetchChats = async () => {
  const response = await axiosInstance.get("/admin/chats");
  return response.data.chats;
};

// Fetch messages for a specific chat channel.
export const fetchChatMessages = async (channelId) => {
  const response = await axiosInstance.get(
    `/admin/chats/${channelId}/messages`,
  );
  return response.data;
};

// Close a support ticket chat
export const closeChat = async (channelId) => {
  const response = await axiosInstance.patch(`/admin/chats/${channelId}/close`);
  return response.data;
};
