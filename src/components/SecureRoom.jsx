import { useState, useEffect } from 'react';
import { sharedState } from '../utils/sharedState';
import { useSocket } from '../context/SocketContext';

const SecureRoom = ({ isVisible, onClose, roomCode, isHost, currentUser }) => {
  const { emit } = useSocket();
  const [securitySettings, setSecuritySettings] = useState({
    selfDestructFiles: false,
    screenshotDetection: false,
    oneTimeLinks: false,
    messageExpiry: 'never', // 'never', '1hour', '24hours', '7days'
    watermarkEnabled: false,
    downloadRestriction: false
  });

  const [activeAlerts, setActiveAlerts] = useState([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [showLink, setShowLink] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [customExpiryTime, setCustomExpiryTime] = useState(''); // For custom self-destruct time
  const [watermarkText, setWatermarkText] = useState(''); // For custom watermark text
  const [watermarkSize, setWatermarkSize] = useState('9xl'); // For custom watermark size (default: text-9xl)

  useEffect(() => {
    // Load saved settings using sharedState
    const saved = sharedState.get(`sharehub_secure_${roomCode}`, null);
    if (saved) {
      // Remove internal timestamp before setting state
      const { _timestamp, ...settingsWithoutTimestamp } = saved;
      setSecuritySettings(settingsWithoutTimestamp);
    }

    // Subscribe to settings changes (works in same tab and across tabs)
    const unsubscribeSettings = sharedState.subscribe(`sharehub_secure_${roomCode}`, (newSettings) => {
      if (newSettings) {
        // Remove internal timestamp before setting state
        const { _timestamp, ...settingsWithoutTimestamp } = newSettings;
        setSecuritySettings(settingsWithoutTimestamp);
      }
    });

    // Subscribe to join requests changes
    const unsubscribeRequests = sharedState.subscribe(`sharehub_join_requests_${roomCode}`, () => {
      if (isHost) {
        loadJoinRequests();
      }
    });

    // Initial load of join requests
    if (isHost) {
      loadJoinRequests();
    }

    return () => {
      unsubscribeSettings();
      unsubscribeRequests();
    };
  }, [roomCode, isHost]);

  useEffect(() => {
    // Screenshot detection - works for all users when enabled by creator
    if (securitySettings.screenshotDetection) {
      const handleKeyDown = (e) => {
        // Detect common screenshot shortcuts
        if (
          (e.key === 'PrintScreen') ||
          (e.ctrlKey && e.key === 'p') ||
          (e.metaKey && e.shiftKey && e.key === '3') ||
          (e.metaKey && e.shiftKey && e.key === '4') ||
          (e.metaKey && e.shiftKey && e.key === '5')
        ) {
          e.preventDefault();

          // Report screenshot with user name
          const screenshotData = {
            userName: currentUser?.name || 'Unknown User',
            timestamp: new Date().toISOString(),
            roomCode
          };

          // Save to sharedState for creator to see
          const reports = sharedState.get(`sharehub_screenshots_${roomCode}`, []);
          reports.push(screenshotData);
          sharedState.set(`sharehub_screenshots_${roomCode}`, reports);

          // Show alert locally
          addAlert('screenshot', `${currentUser?.name} took a screenshot!`);

          // Note: Screenshot notification is now handled by sharedState subscription in ChatRoom
          // All members (including creator) will receive the notification automatically
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [securitySettings.screenshotDetection, currentUser, roomCode]);

  const loadJoinRequests = () => {
    const requests = sharedState.get(`sharehub_join_requests_${roomCode}`, []);
    setJoinRequests(requests.filter(r => r.status === 'pending'));
  };

  const addAlert = (type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setActiveAlerts(prev => [alert, ...prev].slice(0, 10));

    // Auto remove after 5 seconds
    setTimeout(() => {
      setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 5000);
  };

  const saveSettings = () => {
    // Use sharedState to save and notify all subscribers (same tab + other tabs)
    // Add timestamp to track when settings were changed
    const settingsWithTimestamp = {
      ...securitySettings,
      customExpiryTime,
      watermarkText,
      watermarkSize, // Add watermark size
      _timestamp: Date.now()
    };
    console.log('Saving security settings:', settingsWithTimestamp);

    // Save to sharedState
    sharedState.set(`sharehub_secure_${roomCode}`, settingsWithTimestamp);
    console.log('Settings saved to sharedState');

    // Also save directly to localStorage to ensure persistence
    localStorage.setItem(`sharehub_secure_${roomCode}`, JSON.stringify(settingsWithTimestamp));
    console.log('Settings also saved to localStorage directly');

    // Verify it was saved
    const verify = localStorage.getItem(`sharehub_secure_${roomCode}`);
    console.log('Verification - localStorage contains:', verify);

    // Set up file self-destruct if enabled
    if (securitySettings.selfDestructFiles) {
      const files = sharedState.get(`sharehub_files_${roomCode}`, []);

      // Handle custom expiry time
      let expiryTime = null;
      if (customExpiryTime && customExpiryTime.trim()) {
        // Parse custom time (e.g., "30m", "2h", "1d")
        const timeValue = parseInt(customExpiryTime);
        const timeUnit = customExpiryTime.replace(/\d+/g, '').toLowerCase();

        if (timeValue && timeUnit) {
          switch (timeUnit) {
            case 'm':
            case 'min':
            case 'mins':
              expiryTime = timeValue * 60 * 1000;
              break;
            case 'h':
            case 'hr':
            case 'hrs':
              expiryTime = timeValue * 60 * 60 * 1000;
              break;
            case 'd':
            case 'day':
            case 'days':
              expiryTime = timeValue * 24 * 60 * 60 * 1000;
              break;
            default:
              expiryTime = timeValue * 60 * 1000; // Default to minutes
          }
        }
      } else {
        // Use preset times
        expiryTime = securitySettings.messageExpiry === '1hour' ? 60 * 60 * 1000 :
          securitySettings.messageExpiry === '24hours' ? 24 * 60 * 60 * 1000 :
            securitySettings.messageExpiry === '7days' ? 7 * 24 * 60 * 60 * 1000 : null;
      }

      if (expiryTime) {
        // Set expiry for files
        files.forEach(file => {
          file.expiresAt = Date.now() + expiryTime;
        });
        sharedState.set(`sharehub_files_${roomCode}`, files);

        // Also delete messages after the same time
        const messages = sharedState.get(`sharehub_messages_${roomCode}`, []);
        if (messages.length > 0) {
          // Schedule message deletion
          setTimeout(() => {
            sharedState.remove(`sharehub_messages_${roomCode}`);
            // Notify all users
            emit('security_auto_delete', {
              roomCode,
              type: 'messages',
              timestamp: new Date().toISOString()
            });
          }, expiryTime);
        }
      }
    }

    // Emit socket event to broadcast settings change to ALL users
    const settingsList = [];
    if (securitySettings.selfDestructFiles) settingsList.push('Self-Destruct Files');
    if (securitySettings.screenshotDetection) settingsList.push('Screenshot Detection');
    if (securitySettings.watermarkEnabled) settingsList.push('Screen Watermark');
    if (securitySettings.downloadRestriction) settingsList.push('Download Restriction');

    const messageContent = settingsList.length > 0
      ? `🔐 Security settings updated: ${settingsList.join(', ')} are now ENABLED`
      : '🔐 Security settings updated: All protections disabled';

    // Send system message to all users
    const systemMessage = {
      _id: `security_${Date.now()}`,
      sender: 'System',
      content: messageContent,
      timestamp: new Date().toISOString(),
      type: 'system'
    };

    emit('new_message', systemMessage);

    // Broadcast raw settings to ALL connected users via Socket.io
    emit('security_settings_broadcast', {
      roomCode: roomCode.toUpperCase(), // Ensure consistent room code
      settings: settingsWithTimestamp,
      timestamp: new Date().toISOString()
    });

    console.log('Broadcasting security settings to all users via Socket.io');

    alert('Security settings saved and synced to all members!');
    onClose();
  };

  const generateOneTimeLink = () => {
    const token = btoa(`${roomCode}_${Date.now()}_${Math.random()}`).replace(/[^a-zA-Z0-9]/g, '');
    const link = `${window.location.origin}/join?code=${roomCode}&token=${token}&oneTime=true`;

    // Save token
    const tokens = JSON.parse(localStorage.getItem(`sharehub_onetime_${roomCode}`) || '[]');
    tokens.push({ token, used: false, createdAt: new Date().toISOString() });
    localStorage.setItem(`sharehub_onetime_${roomCode}`, JSON.stringify(tokens));

    setGeneratedLink(link);
    setShowLink(true);
    setLinkCopied(false);
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleApproveRequest = (request) => {
    // Update request status using sharedState
    const requests = sharedState.get(`sharehub_join_requests_${roomCode}`, []);
    const updatedRequests = requests.map(r =>
      r.requestId === request.requestId
        ? { ...r, status: 'approved' }
        : r
    );
    sharedState.set(`sharehub_join_requests_${roomCode}`, updatedRequests);

    // Remove from displayed requests
    setJoinRequests(prev => prev.filter(r => r.requestId !== request.requestId));

    alert(`Approved ${request.userName} to join the room!`);
  };

  const handleRejectRequest = (request) => {
    // Update request status using sharedState
    const requests = sharedState.get(`sharehub_join_requests_${roomCode}`, []);
    const updatedRequests = requests.map(r =>
      r.requestId === request.requestId
        ? { ...r, status: 'rejected' }
        : r
    );
    sharedState.set(`sharehub_join_requests_${roomCode}`, updatedRequests);

    // Remove from displayed requests
    setJoinRequests(prev => prev.filter(r => r.requestId !== request.requestId));

    alert(`Rejected ${request.userName}'s request.`);
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete all messages and files in this room. Are you sure?')) {
      localStorage.removeItem(`sharehub_messages_${roomCode}`);
      localStorage.removeItem(`sharehub_files_${roomCode}`);
      localStorage.removeItem(`sharehub_secure_${roomCode}`);
      addAlert('destruct', 'All data has been securely destroyed!');
      window.location.reload();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔐</span>
              <div>
                <h2 className="text-xl font-bold">Secure Room Settings</h2>
                <p className="text-sm opacity-80">Enterprise-grade security features</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
          </div>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 p-4 space-y-2">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="flex items-center gap-2 text-red-700 animate-pulse">
                <span>🚨</span>
                <span className="text-sm font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Read-only banner for non-creators */}
        {!isHost && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <p className="text-blue-700 text-sm flex items-center gap-2">
              <span>👁️</span>
              <strong>View Only:</strong> Only the room creator can edit security settings.
              Current settings are synced across all members.
            </p>
          </div>
        )}

        {/* Join Requests Section - Only for Creator */}
        {isHost && joinRequests.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <span>📋</span> Pending Join Requests ({joinRequests.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {joinRequests.map((request) => (
                <div key={request.requestId} className="bg-white p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{request.userName}</p>
                    <p className="text-xs text-gray-500">Via link • {new Date(request.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(request)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Security Options */}
          <div className="space-y-4">
            {/* Self-Destruct Files */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${isHost ? 'bg-gray-50' : 'bg-gray-100'}`}>
              <div>
                <h3 className="font-semibold text-gray-800">💥 Self-Destruct Files</h3>
                <p className="text-sm text-gray-500">Files auto-delete after specified time</p>
                {!isHost && securitySettings.selfDestructFiles && (
                  <span className="text-xs text-green-600 font-medium">✓ Enabled by creator</span>
                )}
              </div>
              <label className={`relative inline-flex items-center ${isHost ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <input
                  type="checkbox"
                  checked={securitySettings.selfDestructFiles}
                  onChange={(e) => isHost && setSecuritySettings({ ...securitySettings, selfDestructFiles: e.target.checked })}
                  disabled={!isHost}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${securitySettings.selfDestructFiles ? 'bg-red-600 after:translate-x-full' : 'bg-gray-300'
                  } ${isHost ? 'peer-focus:ring-4 peer-focus:ring-red-300' : ''}`}></div>
              </label>
            </div>

            {/* Expiry Time - Only show if enabled */}
            {(securitySettings.selfDestructFiles && isHost) && (
              <div className="ml-4 p-4 bg-red-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">File Expiry Time</label>
                <select
                  value={securitySettings.messageExpiry}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, messageExpiry: e.target.value })}
                  className="w-full border rounded-lg p-2 mb-3"
                >
                  <option value="1hour">⏱️ 1 Hour</option>
                  <option value="24hours">📅 24 Hours</option>
                  <option value="7days">📆 7 Days</option>
                  <option value="never">♾️ Never (Manual only)</option>
                </select>

                <label className="block text-sm font-medium text-gray-700 mb-2">Or Custom Time</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customExpiryTime}
                    onChange={(e) => setCustomExpiryTime(e.target.value)}
                    placeholder="e.g., 30m, 2h, 1d"
                    className="flex-1 border rounded-lg p-2 text-sm"
                  />
                  <span className="text-xs text-gray-500 self-center">m=minutes, h=hours, d=days</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Note: Custom time will also auto-delete room chats</p>
              </div>
            )}

            {/* Screenshot Detection */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${isHost ? 'bg-gray-50' : 'bg-gray-100'}`}>
              <div>
                <h3 className="font-semibold text-gray-800">📸 Screenshot Detection</h3>
                <p className="text-sm text-gray-500">Alert when someone tries to take screenshots</p>
                {!isHost && securitySettings.screenshotDetection && (
                  <span className="text-xs text-green-600 font-medium">✓ Enabled by creator - You're being monitored</span>
                )}
              </div>
              <label className={`relative inline-flex items-center ${isHost ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <input
                  type="checkbox"
                  checked={securitySettings.screenshotDetection}
                  onChange={(e) => isHost && setSecuritySettings({ ...securitySettings, screenshotDetection: e.target.checked })}
                  disabled={!isHost}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${securitySettings.screenshotDetection ? 'bg-orange-600 after:translate-x-full' : 'bg-gray-300'
                  } ${isHost ? 'peer-focus:ring-4 peer-focus:ring-orange-300' : ''}`}></div>
              </label>
            </div>

            {/* One-Time Access Links - Available to all */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">🔗 One-Time Access Links</h3>
                  <p className="text-sm text-gray-500">Generate single-use invite links (Anyone can generate, only creator approves)</p>
                </div>
                <button
                  onClick={generateOneTimeLink}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Generate Link
                </button>
              </div>

              {generatedLink && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <label className="text-xs text-gray-500 mb-1 block">Share this link:</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showLink ? "text" : "password"}
                        value={generatedLink}
                        readOnly
                        className="w-full px-3 py-2 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                      />
                      <button
                        onClick={() => setShowLink(!showLink)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title={showLink ? "Hide link" : "Show link"}
                      >
                        {showLink ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M12 12l-4.242-4.242" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <button
                      onClick={copyLink}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${linkCopied
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      {linkCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Watermark */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${isHost ? 'bg-gray-50' : 'bg-gray-100'}`}>
              <div>
                <h3 className="font-semibold text-gray-800">💧 Screen Watermark</h3>
                <p className="text-sm text-gray-500">Add user ID watermark to deter leaks</p>
                {!isHost && securitySettings.watermarkEnabled && (
                  <span className="text-xs text-green-600 font-medium">✓ Enabled by creator</span>
                )}
              </div>
              <label className={`relative inline-flex items-center ${isHost ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <input
                  type="checkbox"
                  checked={securitySettings.watermarkEnabled}
                  onChange={(e) => isHost && setSecuritySettings({ ...securitySettings, watermarkEnabled: e.target.checked })}
                  disabled={!isHost}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${securitySettings.watermarkEnabled ? 'bg-blue-600 after:translate-x-full' : 'bg-gray-300'
                  } ${isHost ? 'peer-focus:ring-4 peer-focus:ring-blue-300' : ''}`}></div>
              </label>
            </div>

            {/* Watermark Text Input - Only show if enabled and creator */}
            {(securitySettings.watermarkEnabled && isHost) && (
              <div className="ml-4 p-4 bg-blue-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter custom watermark text (e.g., CONFIDENTIAL)"
                  className="w-full border rounded-lg p-2 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">This text will appear as a watermark on the chat screen</p>

                <label className="block text-sm font-medium text-gray-700 mt-3 mb-2">Watermark Size</label>
                <select
                  value={watermarkSize}
                  onChange={(e) => setWatermarkSize(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="4xl">4XL (Small)</option>
                  <option value="5xl">5XL</option>
                  <option value="6xl">6XL</option>
                  <option value="7xl">7XL</option>
                  <option value="8xl">8XL</option>
                  <option value="9xl">9XL (Default)</option>
                  <option value="10xl">10XL</option>
                  <option value="11xl">11XL</option>
                  <option value="12xl">12XL (Large)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Adjust the size of the watermark text</p>
              </div>
            )}

            {/* Download Restriction */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-800">⛔ Download Restriction</h3>
                <p className="text-sm text-gray-500">Prevent file downloads (view only)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.downloadRestriction}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, downloadRestriction: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          {isHost && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">
                These actions cannot be undone. All data will be permanently deleted.
              </p>
              <button
                onClick={clearAllData}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
              >
                🗑️ Destroy All Room Data
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Room: {roomCode}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              {isHost ? 'Cancel' : 'Close'}
            </button>
            {isHost && (
              <button
                onClick={saveSettings}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:opacity-90"
              >
                💾 Save Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureRoom;
