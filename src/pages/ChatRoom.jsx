import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';
import { getMessages } from '../services/api';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import MessageInput from '../components/MessageInput';
import CallPanel from '../components/CallPanel';
import DraggableRefreshButton from '../components/DraggableRefreshButton';
import AIWorkAssistant from '../components/AIWorkAssistant';
import SmartFileOrganizer from '../components/SmartFileOrganizer';
import EducationMode from '../components/EducationMode';
import SecureRoom from '../components/SecureRoom';
import { sharedState } from '../utils/sharedState';

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* Toast animations */
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    :root {
      --bg:        #03050f;
      --surface:   #070c1b;
      --surface2:  #0a1020;
      --border:    rgba(255,255,255,0.06);
      --accent1:   #4f8ef7;
      --accent2:   #38e8c4;
      --text:      #eef2ff;
      --muted:     #4a5578;
      --text-dim:  rgba(238,242,255,0.55);
    }

    html, body, #root {
      height: 100%;
      background: var(--bg);
      font-family: 'DM Sans', sans-serif;
    }

    /* ── Layout shell ── */
    .cr-shell {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg);
      overflow: hidden;
    }

    /* ── TopBar override zone ── */
    .cr-topbar-wrap {
      flex-shrink: 0;
      background: rgba(7,12,27,0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 24px rgba(0,0,0,0.4);
    }

    /* ── Body row ── */
    .cr-body {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    /* ── Sidebar override zone ── */
    .cr-sidebar-wrap {
      width: 240px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Main chat column ── */
    .cr-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg);
      position: relative;
    }

    /* Subtle dot grid on chat bg */
    .cr-main::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(79,142,247,0.07) 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
      z-index: 0;
    }

    /* ── ChatBox override zone ── */
    .cr-chatbox-wrap {
      flex: 1;
      overflow-y: auto;
      position: relative;
      z-index: 1;
      scroll-behavior: smooth;
    }

    /* Scrollbar */
    .cr-chatbox-wrap::-webkit-scrollbar { width: 4px; }
    .cr-chatbox-wrap::-webkit-scrollbar-track { background: transparent; }
    .cr-chatbox-wrap::-webkit-scrollbar-thumb {
      background: rgba(79,142,247,0.2);
      border-radius: 4px;
    }
    .cr-chatbox-wrap::-webkit-scrollbar-thumb:hover {
      background: rgba(79,142,247,0.35);
    }

    /* ── MessageInput override zone ── */
    .cr-input-wrap {
      flex-shrink: 0;
      background: rgba(7,12,27,0.9);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--border);
      position: relative;
      z-index: 1;
    }

    /* ── CallPanel overlay ── */
    .cr-call-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(3,5,15,0.88);
      backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ── Loading / null state ── */
    .cr-null {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes glow-pulse {
      0%,100% { opacity: 0.4; }
      50%      { opacity: 1; }
    }

    .cr-spinner {
      width: 40px; height: 40px;
      border: 2.5px solid rgba(79,142,247,0.15);
      border-top-color: #4f8ef7;
      border-radius: 50%;
      animation: spin 0.85s linear infinite;
    }

    /* ── Responsive sidebar hide ── */
    @media (max-width: 640px) {
      .cr-sidebar-wrap { display: none; }
    }
  `}</style>
);

function ChatRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { emit, on, off } = useSocket();
  const {
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
    clearRoom,
  } = useRoom();

  // Clear messages when room changes to prevent showing previous room's chat
  useEffect(() => {
    // Clear both React state and localStorage for this room
    setMessageList([]);
    localStorage.removeItem(`sharehub_messages_${roomCode}`);
  }, [roomCode, setMessageList]);

  const [showCallPanel, setShowCallPanel] = useState(false);
  const [callType, setCallType] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Feature states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showFileOrganizer, setShowFileOrganizer] = useState(false);
  const [showEducationMode, setShowEducationMode] = useState(false);
  const [showSecureRoom, setShowSecureRoom] = useState(false);
  const [sharedFiles, setSharedFiles] = useState([]);
  
  // Join request toast notifications
  const [joinRequestToasts, setJoinRequestToasts] = useState([]);
  
  // Security features
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkSize, setWatermarkSize] = useState('9xl'); // Default size
  const [showAutoDeleteToast, setShowAutoDeleteToast] = useState(false);

  useEffect(() => {
    console.log('ChatRoom useEffect triggered, roomCode:', roomCode);
    console.log('Current watermarkText state:', watermarkText);
    
    // Check if security settings exist
    const existingSettings = sharedState.get(`sharehub_secure_${roomCode}`);
    console.log('Existing security settings:', existingSettings);
    
    // Try to restore room/user from localStorage if context is empty
    if (!room || !user) {
      const savedRoom = localStorage.getItem('sharehub_current_room');
      const savedUser = localStorage.getItem('sharehub_current_user');
      
      if (savedRoom && savedUser) {
        try {
          const roomData = JSON.parse(savedRoom);
          const userData = JSON.parse(savedUser);
          
          // Only restore if the saved room matches current URL
          if (roomData.code === roomCode) {
            setRoomData(roomData);
            setUserData(userData.name, userData.isHost);
            return; // Don't navigate away, data restored
          }
        } catch (e) {
          console.error('Error restoring room data:', e);
        }
      }
      
      // No saved data or mismatch, redirect to home
      navigate('/');
      return;
    }

    if (!isHost) {
      const history = JSON.parse(localStorage.getItem('sharehub_room_history') || '[]');
      const existingIndex = history.findIndex(r => r.code === roomCode);
      const roomEntry = {
        code: roomCode,
        name: room.name,
        joinedAt: new Date().toISOString(),
      };
      if (existingIndex >= 0) {
        history[existingIndex] = roomEntry;
      } else {
        history.unshift(roomEntry);
      }
      localStorage.setItem('sharehub_room_history', JSON.stringify(history.slice(0, 10)));
    }

    emit('join_room', { roomCode, userName: user.name, isHost });

    // Listen for screenshot detections (for ALL members)
    const unsubscribeScreenshots = sharedState.subscribe(`sharehub_screenshots_${roomCode}`, (reports) => {
      if (reports && reports.length > 0) {
        const latestReport = reports[reports.length - 1];
        // Only show if it's a new report (within last 5 seconds)
        const reportTime = new Date(latestReport.timestamp).getTime();
        const now = Date.now();
        if (now - reportTime < 5000) {
          // Show toast notification to ALL members
          const toastMessage = {
            _id: `screenshot_${Date.now()}`,
            sender: 'System',
            content: `🚨 ${latestReport.userName} took a screenshot!`,
            timestamp: new Date().toISOString(),
            type: 'system'
          };
          addMessage(toastMessage);
          
          // Show visual toast for 5 seconds
          if (isHost) {
            setShowAutoDeleteToast(true);
            setTimeout(() => {
              setShowAutoDeleteToast(false);
            }, 5000);
          }
        }
      }
    });

    // Listen for join requests (for ALL members - shows toast notification)
    const unsubscribeJoinRequests = sharedState.subscribe(`sharehub_join_requests_${roomCode}`, (requests) => {
      if (requests && requests.length > 0) {
        // Find the most recent pending request
        const pendingRequests = requests.filter(r => r.status === 'pending');
        if (pendingRequests.length > 0) {
          const latestRequest = pendingRequests[pendingRequests.length - 1];
          const requestTime = new Date(latestRequest.timestamp).getTime();
          const now = Date.now();
          
          // Only show if it's a new request (within last 5 seconds)
          if (now - requestTime < 5000) {
            // Check if this toast is already showing
            const existingToast = joinRequestToasts.find(t => t.requestId === latestRequest.requestId);
            if (!existingToast) {
              const newToast = {
                requestId: latestRequest.requestId,
                userName: latestRequest.userName,
                timestamp: latestRequest.timestamp,
                isHost: isHost
              };
              setJoinRequestToasts(prev => [...prev, newToast]);
              
              // Auto-remove after 4 seconds
              setTimeout(() => {
                setJoinRequestToasts(prev => prev.filter(t => t.requestId !== latestRequest.requestId));
              }, 4000);
            }
          }
        }
      }
    });

    // Listen for security auto-delete notifications
    const handleAutoDelete = (data) => {
      if (data.roomCode === roomCode) {
        setShowAutoDeleteToast(true);
        // Add system message
        const systemMessage = {
          _id: `auto_delete_${Date.now()}`,
          sender: 'System',
          content: `🔒 ${data.type === 'messages' ? 'All chat messages' : 'Files'} have been automatically deleted for security`,
          timestamp: new Date().toISOString(),
          type: 'system'
        };
        addMessage(systemMessage);
        
        // Auto-remove toast after 5 seconds
        setTimeout(() => {
          setShowAutoDeleteToast(false);
        }, 5000);
      }
    };
    
    on('security_auto_delete', handleAutoDelete);

    // Load security settings for all users (watermark, etc.)
    const loadSecuritySettings = () => {
      console.log('Loading security settings for room:', roomCode);
      
      // Try sharedState first
      let settings = sharedState.get(`sharehub_secure_${roomCode}`);
      console.log('Found security settings from sharedState:', settings);
      
      // If not found, try direct localStorage
      if (!settings) {
        const localStorageData = localStorage.getItem(`sharehub_secure_${roomCode}`);
        console.log('Checking localStorage directly:', localStorageData);
        if (localStorageData) {
          try {
            settings = JSON.parse(localStorageData);
            console.log('Parsed settings from localStorage:', settings);
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
          }
        }
      }
      
      if (settings) {
        if (settings.watermarkText) {
          console.log('Setting watermark text:', settings.watermarkText);
          setWatermarkText(settings.watermarkText);
        }
        if (settings.watermarkSize) {
          console.log('Setting watermark size:', settings.watermarkSize);
          setWatermarkSize(settings.watermarkSize);
        }
        // Set up auto-delete timer for all users
        if (settings.selfDestructFiles && settings.customExpiryTime) {
          const timeValue = parseInt(settings.customExpiryTime);
          const timeUnit = settings.customExpiryTime.replace(/\d+/g, '').toLowerCase();
              
          let expiryTime = null;
          if (timeValue && timeUnit) {
            switch(timeUnit) {
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
                expiryTime = timeValue * 60 * 1000;
            }
          }
              
          if (expiryTime) {
            console.log('Setting up auto-delete timer for', expiryTime, 'ms');
            // Schedule message deletion for all users
            setTimeout(() => {
              console.log('Auto-deleting messages for room:', roomCode);
              localStorage.removeItem(`sharehub_messages_${roomCode}`);
              // Reload messages to clear the UI
              const savedMessages = localStorage.getItem(`sharehub_messages_${roomCode}`);
              if (savedMessages) {
                try {
                  const parsedMessages = JSON.parse(savedMessages);
                  setMessageList(parsedMessages);
                } catch (e) {
                  setMessageList([]);
                }
              } else {
                setMessageList([]);
              }
            }, expiryTime);
          }
        }
      }
    };
        
    // Call the function immediately
    loadSecuritySettings();
        
    // Also call it after a small delay to ensure sharedState is ready
    setTimeout(() => {
      console.log('Retrying security settings load...');
      loadSecuritySettings();
    }, 1000);
    
    // Periodic check every 3 seconds for the first 30 seconds
    const interval = setInterval(() => {
      console.log('Periodic security settings check...');
      loadSecuritySettings();
    }, 3000);
    
    // Clear interval after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
    }, 30000);
    
    // Subscribe to security settings changes for all users
    const unsubscribeSecurity = sharedState.subscribe(`sharehub_secure_${roomCode}`, (newSettings) => {
      console.log('Received security settings update via sharedState:', newSettings);
      if (newSettings) {
        if (newSettings.watermarkText) {
          console.log('Updating watermark text from subscription:', newSettings.watermarkText);
          setWatermarkText(newSettings.watermarkText);
        }
        // Handle other security settings changes
      }
    });
    
    // Also listen for direct localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === `sharehub_secure_${roomCode}`) {
        console.log('Detected localStorage change for security settings:', e.newValue);
        if (e.newValue) {
          try {
            const settings = JSON.parse(e.newValue);
            if (settings.watermarkText) {
              console.log('Updating watermark from storage event:', settings.watermarkText);
              setWatermarkText(settings.watermarkText);
            }
          } catch (err) {
            console.error('Error parsing storage event data:', err);
          }
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('storage', handleStorageChange);
    };

    const loadMessages = async () => {
      try {
        // First load saved messages from localStorage to preserve chats
        const savedMessages = localStorage.getItem(`sharehub_messages_${roomCode}`);
        if (savedMessages) {
          try {
            const parsedMessages = JSON.parse(savedMessages);
            setMessageList(parsedMessages);
          } catch (e) {
            console.error('Error parsing saved messages:', e);
          }
        }
        
        // Then fetch from server and merge
        const response = await getMessages(room._id);
        if (response.success && response.messages) {
          const serverMessages = response.messages;
          const currentMessages = JSON.parse(localStorage.getItem(`sharehub_messages_${roomCode}`) || '[]');
          
          // Merge server messages with local, avoiding duplicates
          const existingIds = new Set(currentMessages.map(m => m._id || m.id || m.timestamp));
          const newMessages = serverMessages.filter(m => !existingIds.has(m._id || m.id || m.timestamp));
          
          if (newMessages.length > 0) {
            const mergedMessages = [...currentMessages, ...newMessages];
            mergedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessageList(mergedMessages);
            localStorage.setItem(`sharehub_messages_${roomCode}`, JSON.stringify(mergedMessages));
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();

    on('joined_room',   (data) => console.log('Joined room:', data));
    on('user_joined',   (data) => {
      console.log('User joined:', data);
      // Normalize participant data - ensure name field exists
      const normalizedData = {
        ...data,
        name: data.name || data.userName || 'Unknown User'
      };
      addParticipant(normalizedData);
    });
    on('user_left',     (data) => removeParticipant(data.socketId));
    on('new_message',   (message) => addMessage(message));
    on('user_typing',   (data) => setTypingStatus(data.userName, data.isTyping));
    on('incoming_call', (data) => { setCallType(data.callType); setShowCallPanel(true); });
    on('error',         (error) => console.error('Socket error:', error));
    
    // Listen for security settings broadcast from creator
    const handleSecurityBroadcast = (data) => {
      console.log('Received security settings broadcast:', data);
      if (data.roomCode === roomCode.toUpperCase()) {
        console.log('Applying broadcasted security settings:', data.settings);
        // Save to local storage
        localStorage.setItem(`sharehub_secure_${roomCode}`, JSON.stringify(data.settings));
        // Update state
        if (data.settings.watermarkText) {
          console.log('Setting watermark from broadcast:', data.settings.watermarkText);
          setWatermarkText(data.settings.watermarkText);
        }
        if (data.settings.watermarkSize) {
          console.log('Setting watermark size from broadcast:', data.settings.watermarkSize);
          setWatermarkSize(data.settings.watermarkSize);
        }
        // Also update sharedState for consistency
        sharedState.set(`sharehub_secure_${roomCode}`, data.settings);
      }
    };
    
    on('security_settings_broadcast', handleSecurityBroadcast);

    return () => {
      off('joined_room');
      off('user_joined');
      off('user_left');
      off('new_message');
      off('user_typing');
      off('incoming_call');
      off('error');
      off('security_auto_delete', handleAutoDelete);
      off('security_settings_broadcast', handleSecurityBroadcast);
      unsubscribeScreenshots();
      unsubscribeJoinRequests();
      unsubscribeSecurity();
      cleanup(); // Remove storage event listener
    };
  }, [room, user, roomCode, isHost, emit, on, off, navigate,
      addParticipant, removeParticipant, addMessage, setMessageList, setTypingStatus, joinRequestToasts]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && roomCode) {
      localStorage.setItem(`sharehub_messages_${roomCode}`, JSON.stringify(messages));
    }
  }, [messages, roomCode]);

  const handleSendMessage = (content, type = 'text', fileUrl = null, fileName = null) => {
    if (!content.trim() && !fileUrl) return;
    emit('send_message', {
      roomId: room._id,
      roomCode,
      senderId: user.socketId || 'unknown',
      senderName: user.name,
      content, type, fileUrl, fileName,
    });
  };

  const handleTyping = (isTyping) => {
    emit('typing', { roomCode, userName: user.name, isTyping });
  };

  const handleStartCall = (type) => {
    setCallType(type);
    setShowCallPanel(true);
    emit('start_call', {
      roomId: room._id,
      roomCode,
      callerId: user.socketId || 'unknown',
      callerName: user.name,
      callType: type,
    });
  };

  const handleEndCall = () => {
    setShowCallPanel(false);
    setCallType(null);
  };

  const handleLeaveRoom = () => {
    clearRoom();
    navigate('/');
  };

  // Handle join request approval (creator only)
  const handleApproveJoinRequest = (requestId) => {
    const requests = sharedState.get(`sharehub_join_requests_${roomCode}`, []);
    const request = requests.find(r => r.requestId === requestId);
    if (request) {
      const updatedRequests = requests.map(r => 
        r.requestId === requestId ? { ...r, status: 'approved' } : r
      );
      sharedState.set(`sharehub_join_requests_${roomCode}`, updatedRequests);
      
      // Remove from toasts
      setJoinRequestToasts(prev => prev.filter(t => t.requestId !== requestId));
      
      // Add system message
      const systemMessage = {
        _id: `approve_${Date.now()}`,
        sender: 'System',
        content: `✅ ${request.userName} has been approved to join the room`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      addMessage(systemMessage);
    }
  };

  // Handle join request rejection (creator only)
  const handleRejectJoinRequest = (requestId) => {
    const requests = sharedState.get(`sharehub_join_requests_${roomCode}`, []);
    const request = requests.find(r => r.requestId === requestId);
    if (request) {
      const updatedRequests = requests.map(r => 
        r.requestId === requestId ? { ...r, status: 'rejected' } : r
      );
      sharedState.set(`sharehub_join_requests_${roomCode}`, updatedRequests);
      
      // Remove from toasts
      setJoinRequestToasts(prev => prev.filter(t => t.requestId !== requestId));
      
      // Add system message
      const systemMessage = {
        _id: `reject_${Date.now()}`,
        sender: 'System',
        content: `❌ ${request.userName}'s join request was rejected`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      addMessage(systemMessage);
    }
  };

  /* ── null guard ── */
  if (!room || !user) {
    return (
      <>
        <S />
        <div className="cr-null">
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
            <div className="cr-spinner" />
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'14px', color:'var(--muted)' }}>
              Connecting to room…
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <S />

      <div className="cr-shell">
        
        {/* ── Join Request Toast Notifications ── */}
        {joinRequestToasts.length > 0 && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '350px',
          }}>
            {joinRequestToasts.map((toast) => (
              <div
                key={toast.requestId}
                style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: '1px solid rgba(79,142,247,0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                  animation: 'slideIn 0.3s ease-out',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f8ef7, #6a5af7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    👤
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#fff', fontWeight: '600', fontSize: '14px' }}>
                      Join Request
                    </p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                      <strong style={{ color: '#4f8ef7' }}>{toast.userName}</strong> wants to join
                    </p>
                  </div>
                </div>
                
                {toast.isHost ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApproveJoinRequest(toast.requestId)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => handleRejectJoinRequest(toast.requestId)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'rgba(239,68,68,0.2)',
                        border: '1px solid rgba(239,68,68,0.4)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#64748b', fontSize: '12px', textAlign: 'center' }}>
                    Waiting for room creator to approve...
                  </p>
                )}
                
                {/* Progress bar for auto-dismiss */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'rgba(79,142,247,0.2)',
                  borderRadius: '0 0 12px 12px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: '100%',
                    background: 'linear-gradient(90deg, #4f8ef7, #38e8c4)',
                    animation: 'progress 4s linear forwards',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Top Bar ── */}
        <div className="cr-topbar-wrap">
          <TopBar
            roomName={room.name}
            participantsCount={participants.length + 1}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            onStartVideoCall={() => handleStartCall('video')}
            onStartVoiceCall={() => handleStartCall('voice')}
            onLeaveRoom={handleLeaveRoom}
          />
          
          {/* AI Feature Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
          }}>
            <button
              onClick={() => setShowAIAssistant(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #4f8ef7, #6a5af7)',
                border: 'none',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🤖 AI Assistant
            </button>
            <button
              onClick={() => setShowFileOrganizer(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              📁 File Organizer
            </button>
            <button
              onClick={() => setShowEducationMode(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                border: 'none',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🎓 Education
            </button>
            <button
              onClick={() => setShowSecureRoom(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🔐 Secure Room
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cr-body">

          {/* Sidebar */}
          {showSidebar && (
            <div className="cr-sidebar-wrap">
              <Sidebar
                participants={participants}
                currentUser={user}
                isHost={isHost}
                roomCode={roomCode}
                onApproveRequest={(request) => {
                  // Emit socket event to notify user
                  emit('approve_join_request', { 
                    roomCode, 
                    userId: request.userId,
                    userName: request.userName 
                  });
                }}
                onRejectRequest={(request) => {
                  emit('reject_join_request', { 
                    roomCode, 
                    userId: request.userId 
                  });
                }}
              />
            </div>
          )}

          {/* Chat column */}
          <div className="cr-main">
            <div className="cr-chatbox-wrap">
              <ChatBox
                messages={messages}
                currentUser={user}
                typingUsers={typingUsers}
                messagesEndRef={messagesEndRef}
                watermarkText={watermarkText}
                watermarkSize={watermarkSize}
              />
            </div>

            <div className="cr-input-wrap">
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
              />
            </div>
          </div>
        </div>

        {/* ── Call Panel overlay ── */}
        {showCallPanel && (
          <div className="cr-call-overlay">
            <CallPanel
              roomCode={roomCode}
              callType={callType}
              onClose={handleEndCall}
            />
          </div>
        )}

      </div>
      
      {/* Refresh Button - only show when not in call */}
      {!showCallPanel && (
        <DraggableRefreshButton 
          onRefresh={async () => {
            // Refresh messages - merge with existing to avoid deletion
            try {
              const response = await getMessages(roomCode);
              if (response.success && response.messages) {
                // Merge new messages with existing ones, avoiding duplicates
                const existingIds = new Set(messages.map(m => m._id || m.id || m.timestamp));
                const newMessages = response.messages.filter(m => !existingIds.has(m._id || m.id || m.timestamp));
                if (newMessages.length > 0) {
                  // Add only new messages to existing list
                  const mergedMessages = [...messages, ...newMessages];
                  // Sort by timestamp
                  mergedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                  setMessageList(mergedMessages);
                }
              }
            } catch (error) {
              console.error('Failed to refresh messages:', error);
            }
          }}
          cooldown={2500}
        />
      )}
      
      {/* AI Work Assistant Modal */}
      <AIWorkAssistant
        messages={messages}
        roomName={room?.name || roomCode}
        isVisible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
      
      {/* Smart File Organizer Modal */}
      <SmartFileOrganizer
        files={sharedFiles}
        onOrganize={(organized) => {
          console.log('Files organized:', organized);
          // Handle file organization
        }}
        isVisible={showFileOrganizer}
        onClose={() => setShowFileOrganizer(false)}
      />
      
      {/* Education Mode Modal */}
      <EducationMode
        isActive={showEducationMode}
        onToggle={() => setShowEducationMode(!showEducationMode)}
        messages={messages}
        participants={participants}
        currentUser={user}
      />
      
      {/* Secure Room Modal */}
      <SecureRoom
        isVisible={showSecureRoom}
        onClose={() => setShowSecureRoom(false)}
        roomCode={roomCode}
        isHost={isHost}
        currentUser={user}
        // Callbacks are now handled by sharedState subscriptions in useEffect
        // No need to pass onSettingChange or onScreenshotDetected
      />
      
      {/* Auto-delete Toast Notification */}
      {showAutoDeleteToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slideIn">
            <div className="text-2xl">🔒</div>
            <div>
              <p className="font-bold">Security Alert</p>
              <p className="text-sm opacity-90">Room content has been automatically deleted</p>
            </div>
            <div className="w-1 h-16 bg-white bg-opacity-30 rounded-full ml-2">
              <div className="w-full h-full bg-white rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatRoom;