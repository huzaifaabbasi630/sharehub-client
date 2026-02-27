import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';
import {
  getLocalStream,
  createPeerConnection,
  createOffer,
  createAnswer,
  handleAnswer,
  handleIceCandidate,
  closeAllPeerConnections,
  toggleAudio,
  toggleVideo
} from '../services/webrtc';

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes glow-pulse {
      0%,100% { opacity: 0.5; } 50% { opacity: 1; }
    }
    @keyframes ping {
      0%   { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(2); opacity: 0; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .cp-shell {
      position: fixed; inset: 0; z-index: 50;
      background: #03050f;
      display: flex; flex-direction: column;
      animation: fadeIn 0.3s ease;
      font-family: 'DM Sans', sans-serif;
    }

    /* ── Video grid ── */
    .cp-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
      padding: 16px;
      overflow: hidden;
      position: relative;
    }

    /* Dot grid overlay on bg */
    .cp-grid::before {
      content: '';
      position: absolute; inset: 0;
      background-image: radial-gradient(rgba(79,142,247,0.07) 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
    }

    .cp-video-tile {
      position: relative;
      background: linear-gradient(145deg, #080e22, #050a18);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 20px;
      overflow: hidden;
      animation: slideUp 0.4s ease;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }

    .cp-video-tile video {
      width: 100%; height: 100%;
      object-fit: cover; display: block;
    }

    /* Avatar fallback */
    .cp-avatar-fallback {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(145deg, #080e22, #050a18);
    }
    .cp-avatar-circle {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, #4f8ef7, #6a5af7);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 28px; font-weight: 800; color: #fff;
      box-shadow: 0 0 32px rgba(79,142,247,0.4);
      position: relative;
    }
    .cp-avatar-circle::before {
      content: '';
      position: absolute; inset: -4px;
      border-radius: 50%;
      background: rgba(79,142,247,0.15);
      animation: ping 2s ease-out infinite;
    }

    /* Name tag */
    .cp-name-tag {
      position: absolute; bottom: 14px; left: 14px;
      background: rgba(3,5,15,0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 5px 12px;
      display: flex; align-items: center; gap: 7px;
    }
    .cp-name-tag span {
      font-family: 'DM Sans', sans-serif;
      font-size: 12.5px; font-weight: 500;
      color: rgba(238,242,255,0.85);
    }

    /* Muted badge on tile */
    .cp-muted-badge {
      position: absolute; top: 12px; right: 12px;
      background: rgba(239,68,68,0.85);
      backdrop-filter: blur(6px);
      border-radius: 20px; padding: 4px 10px;
      display: flex; align-items: center; gap: 5px;
    }
    .cp-muted-badge span {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px; color: #fff; font-weight: 500;
    }

    /* ── Controls bar ── */
    .cp-controls {
      flex-shrink: 0;
      background: rgba(7,12,27,0.95);
      backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 18px 24px;
      display: flex; align-items: center; justify-content: center;
      gap: 14px;
    }

    /* Control button base */
    .cp-ctrl-btn {
      width: 54px; height: 54px; border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s;
      background: rgba(255,255,255,0.06);
      color: rgba(238,242,255,0.8);
      position: relative;
    }
    .cp-ctrl-btn:hover {
      transform: translateY(-2px);
      background: rgba(255,255,255,0.1);
      color: #eef2ff;
    }
    .cp-ctrl-btn.active {
      background: rgba(239,68,68,0.18);
      border-color: rgba(239,68,68,0.35);
      color: #f87171;
    }
    .cp-ctrl-btn.active:hover {
      background: rgba(239,68,68,0.28);
    }

    /* End call button */
    .cp-end-btn {
      width: 62px; height: 62px; border-radius: 50%;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: #fff;
      box-shadow: 0 0 28px rgba(239,68,68,0.5);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cp-end-btn:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 0 40px rgba(239,68,68,0.7);
    }

    /* Tooltip label */
    .cp-label {
      position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%);
      font-family: 'DM Sans', sans-serif;
      font-size: 10.5px; color: rgba(148,163,184,0.5);
      white-space: nowrap; pointer-events: none;
    }

    /* Call type pill top */
    .cp-call-pill {
      position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
      background: rgba(3,5,15,0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; padding: 6px 16px;
      display: flex; align-items: center; gap: 8px;
      z-index: 10;
    }
    .cp-call-pill-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #38e8c4;
      animation: glow-pulse 2s ease-in-out infinite;
    }
    .cp-call-pill span {
      font-family: 'DM Sans', sans-serif;
      font-size: 12.5px; color: rgba(238,242,255,0.7); font-weight: 500;
    }
  `}</style>
);

function CallPanel({ roomCode, callType, onClose }) {
  const { emit, on, off } = useSocket();
  const { user } = useRoom();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());

  useEffect(() => {
    const initCall = async () => {
      try {
        const stream = await getLocalStream(callType === 'video', callType !== 'voice');
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        emit('join_call', { roomCode, userId: user.socketId || 'unknown', userName: user.name });
      } catch (error) {
        console.error('Error initializing call:', error);
      }
    };
    initCall();

    on('user_joined_call', (data) => {
      console.log('User joined call:', data);
      initiatePeerConnection(data.userId);
    });

    on('webrtc_offer', async (data) => {
      const { offer, senderId } = data;
      const pc = createPeerConnection(
        senderId,
        (peerId, stream) => handleRemoteStream(peerId, stream),
        (peerId, candidate) => emit('webrtc_ice_candidate', { targetId: peerId, candidate, senderId: user.socketId })
      );
      if (localStream) localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      const answer = await createAnswer(senderId, offer);
      emit('webrtc_answer', { targetId: senderId, answer, senderId: user.socketId });
    });

    on('webrtc_answer', (data) => handleAnswer(data.senderId, data.answer));
    on('webrtc_ice_candidate', (data) => handleIceCandidate(data.senderId, data.candidate));
    on('user_left_call', (data) => setRemoteStreams(prev => prev.filter(s => s.userId !== data.userId)));

    return () => {
      closeAllPeerConnections();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      off('user_joined_call');
      off('webrtc_offer');
      off('webrtc_answer');
      off('webrtc_ice_candidate');
      off('user_left_call');
    };
  }, [roomCode, callType, user, emit, on, off]);

  const initiatePeerConnection = async (peerId) => {
    const pc = createPeerConnection(
      peerId,
      (id, stream) => handleRemoteStream(id, stream),
      (id, candidate) => emit('webrtc_ice_candidate', { targetId: peerId, candidate, senderId: user.socketId })
    );
    if (localStream) localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    const offer = await createOffer(peerId);
    emit('webrtc_offer', { targetId: peerId, offer, senderId: user.socketId });
  };

  const handleRemoteStream = (peerId, stream) => {
    setRemoteStreams(prev => {
      const existing = prev.find(s => s.userId === peerId);
      if (existing) return prev.map(s => s.userId === peerId ? { ...s, stream } : s);
      return [...prev, { userId: peerId, stream }];
    });
  };

  const handleToggleMute = () => {
    toggleAudio(!isMuted);
    setIsMuted(!isMuted);
    emit('mute_audio', { roomCode, userId: user.socketId, muted: !isMuted });
  };

  const handleToggleVideo = () => {
    toggleVideo(!isVideoOff);
    setIsVideoOff(!isVideoOff);
    emit('disable_video', { roomCode, userId: user.socketId, disabled: !isVideoOff });
  };

  const handleEndCall = () => {
    emit('leave_call', { roomCode, userId: user.socketId });
    emit('end_call', { roomCode, userId: user.socketId });
    closeAllPeerConnections();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    onClose();
  };

  return (
    <>
      <S />
      <div className="cp-shell">

        {/* Video grid */}
        <div className="cp-grid">

          {/* Call type pill */}
          <div className="cp-call-pill">
            <div className="cp-call-pill-dot" />
            <span>{callType === 'video' ? 'Video Call' : 'Voice Call'} · Live</span>
          </div>

          {/* Local tile */}
          <div className="cp-video-tile">
            {!isVideoOff ? (
              <video ref={localVideoRef} autoPlay muted playsInline />
            ) : (
              <div className="cp-avatar-fallback">
                <div className="cp-avatar-circle">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            <div className="cp-name-tag">
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#38e8c4', flexShrink:0 }} />
              <span>You{isMuted ? ' · Muted' : ''}</span>
            </div>

            {isMuted && (
              <div className="cp-muted-badge">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"/>
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
                  <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                <span>Muted</span>
              </div>
            )}
          </div>

          {/* Remote tiles */}
          {remoteStreams.map((remoteStream, index) => (
            <div key={remoteStream.userId} className="cp-video-tile">
              <video
                ref={el => {
                  if (el) {
                    el.srcObject = remoteStream.stream;
                    remoteVideoRefs.current.set(remoteStream.userId, el);
                  }
                }}
                autoPlay
                playsInline
              />
              <div className="cp-name-tag">
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#4f8ef7', flexShrink:0 }} />
                <span>Participant {index + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Controls bar */}
        <div className="cp-controls">

          {/* Mute */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'22px' }}>
            <button className={`cp-ctrl-btn${isMuted ? ' active' : ''}`} onClick={handleToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"/>
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
                  <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/>
                  <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
              <span className="cp-label">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>

          {/* Video toggle */}
          {callType === 'video' && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'22px' }}>
              <button className={`cp-ctrl-btn${isVideoOff ? ' active' : ''}`} onClick={handleToggleVideo} title={isVideoOff ? 'Start Video' : 'Stop Video'}>
                {isVideoOff ? (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34"/>
                    <path d="M23 7l-7 5 7 5V7z"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                )}
                <span className="cp-label">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
              </button>
            </div>
          )}

          {/* Spacer */}
          <div style={{ width:'16px' }} />

          {/* End call */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'22px' }}>
            <button className="cp-end-btn" onClick={handleEndCall} title="End Call">
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.42 19.42 0 013.43 9.88 19.79 19.79 0 01.36 1.25 2 2 0 012.34 3h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.32 10.9a16 16 0 004.36 2.41z"/>
                <line x1="23" y1="1" x2="1" y2="23"/>
              </svg>
              <span className="cp-label" style={{ color:'rgba(239,68,68,0.6)' }}>End</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default CallPanel;