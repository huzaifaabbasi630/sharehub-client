import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';
import DraggableRefreshButton from '../components/DraggableRefreshButton';

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #03050f;
      --accent1: #4f8ef7;
      --accent2: #38e8c4;
      --text:    #eef2ff;
      --muted:   #4a5578;
    }
    body { background: var(--bg); }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(22px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes glow-pulse {
      0%,100% { opacity:0.4; }
      50%      { opacity:1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes orbit {
      to { transform: rotate(360deg); }
    }
    @keyframes ping {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes dots {
      0%,20%  { content: '.'; }
      40%     { content: '..'; }
      60%,100%{ content: '...'; }
    }
    @keyframes float {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-6px); }
    }
    @keyframes shimmer {
      0%   { left: -100%; }
      100% { left: 200%; }
    }

    .w-card {
      animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
      opacity: 0;
      position: relative;
    }

    .dot-grid {
      position: absolute; inset: 0;
      background-image: radial-gradient(rgba(79,142,247,0.14) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.5;
      pointer-events: none;
    }

    .cancel-btn {
      background: none;
      border: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      color: rgba(148,163,184,0.45);
      cursor: pointer;
      text-decoration: underline;
      text-decoration-color: rgba(148,163,184,0.2);
      transition: color 0.2s;
      padding: 0;
    }
    .cancel-btn:hover { color: rgba(148,163,184,0.75); }

    /* Orbiting ring */
    .orbit-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px dashed rgba(79,142,247,0.2);
      animation: orbit 12s linear infinite;
    }
    .orbit-ring-2 {
      position: absolute;
      border-radius: 50%;
      border: 1.5px dashed rgba(56,232,196,0.15);
      animation: orbit 18s linear infinite reverse;
    }

    /* Shimmer on code */
    .code-shimmer {
      position: relative;
      overflow: hidden;
      display: inline-block;
    }
    .code-shimmer::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      width: 40%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      animation: shimmer 2.5s ease-in-out infinite;
    }

    .status-dot {
      position: relative;
      width: 10px; height: 10px; flex-shrink: 0;
    }
    .status-dot::before {
      content: '';
      position: absolute; inset: 0;
      border-radius: 50%;
      background: var(--accent2);
      animation: ping 1.8s ease-out infinite;
    }
    .status-dot::after {
      content: '';
      position: absolute; inset: 2px;
      border-radius: 50%;
      background: var(--accent2);
    }
  `}</style>
);

function Waiting() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setRoomData, setUserData } = useRoom();
  const { on, off, socket } = useSocket();

  const { roomCode, userName, requestId } = location.state || {};

  useEffect(() => {
    if (!roomCode || !userName) {
      console.log('❌ Missing roomCode or userName, redirecting to join');
      navigate('/join');
      return;
    }

    console.log('🔄 Waiting page initialized with Socket.io:', { roomCode, userName, socketId: socket?.id });

    const handleAccept = (data) => {
      console.log('✅✅✅ JOIN APPROVED via Socket.io! Data:', data);

      setRoomData({
        _id: data.roomCode || roomCode,
        code: data.roomCode || roomCode,
        name: data.roomCode || roomCode,
      });
      setUserData({ name: userName, isHost: false });

      // Store in localStorage
      localStorage.setItem('sharehub_current_room', JSON.stringify({ code: data.roomCode || roomCode }));
      localStorage.setItem('sharehub_current_user', JSON.stringify({ name: userName, isHost: false }));

      console.log('🎉🎉🎉 NAVIGATING TO ROOM:', `/room/${data.roomCode || roomCode}`);

      // Redirect to room
      setTimeout(() => {
        navigate(`/room/${data.roomCode || roomCode}`);
      }, 500);
    };

    const handleReject = (data) => {
      console.log('❌ Join request rejected via Socket.io:', data);
      alert(data.message || 'Join request rejected by room creator');
      navigate('/join');
    };

    // Listen for events
    on('join_approved', handleAccept);
    on('request-accepted', handleAccept);
    on('request_rejected', handleReject);

    // ✅ Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up Waiting page listeners...');
      off('join_approved', handleAccept);
      off('request-accepted', handleAccept);
      off('request_rejected', handleReject);
    };
  }, [roomCode, userName, navigate, setRoomData, setUserData, on, off, socket?.id]);

  return (
    <>
      <S />
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0d1639 0%, #03050f 70%)',
        padding: '24px',
      }}>
        <div className="dot-grid" />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%)', animation: 'glow-pulse 5s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-5%', right: '10%', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,232,196,0.08) 0%,transparent 70%)', animation: 'glow-pulse 5s ease-in-out infinite', animationDelay: '2.5s' }} />
        </div>

        {/* Card */}
        <div className="w-card" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>

          {/* Glow border */}
          <div style={{ position: 'absolute', inset: '-1px', borderRadius: '26px', background: 'linear-gradient(135deg,rgba(79,142,247,0.25),rgba(56,232,196,0.1),rgba(79,142,247,0.03))', zIndex: -1 }} />

          <div style={{
            background: 'linear-gradient(160deg,rgba(13,18,40,0.97),rgba(8,11,28,0.98))',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            padding: '40px 36px',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            textAlign: 'center',
          }}>

            {/* Animated clock icon with orbiting rings */}
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              {/* Outer orbit ring */}
              <div className="orbit-ring" style={{ inset: '-4px' }} />
              {/* Inner orbit ring */}
              <div className="orbit-ring-2" style={{ inset: '8px' }} />

              {/* Center circle */}
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg,rgba(79,142,247,0.15),rgba(79,142,247,0.06))',
                border: '1px solid rgba(79,142,247,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 32px rgba(79,142,247,0.2)',
                animation: 'float 3s ease-in-out infinite',
              }}>
                <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: '22px', fontWeight: '800',
              color: 'var(--text)', letterSpacing: '-0.6px',
              marginBottom: '10px',
            }}>
              Waiting for Approval
            </h2>

            <p style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: '14.5px', color: 'rgba(148,163,184,0.65)',
              lineHeight: '1.65', marginBottom: '28px',
            }}>
              Your request to join room{' '}
              <span className="code-shimmer" style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: '800', fontSize: '15px',
                color: 'var(--accent1)', letterSpacing: '2px',
                padding: '2px 8px',
                background: 'rgba(79,142,247,0.1)',
                borderRadius: '7px',
                border: '1px solid rgba(79,142,247,0.2)',
              }}>{roomCode}</span>
              {' '}has been sent to the host.
            </p>

            {/* User info chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '14px 18px',
              marginBottom: '28px', textAlign: 'left',
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#4f8ef7,#6a5af7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Syne',sans-serif", color: '#fff',
                fontSize: '16px', fontWeight: '800', flexShrink: 0,
              }}>
                {userName?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '3px' }}>
                  {userName}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div className="status-dot" />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12.5px', color: 'rgba(56,232,196,0.65)' }}>
                    Request pending…
                  </span>
                </div>
              </div>
            </div>

            {/* Spinner */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Outer glow ring */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(79,142,247,0.1)', animation: 'glow-pulse 2s ease-in-out infinite' }} />
                {/* Spinner */}
                <div style={{
                  width: '36px', height: '36px',
                  border: '2.5px solid rgba(79,142,247,0.15)',
                  borderTopColor: '#4f8ef7',
                  borderRadius: '50%',
                  animation: 'spin 0.9s linear infinite',
                }} />
              </div>
            </div>

            <p style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: '13px', color: 'rgba(148,163,184,0.4)',
              marginBottom: '24px',
            }}>
              Please wait while the host reviews your request
            </p>

            <button className="cancel-btn" onClick={() => navigate('/join')}>
              Cancel and go back
            </button>

          </div>
        </div>
      </div>

      <DraggableRefreshButton onRefresh={() => window.location.reload()} />
    </>
  );
}

export default Waiting;