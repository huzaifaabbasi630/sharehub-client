import { createContext, useContext, useState } from 'react';
import { 
  subscribeToChannel, 
  unsubscribeFromChannel, 
  bindToEvent, 
  unbindFromEvent, 
  triggerEvent 
} from '../services/pusher';

const PusherContext = createContext(null);

export const usePusher = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  return context;
};

export const PusherProvider = ({ children }) => {
  const [currentChannel, setCurrentChannel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscribe = (channelName) => {
    const channel = subscribeToChannel(channelName);
    setCurrentChannel(channelName);
    setIsConnected(true);
    return channel;
  };

  const unsubscribe = () => {
    unsubscribeFromChannel();
    setCurrentChannel(null);
    setIsConnected(false);
  };

  const bind = (eventName, callback) => {
    bindToEvent(eventName, callback);
  };

  const unbind = (eventName, callback) => {
    unbindFromEvent(eventName, callback);
  };

  const emit = (eventName, data) => {
    triggerEvent(eventName, data);
  };

  const value = {
    currentChannel,
    isConnected,
    subscribe,
    unsubscribe,
    bind,
    unbind,
    emit
  };

  return (
    <PusherContext.Provider value={value}>
      {children}
    </PusherContext.Provider>
  );
};