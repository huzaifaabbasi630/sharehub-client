import axios from 'axios';

/**
 * Production config:
 * - VITE_BACKEND_URL = https://your-backend-project.vercel.app
 *
 * NOTE: Do NOT include "/api" in VITE_BACKEND_URL.
 */
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'https://sharehubbackend-42pwxkva.b4a.run';

export const createRoom = async (roomData) => {
  const response = await axios.post(`${API_BASE_URL}/api/rooms/create`, roomData);
  return response.data;
};

export const getRoom = async (code) => {
  const response = await axios.get(`${API_BASE_URL}/api/rooms/${code}`);
  return response.data;
};

export const getMessages = async (roomId) => {
  const response = await axios.get(`${API_BASE_URL}/api/rooms/${roomId}/messages`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await axios.post(`${API_BASE_URL}/api/messages`, messageData);
  return response.data;
};

export const markMessageAsRead = async (messageId, userId) => {
  const response = await axios.put(`${API_BASE_URL}/api/messages/${messageId}/read`, { userId });
  return response.data;
};

// Join Request Pusher Triggers
export const sendJoinRequest = async (roomCode, user) => {
  const response = await axios.post(`${API_BASE_URL}/api/join-request`, { roomCode, user });
  return response.data;
};

export const acceptJoinRequest = async (roomCode, meetingPath, acceptedBy, requesterId, requesterName) => {
  const response = await axios.post(`${API_BASE_URL}/api/accept-request`, { 
    roomCode, 
    meetingPath, 
    acceptedBy,
    requesterId,      // ✅ Send requester info so server can notify specific user
    requesterName
  });
  return response.data;
};

export const rejectJoinRequest = async (roomCode, requesterId) => {
  const response = await axios.post(`${API_BASE_URL}/api/reject-request`, { roomCode, requesterId });
  return response.data;
};
