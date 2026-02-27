// Shared state management for cross-tab and same-tab communication
// This solves the issue where localStorage events don't fire in the same tab

const listeners = new Map();

export const sharedState = {
  // Set value and notify all listeners (same tab + other tabs via localStorage)
  set(key, value) {
    // Save to localStorage (for other tabs)
    localStorage.setItem(key, JSON.stringify(value));
    
    // Notify same-tab listeners
    this.notify(key, value);
    
    // Also dispatch storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: JSON.stringify(value)
    }));
  },

  // Get value from localStorage
  get(key, defaultValue = null) {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  },

  // Subscribe to changes
  subscribe(key, callback) {
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      listeners.get(key).delete(callback);
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
    localStorage.removeItem(key);
    this.notify(key, null);
  }
};

// Also listen to real storage events (from other tabs)
window.addEventListener('storage', (e) => {
  if (e.newValue) {
    try {
      const value = JSON.parse(e.newValue);
      sharedState.notify(e.key, value);
    } catch (e) {
      sharedState.notify(e.key, e.newValue);
    }
  }
});

export default sharedState;
