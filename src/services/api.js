import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sharehub-backend.vercel.app/api';

export const createRoom = async (roomData) => {
  const response = await axios.post(`${API_BASE_URL}/rooms/create`, roomData);
  return response.data;
};

export const getRoom = async (code) => {
  const response = await axios.get(`${API_BASE_URL}/rooms/${code}`);
  return response.data;
};

export const getMessages = async (roomId) => {
  const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}/messages`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await axios.post(`${API_BASE_URL}/messages`, messageData);
  return response.data;
};

export const markMessageAsRead = async (messageId, userId) => {
  const response = await axios.put(`${API_BASE_URL}/messages/${messageId}/read`, { userId });
  return response.data;
};
