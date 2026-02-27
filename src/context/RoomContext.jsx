import { createContext, useContext, useState, useCallback } from 'react';

const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const setRoomData = useCallback((roomData) => {
    setRoom(roomData);
  }, []);

  const setUserData = useCallback((userData) => {
    setUser(userData);
    setIsHost(userData?.isHost || false);
  }, []);

  const addParticipant = useCallback((participant) => {
    setParticipants(prev => {
      if (prev.find(p => p.socketId === participant.socketId)) {
        return prev;
      }
      return [...prev, participant];
    });
  }, []);

  const removeParticipant = useCallback((socketId) => {
    setParticipants(prev => prev.filter(p => p.socketId !== socketId));
  }, []);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const setMessageList = useCallback((messageList) => {
    setMessages(messageList);
  }, []);

  const setTypingStatus = useCallback((userName, isTyping) => {
    setTypingUsers(prev => {
      if (isTyping) {
        if (!prev.includes(userName)) {
          return [...prev, userName];
        }
        return prev;
      } else {
        return prev.filter(name => name !== userName);
      }
    });
  }, []);

  const clearRoom = useCallback(() => {
    setRoom(null);
    setUser(null);
    setParticipants([]);
    setMessages([]);
    setIsHost(false);
    setTypingUsers([]);
  }, []);

  const value = {
    room,
    user,
    participants,
    messages,
    isHost,
    typingUsers,
    setRoomData,
    setUserData,
    addParticipant,
    removeParticipant,
    addMessage,
    setMessageList,
    setTypingStatus,
    clearRoom
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
