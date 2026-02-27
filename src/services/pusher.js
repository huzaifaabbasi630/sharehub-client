import Pusher from 'pusher-js';

// Initialize Pusher client
const pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY || 'your_pusher_key_here', {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'us2', // Change to your cluster
  encrypted: true
});

let channel = null;

// Function to subscribe to a room channel
export const subscribeToChannel = (channelName) => {
  if (channel) {
    unsubscribeFromChannel();
  }
  channel = pusherInstance.subscribe(channelName);
  return channel;
};

// Function to unsubscribe from current channel
export const unsubscribeFromChannel = () => {
  if (channel) {
    pusherInstance.unsubscribe(channel.name);
    channel = null;
  }
};

// Function to bind to events on the current channel
export const bindToEvent = (eventName, callback) => {
  if (channel) {
    channel.bind(eventName, callback);
  }
};

// Function to unbind from events on the current channel
export const unbindFromEvent = (eventName, callback) => {
  if (channel) {
    channel.unbind(eventName, callback);
  }
};

// Function to trigger event (client events need to be enabled in Pusher dashboard)
export const triggerEvent = (eventName, data) => {
  // Note: Client events need to be enabled in Pusher dashboard
  // For server-triggered events, you'd typically make an API call to your backend
  if (channel) {
    channel.trigger(`client-${eventName}`, data);
  }
};

// Export the pusher instance for direct access if needed
export default pusherInstance;