import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://sharehub-backend.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const createRoom = async (roomData) => {
  const response = await api.post('/rooms/create', roomData);
  return response.data;
};

export const getRoom = async (code) => {
  const response = await api.get(`/rooms/${code}`);
  return response.data;
};

export const getMessages = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}/messages`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

export const markMessageAsRead = async (messageId, userId) => {
  const response = await api.put(`/messages/${messageId}/read`, { userId });
  return response.data;
};

export default api;
