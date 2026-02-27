import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext'; // WebSocket disabled
import { useRoom } from '../context/RoomContext';
import { isValidRoomCode } from '../utils/generateRoomCode';
import { getRoom } from '../services/api';
import { Scanner } from '@yudiel/react-qr-scanner';
import DraggableRefreshButton from '../components/DraggableRefreshButton';
import { sharedState } from '../utils/sharedState';

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
      0%,100% { opacity:0.45; }
      50%      { opacity:1; }
    }
    @keyframes float {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-7px); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes scanner-line {
      0%   { top: 0%; }
      50%  { top: 90%; }
      100% { top: 0%; }
    }

    .jr-card {
      animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
      opacity: 0;
      position: relative;
    }

    .jr-input {
      width: 100%;
      padding: 13px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      outline: none;
      transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    }
    .jr-input::placeholder { color: rgba(148,163,184,0.28); }
    .jr-input:focus {
      border-color: rgba(79,142,247,0.5);
      background: rgba(79,142,247,0.06);
      box-shadow: 0 0 0 3px rgba(79,142,247,0.12);
    }
    .jr-input.uppercase { text-transform: uppercase; letter-spacing: 2px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; }

    .jr-btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #4f8ef7, #6a5af7);
      border: none;
      border-radius: 14px;
      color: #fff;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      letter-spacing: 0.3px;
      box-shadow: 0 0 32px rgba(79,142,247,0.35);
      transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .jr-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0 48px rgba(79,142,247,0.55);
    }
    .jr-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .jr-btn-ghost {
      padding: 11px 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 12px;
      color: rgba(238,242,255,0.6);
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      display: flex; align-items: center; gap: 7px;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }
    .jr-btn-ghost:hover {
      background: rgba(255,255,255,0.08);
      color: var(--text);
      border-color: rgba(255,255,255,0.15);
    }

    .jr-qr-btn {
      width: 100%;
      padding: 13px;
      background: rgba(255,255,255,0.03);
      border: 1.5px dashed rgba(255,255,255,0.1);
      border-radius: 14px;
      color: rgba(148,163,184,0.6);
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.25s;
    }
    .jr-qr-btn:hover,
    .jr-qr-btn.active {
      background: rgba(79,142,247,0.08);
      border-color: rgba(79,142,247,0.35);
      color: #4f8ef7;
    }

    .dot-grid {
      position: absolute; inset: 0;
      background-image: radial-gradient(rgba(79,142,247,0.14) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.5;
      pointer-events: none;
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      flex-shrink: 0;
    }

    .scanner-wrap {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(79,142,247,0.2);
      position: relative;
      box-shadow: 0 0 40px rgba(79,142,247,0.1);
    }
    .scanner-wrap::after {
      content: '';
      position: absolute;
      left: 10%; right: 10%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #4f8ef7, transparent);
      border-radius: 2px;
      animation: scanner-line 2s ease-in-out infinite;
      pointer-events: none;
      z-index: 10;
    }

    /* Corner brackets */
    .scanner-corner {
      position: absolute;
      width: 22px; height: 22px;
      z-index: 11;
      pointer-events: none;
    }
    .scanner-corner.tl { top: 10px; left: 10px; border-top: 2.5px solid #38e8c4; border-left: 2.5px solid #38e8c4; border-radius: 3px 0 0 0; }
    .scanner-corner.tr { top: 10px; right: 10px; border-top: 2.5px solid #38e8c4; border-right: 2.5px solid #38e8c4; border-radius: 0 3px 0 0; }
    .scanner-corner.bl { bottom: 10px; left: 10px; border-bottom: 2.5px solid #38e8c4; border-left: 2.5px solid #38e8c4; border-radius: 0 0 0 3px; }
    .scanner-corner.br { bottom: 10px; right: 10px; border-bottom: 2.5px solid #38e8c4; border-right: 2.5px solid #38e8c4; border-radius: 0 0 3px 0; }
  `}</style>
);

function JoinRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  // const { emit, on, off } = useSocket(); // WebSocket disabled
    const emit = () => {};
    const on = () => {};
    const off = () => {};
  const { setRoomData, setUserData } = useRoom();

  const [roomCode, setRoomCode] = useState(searchParams.get('code') || location.state?.prefillCode || '');
  const [userName, setUserName] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOneTimeLink, setIsOneTimeLink] = useState(searchParams.get('oneTime') === 'true');
  const [linkToken, setLinkToken] = useState(searchParams.get('token') || '');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    on('join_request_sent', (data) => {
      navigate('/waiting', { state: { roomCode, userName, requestId: data.requestId } });
    });

    on('join_rejected', (data) => {
      setError(data.message);
      setIsSubmitting(false);
    });

    on('error', (error) => {
      setError(error.message);
      setIsSubmitting(false);
    });

    return () => {
      off('join_request_sent');
      off('join_rejected');
      off('error');
    };
  }, [on, off, navigate, roomCode, userName]);

  const handleJoinRequest = async (e) => {
    e.preventDefault();
    setError('');

    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    // For one-time links, skip room code validation (code comes from URL)
    if (!isOneTimeLink && !isValidRoomCode(roomCode)) {
      setError('Please enter a valid 6-character room code');
      return;
    }

    setIsSubmitting(true);

    // For one-time links, emit join request via socket (same as normal join)
    if (isOneTimeLink && linkToken) {
      emit('send_join_request', { roomCode: roomCode.toUpperCase(), userName, isOneTimeLink: true, token: linkToken });
      setRequestSent(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await getRoom(roomCode);
      if (response.success) {
        setRoomData(response.room);
        setUserData({ name: userName, isHost: false });
        emit('send_join_request', { roomCode: roomCode.toUpperCase(), userName });
      }
    } catch (error) {
      setError('Room not found. Please check the code and try again.');
      setIsSubmitting(false);
    }
  };

  const handleScan = (result) => {
    if (result) {
      try {
        const url = new URL(result.text);
        const code = url.searchParams.get('code');
        if (code) {
          setRoomCode(code);
          setShowScanner(false);
        }
      } catch {
        setError('Invalid QR code');
      }
    }
  };

  const extractCodeFromInput = (input) => {
    if (input.includes('/join?code=')) {
      const match = input.match(/code=([A-Z0-9]{6})/i);
      return match ? match[1].toUpperCase() : input.toUpperCase();
    }
    return input.toUpperCase();
  };

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
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-10%', right:'15%', width:'480px', height:'480px', borderRadius:'50%', background:'radial-gradient(circle,rgba(79,142,247,0.13) 0%,transparent 70%)', animation:'glow-pulse 5s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:'-5%', left:'10%', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle,rgba(56,232,196,0.09) 0%,transparent 70%)', animation:'glow-pulse 5s ease-in-out infinite', animationDelay:'2.5s' }} />
        </div>

        {/* Card */}
        <div className="jr-card" style={{ width:'100%', maxWidth:'460px', position:'relative', zIndex:10 }}>

          {/* Glow border */}
          <div style={{ position:'absolute', inset:'-1px', borderRadius:'26px', background:'linear-gradient(135deg,rgba(79,142,247,0.28),rgba(56,232,196,0.08),rgba(79,142,247,0.04))', zIndex:-1 }} />

          <div style={{
            background: 'linear-gradient(160deg,rgba(13,18,40,0.97),rgba(8,11,28,0.98))',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            padding: '36px',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          }}>

            {/* Back */}
            <button onClick={() => navigate('/')} className="jr-btn-ghost" style={{ marginBottom:'28px' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>

            {/* One-time link banner */}
            {isOneTimeLink && (
              <div style={{
                marginBottom:'20px', padding:'12px 16px',
                background:'rgba(79,142,247,0.15)',
                border:'1px solid rgba(79,142,247,0.3)',
                borderRadius:'12px',
                color:'#93c5fd',
                fontFamily:"'DM Sans',sans-serif", fontSize:'13.5px',
                display:'flex', alignItems:'center', gap:'9px',
              }}>
                <span>🔗</span>
                <span>You're using a one-time invite link</span>
              </div>
            )}

            {/* Request Sent State */}
            {requestSent ? (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <div style={{
                  width:'80px', height:'80px', borderRadius:'50%',
                  background:'linear-gradient(135deg,#10b981,#059669)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 24px',
                  boxShadow:'0 0 40px rgba(16,185,129,0.4)',
                }}>
                  <span style={{ fontSize:'40px' }}>📨</span>
                </div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'20px', fontWeight:'700', color:'var(--text)', marginBottom:'12px' }}>
                  Join Request Sent!
                </h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'14px', color:'var(--muted)', marginBottom:'24px', lineHeight:'1.6' }}>
                  Your request has been sent to the room creator.<br/>
                  You'll be able to join once they approve it.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="jr-btn-primary"
                  style={{ maxWidth:'200px' }}
                >
                  Go Home
                </button>
              </div>
            ) : (
              <>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'32px' }}>
              <div style={{
                width:'52px', height:'52px', borderRadius:'16px',
                background:'linear-gradient(135deg,#38e8c4,#4f8ef7)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 28px rgba(56,232,196,0.35)',
                animation:'float 4s ease-in-out infinite', flexShrink:0,
              }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'22px', fontWeight:'800', color:'var(--text)', letterSpacing:'-0.6px' }}>
                  Join a Room
                </h2>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13.5px', color:'var(--muted)', marginTop:'3px' }}>
                  Enter a code or scan a QR
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom:'20px', padding:'12px 16px',
                background:'rgba(239,68,68,0.08)',
                border:'1px solid rgba(239,68,68,0.22)',
                borderRadius:'12px',
                color:'#fca5a5',
                fontFamily:"'DM Sans',sans-serif", fontSize:'13.5px',
                display:'flex', alignItems:'center', gap:'9px',
              }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleJoinRequest} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

              {/* Room Code */}
              <div>
                <label style={{ display:'block', fontFamily:"'DM Sans',sans-serif", fontSize:'12.5px', fontWeight:'500', color:'rgba(238,242,255,0.5)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:'8px' }}>
                  Room Code or Link
                </label>
                <input
                  className="jr-input uppercase"
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(extractCodeFromInput(e.target.value))}
                  placeholder="ABC123"
                  maxLength={50}
                />
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(148,163,184,0.35)', marginTop:'7px' }}>
                  Enter a 6-character code or paste the full join link
                </p>
              </div>

              {/* Name */}
              <div>
                <label style={{ display:'block', fontFamily:"'DM Sans',sans-serif", fontSize:'12.5px', fontWeight:'500', color:'rgba(238,242,255,0.5)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:'8px' }}>
                  Your Name
                </label>
                <input
                  className="jr-input"
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="How should others see you?"
                  required
                />
              </div>

              {/* QR Scanner toggle */}
              <button
                type="button"
                onClick={() => setShowScanner(!showScanner)}
                className={`jr-qr-btn${showScanner ? ' active' : ''}`}
              >
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                  <path d="M14 14h2v2h-2zM18 14h3M14 18v3M18 18h3v3h-3z"/>
                </svg>
                {showScanner ? 'Hide QR Scanner' : 'Scan QR Code'}
              </button>

              {/* Scanner */}
              {showScanner && (
                <div className="scanner-wrap">
                  <div className="scanner-corner tl" />
                  <div className="scanner-corner tr" />
                  <div className="scanner-corner bl" />
                  <div className="scanner-corner br" />
                  <Scanner
                    onScan={(result) => {
                      if (result && result[0]) {
                        handleScan({ text: result[0].rawValue });
                      }
                    }}
                    onError={(error) => setError(error?.message || 'Scanner error')}
                    styles={{ container: { width:'100%', height:'220px' } }}
                  />
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="jr-btn-primary" disabled={isSubmitting} style={{ marginTop:'4px' }}>
                {isSubmitting
                  ? <><div className="spinner" />Sending Request…</>
                  : <>
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                      </svg>
                      Request to Join
                    </>
                }
              </button>
            </form>

            {/* Bottom hint */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'22px', padding:'13px 16px', background:'rgba(56,232,196,0.05)', border:'1px solid rgba(56,232,196,0.12)', borderRadius:'12px' }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#38e8c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12.5px', color:'rgba(148,163,184,0.55)', lineHeight:'1.5' }}>
                Your request will be sent to the host for approval.
              </p>
            </div>

            </>
            )}

          </div>
        </div>
      </div>
      
      <DraggableRefreshButton 
        onRefresh={() => {
          setRoomCode('');
          setUserName('');
          setError('');
          setShowScanner(false);
          setScanError('');
        }} 
      />
    </>
  );
}

export default JoinRoom;