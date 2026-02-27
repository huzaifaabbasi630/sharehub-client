import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const emitEvent = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};

export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const offEvent = (event) => {
  if (socket) {
    socket.off(event);
  }
};
