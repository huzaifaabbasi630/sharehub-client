// Shared state management — IN-MEMORY ONLY (no localStorage persistence)
// Uses a pub/sub pattern for cross-component communication within the same tab.

const store = new Map();
const listeners = new Map();

export const sharedState = {
  // Set value and notify all listeners
  set(key, value) {
    store.set(key, value);
    this.notify(key, value);
  },

  // Get value from in-memory store
  get(key, defaultValue = null) {
    return store.has(key) ? store.get(key) : defaultValue;
  },

  // Subscribe to changes for a key
  subscribe(key, callback) {
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const keyListeners = listeners.get(key);
      if (keyListeners) keyListeners.delete(callback);
    };
  },

  // Notify all listeners for a key
  notify(key, value) {
    if (listeners.has(key)) {
      listeners.get(key).forEach(callback => {
        try {
          callback(value);
        } catch (e) {
          console.error('Error in sharedState listener:', e);
        }
      });
    }
  },

  // Remove item
  remove(key) {
    store.delete(key);
    this.notify(key, null);
  },

  // Clear all data (call on room leave)
  clear() {
    store.clear();
    listeners.clear();
  }
};

export default sharedState;
