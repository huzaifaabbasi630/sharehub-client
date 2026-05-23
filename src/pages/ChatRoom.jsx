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
      position: relative;
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
      transition: transform 0.3s ease;
      z-index: 50;
    }

    /* ── Main chat column ── */
    .cr-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg);
      position: relative;
      min-width: 0;
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

    /* ── Mobile Sidebar Drawer ── */
    @media (max-width: 1023px) {
      .cr-sidebar-wrap {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 300;
        transform: translateX(-100%);
        box-shadow: 4px 0 32px rgba(0,0,0,0.6);
      }
      .cr-sidebar-wrap.open {
        transform: translateX(0);
      }
      .cr-sidebar-overlay {
        display: block;
      }
    }
    @media (min-width: 1024px) {
      .cr-sidebar-wrap {
        position: relative;
        transform: none !important;
      }
      .cr-sidebar-overlay {
        display: none !important;
      }
    }

    /* Mobile overlay backdrop */
    .cr-sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(3,5,15,0.7);
      backdrop-filter: blur(4px);
      z-index: 299;
    }

    /* ── Responsive toast stack ── */
    @media (max-width: 640px) {
      .cr-toast-stack {
        top: auto !important;
        bottom: 80px;
        right: 8px !important;
        left: 8px;
        max-width: 100% !important;
      }
    }

    /* ── Feature buttons bar scroll ── */
    .cr-feature-bar {
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .cr-feature-bar::-webkit-scrollbar { height: 0; }
    .cr-feature-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border: none;
      border-radius: 20px;
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.2s;
    }
    .cr-feature-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  `}</style>
);

function ChatRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { emit, on, off, socket } = useSocket();
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
    setMessageList([]);
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
  const [callInvite, setCallInvite] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [attendanceRequest, setAttendanceRequest] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]); // Master list for creator
  const [creatorNotifications, setCreatorNotifications] = useState([]); // Toast list for creator notifications

  // AI Feature States
  const [smartReplies, setSmartReplies] = useState({}); // { messageId: [replies] }
  const [chatSummary, setChatSummary] = useState(null);
  const [isImproving, setIsImproving] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({}); // { messageId: translatedContent }
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [improvedText, setImprovedText] = useState('');

  useEffect(() => {
    on('improved_message_result', (data) => {
      setImprovedText(data.improved);
      setIsImproving(false);
      // Clear after a moment so it can be triggered again with same text if needed
      setTimeout(() => setImprovedText(''), 100);
    });

    console.log('ChatRoom useEffect triggered, roomCode:', roomCode);
    console.log('Current watermarkText state:', watermarkText);

    // Check if security settings exist
    const existingSettings = sharedState.get(`sharehub_secure_${roomCode}`);
    console.log('Existing security settings:', existingSettings);

    // Room/user data should come from React context (in-memory), not localStorage
    if (!room || !user) {
      // No context data, redirect to home
      navigate('/');
      return;
    }



    emit('join_room', { roomCode: roomCode.toUpperCase(), userName: user.name, isHost });

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
                expiryTime = timeValue * 60 * 1000;
            }
          }

          if (expiryTime) {
            console.log('Setting up auto-delete timer for', expiryTime, 'ms');
            setTimeout(() => {
              console.log('Auto-deleting messages for room:', roomCode);
              setMessageList([]);
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

    // No localStorage event listeners needed - using in-memory sharedState only

    const loadMessages = async () => {
      try {
        // Fetch messages from server only
        const response = await getMessages(room._id);
        if (response.success && response.messages) {
          setMessageList(response.messages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();

    on('joined_room', (data) => console.log('Joined room:', data));
    on('user_joined', (data) => {
      console.log('User joined:', data);
      // Normalize participant data - ensure name field exists
      const normalizedData = {
        ...data,
        name: data.name || data.userName || 'Unknown User'
      };
      addParticipant(normalizedData);
    });
    on('user_left', (data) => removeParticipant(data.socketId));
    on('new_message', (message) => addMessage(message));
    on('user_typing', (data) => setTypingStatus(data.userName, data.isTyping));
    on('incoming_call', (data) => {
      console.log('Incoming call notification:', data);
      setCallInvite(data);
      // Auto-hide after 30s
      setTimeout(() => setCallInvite(null), 30000);
    });
    on('call_ended', () => setCallInvite(null));

    // ── Education Mode Handlers ──
    on('incoming_quiz', (quiz) => {
      console.log('Incoming Quiz:', quiz);
      setActiveQuiz(quiz);
    });

    on('quiz_response_received', (data) => {
      // Creator collects student answers
      if (isHost) {
        setCreatorNotifications(prev => [
          ...prev,
          { id: Date.now() + Math.random(), type: 'quiz', userName: data.userName, answer: data.optionIndex, ts: new Date() }
        ]);
        setTimeout(() => setCreatorNotifications(curr => curr.slice(1)), 5000);
      }

      setActiveQuiz(prev => {
        if (!prev) return null;
        return {
          ...prev,
          responses: {
            ...prev.responses,
            [data.userName]: data.optionIndex
          }
        };
      });
    });

    on('attendance_request', (data) => {
      // Students see the request
      if (!isHost && (data.targetName === user?.name || !data.targetName)) {
        setAttendanceRequest({ ...data, id: data.id || Date.now() });
        // Timeout for "Not Responding" - if not responded in 45s
        setTimeout(() => {
          setAttendanceRequest(prev => {
            if (prev && prev.id === data.id) {
              // Notify creator that user didn't respond? 
              // Actually the creator can just check the list after X seconds.
              return null;
            }
            return prev;
          });
        }, 45000);
      }
    });

    on('attendance_response', (data) => {
      // Host shows a notification toast
      if (isHost) {
        const toastId = Math.random();
        setCreatorNotifications(prev => [...prev, { id: toastId, type: 'attendance', userName: data.userName, status: data.status }]);
        setTimeout(() => setCreatorNotifications(curr => curr.filter(n => n.id !== toastId)), 5000);
      }

      // Update verified status for everyone
      setAttendanceList(prev => prev.map(a =>
        a.name === data.userName ? { ...a, status: data.status, confirmed: true } : a
      ));
    });

    on('error', (error) => console.error('Socket error:', error));

    on('ai_smart_replies', (data) => {
      setSmartReplies(prev => ({ ...prev, [data.messageId]: data.replies }));
    });

    on('chat_summary_result', (data) => {
      setChatSummary(data.summary);
      setIsSummarizing(false);
    });

    on('improved_message_result', (data) => {
      setIsImproving(false);
    });

    on('translated_message_result', (data) => {
      setTranslatedMessages(prev => ({ ...prev, [data.originalText]: data.translated }));
    });

    // Listen for security settings broadcast from creator
    const handleSecurityBroadcast = (data) => {
      if (data.roomCode === roomCode.toUpperCase()) {
        // Update in-memory sharedState
        sharedState.set(`sharehub_secure_${roomCode}`, data.settings);
        if (data.settings.watermarkText) setWatermarkText(data.settings.watermarkText);
        if (data.settings.watermarkSize) setWatermarkSize(data.settings.watermarkSize);
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
      off('call_ended');
      off('ai_smart_replies');
      off('chat_summary_result');
      off('improved_message_result');
      off('translated_message_result');
      off('error');
      off('security_auto_delete', handleAutoDelete);
      off('security_settings_broadcast', handleSecurityBroadcast);
      unsubscribeScreenshots();
      unsubscribeJoinRequests();
      unsubscribeSecurity();
    };
  }, [room, user, roomCode, isHost, emit, on, off, navigate,
    addParticipant, removeParticipant, addMessage, setMessageList, setTypingStatus, joinRequestToasts]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // (No localStorage persistence for messages — server is source of truth)

  const handleSendMessage = (content, type = 'text', fileUrl = null, fileName = null) => {
    if (!content.trim() && !fileUrl) return;
    emit('send_message', {
      roomId: room._id || roomCode,
      roomCode: roomCode.toUpperCase(),
      senderId: socket?.id || user.name,
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
      roomId: room._id || roomCode,
      roomCode: roomCode.toUpperCase(),
      callerId: socket?.id || 'unknown',
      callerName: user.name,
      callType: type,
      isHost: isHost
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="cr-spinner" />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: 'var(--muted)' }}>
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

        {/* ── Toast Notifications Stack (Calls & Requests) ── */}
        <div className="cr-toast-stack" style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '350px',
        }}>
          {/* Incoming Call Notification */}
          {callInvite && (
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              border: '2px solid #38e8c4',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(56,232,196,0.2)',
              animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Pulse effect background */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(56,232,196,0.1)', animation: 'glow-pulse 2s infinite' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38e8c4, #4f8ef7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', border: '2px solid rgba(255,255,255,0.1)'
                }}>
                  {callInvite.callType === 'video' ? '📹' : '📞'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: '#38e8c4', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Incoming {callInvite.callType === 'video' ? 'Video' : 'Voice'} Call
                  </p>
                  <p style={{ margin: '2px 0 0', color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                    {callInvite.isHost ? 'Creator' : (callInvite.callerName || 'Someone')} is calling...
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setCallType(callInvite.callType);
                    setShowCallPanel(true);
                    setCallInvite(null);
                  }}
                  style={{
                    flex: 2,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>✔️</span> Attend
                </button>
                <button
                  onClick={() => setCallInvite(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px',
                    color: '#f87171',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* ── Global Attendance Check Toast ── */}
          {attendanceRequest && (
            <div style={{
              background: 'linear-gradient(135deg, #064e3b, #065f46)',
              border: '2px solid #34d399',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              animation: 'slideIn 0.4s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📋</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#34d399', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Attendance Check</h4>
                  <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: '600' }}>Confirm your presence</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    emit('attendance_response', {
                      roomCode: roomCode.toUpperCase(),
                      userName: user.name,
                      status: 'present'
                    });
                    setAttendanceRequest(null);
                  }}
                  style={{ flex: 1, padding: '12px', background: '#34d399', border: 'none', borderRadius: '12px', color: '#064e3b', fontWeight: '800', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  PRESENT
                </button>
                <button
                  onClick={() => {
                    emit('attendance_response', {
                      roomCode: roomCode.toUpperCase(),
                      userName: user.name,
                      status: 'absent'
                    });
                    setAttendanceRequest(null);
                  }}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid #34d399', borderRadius: '12px', color: '#34d399', fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  ABSENT
                </button>
              </div>
              <p style={{ margin: '12px 0 0', color: 'rgba(52,211,153,0.5)', fontSize: '10px', textAlign: 'center', fontWeight: '500' }}>Auto-set to "Not Responding" in 45s</p>
            </div>
          )}

          {/* ── Global Live Quiz Toast ── */}
          {activeQuiz && !activeQuiz.responses?.[user?.name] && (
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              border: '2px solid #a78bfa',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 30px rgba(167,139,250,0.15)',
              animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: '10px', right: '15px', color: '#a78bfa', fontSize: '20px' }}>📝</div>
              <h4 style={{ margin: '0 0 10px', color: '#a78bfa', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Live Class Quiz</h4>
              <p style={{ margin: '0 0 16px', color: '#fff', fontSize: '15px', fontWeight: '600', lineHeight: 1.4 }}>{activeQuiz.question}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                {activeQuiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedQuizOption(idx)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedQuizOption === idx ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)',
                      background: selectedQuizOption === idx ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      textAlign: 'left',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s transform active:scale-95'
                    }}
                  >
                    <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#a78bfa' }}>{String.fromCharCode(65 + idx)}.</span> {opt}
                  </button>
                ))}
              </div>

              <button
                disabled={selectedQuizOption === null}
                onClick={() => {
                  if (selectedQuizOption === null) return;
                  emit('submit_quiz_answer', {
                    roomCode: roomCode.toUpperCase(),
                    userName: user.name,
                    optionIndex: selectedQuizOption
                  });
                  // Mark as responded locally to hide
                  setActiveQuiz(prev => ({
                    ...prev,
                    responses: { ...(prev.responses || {}), [user.name]: selectedQuizOption }
                  }));
                  setSelectedQuizOption(null);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: selectedQuizOption === null ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: selectedQuizOption === null ? '#94a3b8' : '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: selectedQuizOption === null ? 'default' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {selectedQuizOption === null ? 'Select an Answer' : 'Submit Answer'}
              </button>
            </div>
          )}

          {/* ── Creator Response Notifications ── */}
          {isHost && creatorNotifications.map((toast) => (
            <div
              key={toast.id}
              onClick={() => {
                setCreatorNotifications(prev => prev.filter(n => n.id !== toast.id));
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: `1.5px solid ${toast.type === 'quiz' ? '#a78bfa' : '#34d399'}`,
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                animation: 'slideIn 0.3s ease-out',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: toast.type === 'quiz' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
              }}>
                {toast.type === 'quiz' ? '✅' : '👋'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: '700' }}>
                  {toast.userName}
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '500' }}>
                  {toast.type === 'quiz'
                    ? `Answered: Option ${String.fromCharCode(65 + (toast.answer || 0))}`
                    : `Marked: ${toast.status?.toUpperCase()}`}
                </p>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>×</div>
              {/* Progress Bar for Auto-hide */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, height: '2px', background: toast.type === 'quiz' ? '#a78bfa' : '#34d399',
                width: '100%', animation: 'progress 5s linear forwards'
              }} />
            </div>
          ))}

          {/* Join Request Toasts */}
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

        {/* ── Top Bar ── */}
        <div className="cr-topbar-wrap">
          <TopBar
            roomName={room.name}
            participantsCount={participants.length + 1}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            onStartVideoCall={() => handleStartCall('video')}
            onStartVoiceCall={() => handleStartCall('voice')}
            onLeaveRoom={handleLeaveRoom}
            onShowAIAssistant={() => setShowAIAssistant(true)}
          />

          {/* AI Feature Buttons */}
          <div className="cr-feature-bar">
            <button className="cr-feature-btn" onClick={() => setShowAIAssistant(true)} style={{ background: 'linear-gradient(135deg, #4f8ef7, #6a5af7)' }}>🤖 AI Assistant</button>
            <button className="cr-feature-btn" onClick={() => setShowFileOrganizer(true)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>📁 Files</button>
            <button className="cr-feature-btn" onClick={() => setShowEducationMode(true)} style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>🎓 Education</button>
            <button className="cr-feature-btn" onClick={() => setShowSecureRoom(true)} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>🔐 Secure</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cr-body">

          {/* Mobile sidebar overlay backdrop */}
          {showSidebar && (
            <div
              className="cr-sidebar-overlay"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Sidebar — desktop: inline, mobile: drawer */}
          <div className={`cr-sidebar-wrap${showSidebar ? ' open' : ''}`}>
            <Sidebar
              participants={participants}
              currentUser={user}
              isHost={isHost}
              roomCode={roomCode}
              onApproveRequest={(request) => {
                emit('approve_join_request', { roomCode, userId: request.userId, userName: request.userName });
              }}
              onRejectRequest={(request) => {
                emit('reject_join_request', { roomCode, userId: request.userId });
              }}
            />
          </div>

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
                smartReplies={smartReplies}
                onSendSmartReply={(reply) => handleSendMessage(reply)}
                translatedMessages={translatedMessages}
                onTranslate={(text, lang) => emit('translate_message', { text, targetLang: lang })}
              />
            </div>

            <div className="cr-input-wrap">
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                isImproving={isImproving}
                onImprove={(text) => {
                  setIsImproving(true);
                  emit('improve_message', { text });
                }}
                improvedText={improvedText}
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
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        messages={messages}
        onSummarize={() => {
          setIsSummarizing(true);
          emit('summarize_chat', { messages: messages.slice(-20) }); // Summarize last 20 messages
        }}
        onAssistantQuery={(query) => {
          emit('ai_assistant_query', {
            roomCode: roomCode.toUpperCase(),
            query,
            chatHistory: messages.slice(-5),
            roomId: room._id || roomCode
          });
        }}
        chatSummary={chatSummary}
        isSummarizing={isSummarizing}
        onVoiceToText={(lang = 'en-US') => {
          // Check for Speech Recognition support
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = lang;
            recognition.start();
            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript;
              handleSendMessage(`🎙️ [Voice-AI]: ${transcript}`);
              setShowAIAssistant(false);
            };
          } else {
            alert('Speech recognition is not supported in this browser.');
          }
        }}
        onImageGenerate={(prompt) => {
          handleSendMessage(`/image ${prompt}`);
          setShowAIAssistant(false);
        }}
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
        isHost={isHost}
        roomCode={roomCode}
        externalAttendance={attendanceList}
        setExternalAttendance={setAttendanceList}
        externalActiveQuiz={activeQuiz}
        setExternalActiveQuiz={setActiveQuiz}
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