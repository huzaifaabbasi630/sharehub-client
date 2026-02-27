import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ping {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes glow-pulse {
      0%,100% { opacity: 0.5; } 50% { opacity: 1; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .sb-wrap {
      width: 240px;
      flex-shrink: 0;
      background: linear-gradient(180deg, #070c1b 0%, #060a18 100%);
      border-right: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'DM Sans', sans-serif;
    }

    /* Header */
    .sb-header {
      padding: 18px 16px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
    }
    .sb-header-title {
      font-family: 'Syne', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: rgba(238,242,255,0.85);
      letter-spacing: -0.3px;
      margin-bottom: 3px;
    }
    .sb-header-sub {
      font-size: 12px;
      color: rgba(148,163,184,0.4);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sb-online-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #38e8c4;
      animation: glow-pulse 2s ease-in-out infinite;
    }

    /* Scroll area */
    .sb-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 10px 8px;
    }
    .sb-scroll::-webkit-scrollbar { width: 3px; }
    .sb-scroll::-webkit-scrollbar-track { background: transparent; }
    .sb-scroll::-webkit-scrollbar-thumb {
      background: rgba(79,142,247,0.15);
      border-radius: 4px;
    }

    /* Section label */
    .sb-section-label {
      font-size: 10px;
      font-weight: 600;
      color: rgba(148,163,184,0.3);
      text-transform: uppercase;
      letter-spacing: 1.4px;
      padding: 8px 8px 6px;
    }

    /* Participant row */
    .sb-participant {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 12px;
      transition: background 0.2s;
      animation: slideIn 0.3s ease;
      cursor: default;
    }
    .sb-participant.me {
      background: rgba(79,142,247,0.08);
      border: 1px solid rgba(79,142,247,0.12);
    }
    .sb-participant.other:hover {
      background: rgba(255,255,255,0.03);
    }

    /* Avatar */
    .sb-avatar {
      position: relative;
      flex-shrink: 0;
    }
    .sb-avatar-circle {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 14px; font-weight: 800; color: #fff;
    }
    .sb-avatar-circle.me {
      background: linear-gradient(135deg, #4f8ef7, #6a5af7);
      box-shadow: 0 0 14px rgba(79,142,247,0.35);
    }
    .sb-avatar-circle.other {
      background: linear-gradient(135deg, #38e8c4, #4f8ef7);
    }

    /* Online status dot */
    .sb-status {
      position: absolute;
      bottom: -1px; right: -1px;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #22c55e;
      border: 2px solid #070c1b;
    }

    /* Name + role */
    .sb-info { flex: 1; min-width: 0; }
    .sb-name {
      font-size: 13.5px;
      font-weight: 500;
      color: rgba(238,242,255,0.85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sb-role {
      font-size: 11px;
      color: rgba(148,163,184,0.4);
      margin-top: 1px;
    }
    .sb-role.me { color: #4f8ef7; }
    .sb-role.host { color: #38e8c4; }

    /* Host crown badge */
    .sb-crown {
      flex-shrink: 0;
      color: #f59e0b;
    }

    /* Divider */
    .sb-divider {
      height: 1px;
      background: rgba(255,255,255,0.04);
      margin: 10px 8px;
    }

    /* Join requests section */
    .sb-requests-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px 8px;
    }
    .sb-requests-label {
      font-family: 'Syne', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: rgba(238,242,255,0.65);
    }
    .sb-requests-badge {
      background: rgba(251,191,36,0.15);
      border: 1px solid rgba(251,191,36,0.25);
      border-radius: 20px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      color: #fbbf24;
    }

    /* Request card */
    .sb-request-card {
      background: rgba(251,191,36,0.05);
      border: 1px solid rgba(251,191,36,0.15);
      border-radius: 12px;
      padding: 10px;
      margin-bottom: 8px;
      animation: fadeUp 0.3s ease;
    }
    .sb-req-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 12px; font-weight: 800; color: #fff;
      flex-shrink: 0;
    }
    .sb-req-name {
      font-size: 13px; font-weight: 500;
      color: rgba(238,242,255,0.8);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sb-req-sub {
      font-size: 11px;
      color: rgba(148,163,184,0.4);
      margin-top: 1px;
    }

    /* Request action buttons */
    .sb-req-btns { display: flex; gap: 6px; margin-top: 8px; }
    .sb-req-accept {
      flex: 1; padding: 6px;
      background: rgba(34,197,94,0.12);
      border: 1px solid rgba(34,197,94,0.25);
      border-radius: 8px;
      color: #4ade80;
      font-family: 'Syne', sans-serif;
      font-size: 12px; font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 4px;
    }
    .sb-req-accept:hover {
      background: rgba(34,197,94,0.2);
      border-color: rgba(34,197,94,0.4);
    }
    .sb-req-reject {
      flex: 1; padding: 6px;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
      color: #f87171;
      font-family: 'Syne', sans-serif;
      font-size: 12px; font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 4px;
    }
    .sb-req-reject:hover {
      background: rgba(239,68,68,0.16);
      border-color: rgba(239,68,68,0.35);
    }

    /* Footer */
    .sb-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.04);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .sb-footer-logo {
      width: 18px; height: 18px; border-radius: 5px;
      background: linear-gradient(135deg, #4f8ef7, #6a5af7);
      display: flex; align-items: center; justify-content: center;
    }
    .sb-footer-text {
      font-family: 'Syne', sans-serif;
      font-size: 11px; font-weight: 700;
      color: rgba(148,163,184,0.25);
      letter-spacing: 0.3px;
    }
  `}</style>
);

function Sidebar({ participants, currentUser, isHost, roomCode, onApproveRequest, onRejectRequest }) {
  const [joinRequests, setJoinRequests] = useState([]);
  const { on, off, emit } = useSocket();

  // Listen for join requests - works for both CreateRoom and Sidebar
  useEffect(() => {
    if (isHost && roomCode) {
      console.log('Sidebar: Setting up join request listener for room:', roomCode);
      console.log('Sidebar: isHost=', isHost, 'roomCode=', roomCode);
      
      const handleJoinRequest = (data) => {
        console.log('Sidebar received join request:', data);
        // Normalize data format (server sends requesterName, we need userName)
        const normalizedData = {
          ...data,
          userName: data.userName || data.requesterName || 'Unknown',
          requesterName: data.requesterName || data.userName || 'Unknown'
        };
        setJoinRequests(prev => {
          if (prev.find(r => r.requestId === normalizedData.requestId)) return prev;
          return [...prev, normalizedData];
        });
      };
      
      // Also listen for requests sent via one-time links
      const handleOneTimeRequest = (data) => {
        console.log('Sidebar received one-time link request:', data);
        handleJoinRequest(data);
      };
      
      on('join_request_received', handleJoinRequest);
      on('one_time_join_request', handleOneTimeRequest);
      
      return () => { 
        console.log('Sidebar: Cleaning up join request listener');
        off('join_request_received', handleJoinRequest); 
        off('one_time_join_request', handleOneTimeRequest);
      };
    } else {
      console.log('Sidebar: NOT setting up listener - isHost=', isHost, 'roomCode=', roomCode);
    }
  }, [isHost, roomCode, on, off]);

  const handleApprove = (request) => {
    emit('approve_join', {
      requestId: request.requestId,
      requesterId: request.requesterId,
      roomCode,
      requesterName: request.requesterName || request.userName,
    });
    setJoinRequests(prev => prev.filter(r => r.requestId !== request.requestId));
    if (onApproveRequest) onApproveRequest(request);
  };

  const handleReject = (request) => {
    emit('reject_join', {
      requestId: request.requestId,
      requesterId: request.requesterId,
    });
    setJoinRequests(prev => prev.filter(r => r.requestId !== request.requestId));
    if (onRejectRequest) onRejectRequest(request);
  };

  const totalCount = participants.length + 1;

  return (
    <>
      <S />
      <div className="sb-wrap">

        {/* Header */}
        <div className="sb-header">
          <p className="sb-header-title">Participants</p>
          <div className="sb-header-sub">
            <div className="sb-online-dot" />
            {totalCount} online
          </div>
        </div>

        {/* Scroll area */}
        <div className="sb-scroll">
          <p className="sb-section-label">In this room</p>

          {/* Current user */}
          <div className="sb-participant me">
            <div className="sb-avatar">
              <div className="sb-avatar-circle me">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="sb-status" />
            </div>
            <div className="sb-info">
              <p className="sb-name">{currentUser.name}</p>
              <p className={`sb-role ${isHost ? 'host' : 'me'}`}>
                {isHost ? '★ Room Creator' : 'You'}
              </p>
            </div>
            {isHost && (
              <div className="sb-crown">
                <svg width="14" height="14" fill="#f59e0b" viewBox="0 0 24 24">
                  <path d="M2 19l2-8 5 5 3-9 3 9 5-5 2 8H2z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Debug: Show participants count */}
          {participants.length === 0 && (
            <p style={{ color: 'rgba(148,163,184,0.4)', fontSize: '12px', padding: '10px', textAlign: 'center' }}>
              No other participants yet
            </p>
          )}

          {/* Other participants */}
          {participants.map((p, i) => (
            <div key={p.socketId || i} className="sb-participant other">
              <div className="sb-avatar">
                <div className="sb-avatar-circle other">
                  {(p.name || p.userName)?.charAt(0).toUpperCase()}
                </div>
                <div className="sb-status" />
              </div>
              <div className="sb-info">
                <p className="sb-name">{p.name || p.userName || 'Unknown'}</p>
                <p className={`sb-role ${p.isHost ? 'host' : ''}`}>
                  {p.isHost ? '★ Room Creator' : 'Joiner'}
                </p>
              </div>
              {p.isHost && (
                <div className="sb-crown">
                  <svg width="14" height="14" fill="#f59e0b" viewBox="0 0 24 24">
                    <path d="M2 19l2-8 5 5 3-9 3 9 5-5 2 8H2z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Join requests */}
          {isHost && joinRequests.length > 0 && (
            <>
              <div className="sb-divider" />
              <div className="sb-requests-header">
                <span className="sb-requests-label">Join Requests</span>
                <span className="sb-requests-badge">{joinRequests.length}</span>
              </div>
              {joinRequests.map(request => (
                <div key={request.requestId} className="sb-request-card">
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'0' }}>
                    <div className="sb-req-avatar">
                      {request.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="sb-req-name">{request.userName}</p>
                      <p className="sb-req-sub">Wants to join</p>
                    </div>
                  </div>
                  <div className="sb-req-btns">
                    <button className="sb-req-accept" onClick={() => handleApprove(request)}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Accept
                    </button>
                    <button className="sb-req-reject" onClick={() => handleReject(request)}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-footer-logo">
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span className="sb-footer-text">ShareHub</span>
        </div>

      </div>
    </>
  );
}

export default Sidebar;