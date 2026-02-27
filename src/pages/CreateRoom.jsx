import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
// import { useSocket } from '../context/SocketContext'; // WebSocket disabled
import { usePusher } from '../context/PusherContext'; // Using Pusher instead
import { useRoom } from '../context/RoomContext';
import { generateRoomCode } from '../utils/generateRoomCode';
import { createRoom } from '../services/api';
import JoinRequestModal from '../components/JoinRequestModal';
import DraggableRefreshButton from '../components/DraggableRefreshButton';

/* ── Shared styles ── */
const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #03050f;
      --surface: #080d1e;
      --card:    rgba(13,18,40,0.97);
      --border:  rgba(255,255,255,0.07);
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
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes float {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-7px); }
    }
    @keyframes ping {
      0%    { transform:scale(1); opacity:0.7; }
      100%  { transform:scale(2.2); opacity:0; }
    }

    .cr-card {
      animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
      opacity: 0;
    }

    .cr-input {
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
    .cr-input::placeholder { color: rgba(148,163,184,0.3); }
    .cr-input:focus {
      border-color: rgba(79,142,247,0.5);
      background: rgba(79,142,247,0.06);
      box-shadow: 0 0 0 3px rgba(79,142,247,0.12);
    }

    .cr-btn-primary {
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
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .cr-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 48px rgba(79,142,247,0.55);
    }

    .cr-btn-ghost {
      padding: 11px 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 12px;
      color: rgba(238,242,255,0.65);
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      display: flex; align-items: center; gap: 7px;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }
    .cr-btn-ghost:hover {
      background: rgba(255,255,255,0.08);
      color: var(--text);
      border-color: rgba(255,255,255,0.15);
    }

    .cr-copy-btn {
      padding: 10px 18px;
      background: rgba(79,142,247,0.12);
      border: 1px solid rgba(79,142,247,0.25);
      border-radius: 11px;
      color: #4f8ef7;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .cr-copy-btn:hover {
      background: rgba(79,142,247,0.2);
      border-color: rgba(79,142,247,0.4);
    }
    .cr-copy-btn.success {
      background: rgba(56,232,196,0.12);
      border-color: rgba(56,232,196,0.3);
      color: #38e8c4;
    }

    .dot-grid {
      position: absolute; inset: 0;
      background-image: radial-gradient(rgba(79,142,247,0.15) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.5;
      pointer-events: none;
    }

    .info-block {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 20px;
    }
    .info-block label {
      display: block;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 1.4px;
      margin-bottom: 10px;
    }

    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(79,142,247,0.25);
      border-top-color: #4f8ef7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .ping-dot {
      position: relative;
      width: 10px; height: 10px;
    }
    .ping-dot::before {
      content: '';
      position: absolute; inset: 0;
      border-radius: 50%;
      background: #38e8c4;
      animation: ping 1.5s ease-out infinite;
    }
    .ping-dot::after {
      content: '';
      position: absolute; inset: 2px;
      border-radius: 50%;
      background: #38e8c4;
    }
  `}</style>
);

/* ── Shared page wrapper ── */
const PageWrap = ({ children }) => (
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
        <div style={{ position:'absolute', top:'-10%', left:'15%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(79,142,247,0.13) 0%,transparent 70%)', animation:'glow-pulse 5s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'-5%', right:'10%', width:'380px', height:'380px', borderRadius:'50%', background:'radial-gradient(circle,rgba(56,232,196,0.09) 0%,transparent 70%)', animation:'glow-pulse 5s ease-in-out infinite', animationDelay:'2.5s' }} />
      </div>
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'520px' }}>
        {children}
      </div>
    </div>
  </>
);

/* ── Card shell ── */
const Card = ({ children }) => (
  <div className="cr-card" style={{ position:'relative' }}>
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
      {children}
    </div>
  </div>
);

/* ── Logo mark ── */
const LogoMark = () => (
  <div style={{
    width:'52px', height:'52px', borderRadius:'16px',
    background: 'linear-gradient(135deg,#4f8ef7,#6a5af7)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 0 28px rgba(79,142,247,0.4)',
    animation:'float 4s ease-in-out infinite',
    flexShrink: 0,
  }}>
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  </div>
);

/* ════════════════════════════════════════
   FORM STEP
════════════════════════════════════════ */
const FormStep = ({ roomName, setRoomName, userName, setUserName, onSubmit, onBack }) => (
  <PageWrap>
    <Card>
      {/* Back */}
      <button onClick={onBack} className="cr-btn-ghost" style={{ marginBottom:'28px' }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'32px' }}>
        <LogoMark />
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'22px', fontWeight:'800', color:'var(--text)', letterSpacing:'-0.6px' }}>
            Create a Room
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13.5px', color:'var(--muted)', marginTop:'3px' }}>
            Set up your collaboration space
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
        <div>
          <label style={{ display:'block', fontFamily:"'DM Sans',sans-serif", fontSize:'12.5px', fontWeight:'500', color:'rgba(238,242,255,0.5)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:'8px' }}>
            Room Name
          </label>
          <input
            className="cr-input"
            type="text"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            placeholder="e.g. Design Sprint, Team Standup…"
            required
          />
        </div>

        <div>
          <label style={{ display:'block', fontFamily:"'DM Sans',sans-serif", fontSize:'12.5px', fontWeight:'500', color:'rgba(238,242,255,0.5)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:'8px' }}>
            Your Name
          </label>
          <input
            className="cr-input"
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="How should others see you?"
            required
          />
        </div>

        <button type="submit" className="cr-btn-primary" style={{ marginTop:'6px' }}>
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Room
        </button>
      </form>

      {/* Footer hint */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'24px', padding:'14px 16px', background:'rgba(79,142,247,0.06)', border:'1px solid rgba(79,142,247,0.15)', borderRadius:'12px' }}>
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12.5px', color:'rgba(148,163,184,0.6)', lineHeight:'1.5' }}>
          A unique room code and QR code will be generated for easy sharing.
        </p>
      </div>
    </Card>
  </PageWrap>
);

/* ════════════════════════════════════════
   CREATED STEP
════════════════════════════════════════ */
const CreatedStep = ({ roomName, roomCode, joinUrl, copied, onCopy, joinRequests, onApprove, onReject }) => (
  <PageWrap>
    <div style={{ maxWidth:'560px', width:'100%', margin:'0 auto' }}>

      {/* Success header */}
      <div className="cr-card" style={{ position:'relative', marginBottom:'0' }}>
        <div style={{ position:'absolute', inset:'-1px', borderRadius:'26px', background:'linear-gradient(135deg,rgba(56,232,196,0.2),rgba(79,142,247,0.1),rgba(56,232,196,0.03))', zIndex:-1 }} />
        <div style={{
          background: 'linear-gradient(160deg,rgba(13,18,40,0.97),rgba(8,11,28,0.98))',
          backdropFilter: 'blur(24px)',
          borderRadius: '24px',
          padding: '32px 36px 36px',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}>

          {/* Success badge */}
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{
              width:'64px', height:'64px', borderRadius:'20px',
              background:'linear-gradient(135deg,rgba(56,232,196,0.2),rgba(56,232,196,0.08))',
              border:'1px solid rgba(56,232,196,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 16px',
              boxShadow:'0 0 32px rgba(56,232,196,0.15)',
            }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#38e8c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'22px', fontWeight:'800', color:'var(--text)', letterSpacing:'-0.6px', marginBottom:'6px' }}>
              Room Created!
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'14px', color:'var(--muted)' }}>
              Share the code or link below to invite others
            </p>
          </div>

          {/* Room name */}
          <div className="info-block" style={{ marginBottom:'14px' }}>
            <label>Room Name</label>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'700', color:'var(--text)' }}>{roomName}</p>
          </div>

          {/* Room code */}
          <div className="info-block" style={{ marginBottom:'14px' }}>
            <label>Room Code</label>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
              <code style={{
                fontFamily:"'Syne',sans-serif", fontSize:'28px', fontWeight:'800',
                color:'var(--accent1)', letterSpacing:'6px',
              }}>{roomCode}</code>
              <button
                onClick={() => onCopy(roomCode, 'code')}
                className={`cr-copy-btn${copied.code ? ' success' : ''}`}
              >
                {copied.code
                  ? <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
                  : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy Code</>
                }
              </button>
            </div>
          </div>

          {/* Join link */}
          <div className="info-block" style={{ marginBottom:'20px' }}>
            <label>Join Link</label>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{
                flex:1, padding:'10px 14px',
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:'10px',
                fontFamily:"'DM Sans',sans-serif", fontSize:'12.5px',
                color:'rgba(148,163,184,0.55)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{joinUrl}</div>
              <button
                onClick={() => onCopy(joinUrl, 'link')}
                className={`cr-copy-btn${copied.link ? ' success' : ''}`}
              >
                {copied.link
                  ? <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
                  : 'Copy Link'
                }
              </button>
            </div>
          </div>

          {/* QR + waiting row */}
          <div style={{ display:'flex', gap:'16px', alignItems:'flex-start' }}>
            {/* QR */}
            <div style={{
              background:'rgba(255,255,255,0.97)',
              borderRadius:'16px',
              padding:'14px',
              display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
              flexShrink:0,
            }}>
              <QRCodeSVG value={joinUrl} size={130} />
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#64748b', fontWeight:'500' }}>Scan to join</p>
            </div>

            {/* Waiting state */}
            <div style={{
              flex:1,
              background:'rgba(255,255,255,0.02)',
              border:'1px solid rgba(255,255,255,0.06)',
              borderRadius:'16px',
              padding:'20px',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'14px', minHeight:'172px',
            }}>
              <div style={{ position:'relative', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(79,142,247,0.15)', animation:'glow-pulse 2s ease-in-out infinite' }} />
                <div className="spinner" />
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'14px', fontWeight:'700', color:'var(--text)', marginBottom:'4px' }}>
                  Waiting…
                </p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12.5px', color:'var(--muted)', lineHeight:'1.5' }}>
                  Share the code or QR — people can join once approved
                </p>
              </div>
              {/* Online indicator */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div className="ping-dot" />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(56,232,196,0.7)' }}>You're live</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* Join request modals */}
    {joinRequests.map((request) => (
      <JoinRequestModal
        key={request.requestId}
        request={request}
        onApprove={() => onApprove(request.requestId, request.requesterId, request.requesterName)}
        onReject={() => onReject(request.requestId, request.requesterId)}
      />
    ))}
  </PageWrap>
);

/* ════════════════════════════════════════
   MAIN COMPONENT — JS logic unchanged
════════════════════════════════════════ */
function CreateRoom() {
  const navigate = useNavigate();
  const { setRoomData, setUserData, room, user } = useRoom();
  const { emit, bind, unbind, subscribe, isConnected } = usePusher();
  
  const [step, setStep] = useState('form');
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinRequests, setJoinRequests] = useState([]);
  const [copied, setCopied] = useState({ code: false, link: false });
  
  // Initialize Pusher when component mounts
  useEffect(() => {
    if (room?.code) {
      subscribe(`room-${room.code}`);
      
      // Bind to join request events
      bind('join_request_received', (data) => {
        // Handle join request
        console.log('Join request received:', data);
        setJoinRequests(prev => {
          if (prev.find(r => r.requestId === data.requestId)) return prev;
          return [...prev, data];
        });
      });
      
      // Clean up on unmount
      return () => {
        unbind('join_request_received');
      };
    }
  }, [room?.code, setJoinRequests]);

  const joinUrl = roomCode ? `${window.location.origin}/join?code=${roomCode}` : '';

  useEffect(() => {
    bind('room_created', (data) => {
      console.log('Room created:', data);
    });

    // We already handle join_request_received in the Pusher initialization effect

    bind('join_approved_notification', (data) => {
      navigate(`/room/${roomCode}`);
    });

    bind('error', (error) => {
      alert(error.message);
    });

    return () => {
      unbind('room_created');
      // Don't unbind join_request_received here as it's handled in the other effect
      unbind('join_approved_notification');
      unbind('error');
    };
  }, [bind, unbind, navigate, roomCode]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !userName.trim()) return;

    const code = generateRoomCode();
    setRoomCode(code);

    try {
      const response = await createRoom({
        name: roomName,
        code,
        hostId: '',
        hostName: userName,
      });

      if (response.success) {
        setRoomData(response.room);
        setUserData({ name: userName, isHost: true });
        emit('create_room', { roomCode: code, userName });
        
        // Save to created rooms history
        const createdRooms = JSON.parse(localStorage.getItem('sharehub_created_rooms') || '[]');
        if (!createdRooms.includes(code)) {
          createdRooms.push(code);
          localStorage.setItem('sharehub_created_rooms', JSON.stringify(createdRooms));
        }
        
        // Save to room history
        const history = JSON.parse(localStorage.getItem('sharehub_room_history') || '[]');
        const roomEntry = {
          code,
          name: roomName,
          createdAt: new Date().toISOString(),
          _id: response.room?._id || code,
        };
        const existingIndex = history.findIndex(r => r.code === code);
        if (existingIndex >= 0) {
          history[existingIndex] = roomEntry;
        } else {
          history.unshift(roomEntry);
        }
        localStorage.setItem('sharehub_room_history', JSON.stringify(history.slice(0, 20)));
        
        // Save current room data for restoration from history
        localStorage.setItem('sharehub_current_room', JSON.stringify(roomEntry));
        localStorage.setItem('sharehub_current_user', JSON.stringify({ name: userName, isHost: true }));
        
        // Clear any existing data for this room code to start fresh
        localStorage.removeItem(`sharehub_messages_${code}`);
        localStorage.removeItem(`sharehub_files_${code}`);
        localStorage.removeItem(`sharehub_secure_${code}`);
        localStorage.removeItem(`sharehub_screenshots_${code}`);
        localStorage.removeItem(`sharehub_join_requests_${code}`);
        
        setStep('created');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const handleApproveJoin = (requestId, requesterId, requesterName) => {
    console.log('Approving join:', { requestId, requesterId, roomCode, requesterName });
    emit('approve_join', { requestId, requesterId, roomCode, requesterName });
    setJoinRequests(prev => prev.filter(req => req.requestId !== requestId));
    
    // Save room data before navigating
    const roomData = { code: roomCode, name: roomName, _id: roomCode };
    localStorage.setItem('sharehub_current_room', JSON.stringify(roomData));
    localStorage.setItem('sharehub_current_user', JSON.stringify({ name: userName, isHost: true }));
    
    navigate(`/room/${roomCode}`);
  };

  const handleRejectJoin = (requestId, requesterId) => {
    emit('reject_join', { requestId, requesterId });
    setJoinRequests(prev => prev.filter(req => req.requestId !== requestId));
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
  };

  // Handle refresh - reset form without page reload
  const handleRefresh = () => {
    if (step === 'form') {
      setRoomName('');
      setUserName('');
      setError('');
    } else {
      // Reset to form step
      setStep('form');
      setRoomName('');
      setRoomCode('');
      setJoinUrl('');
      setError('');
    }
  };

  if (step === 'form') {
    return (
      <>
        <FormStep
          roomName={roomName}
          setRoomName={setRoomName}
          userName={userName}
          setUserName={setUserName}
          onSubmit={handleCreateRoom}
          onBack={() => navigate('/')}
        />
        <DraggableRefreshButton onRefresh={handleRefresh} />
      </>
    );
  }

  return (
    <>
      <CreatedStep
        roomName={roomName}
        roomCode={roomCode}
        joinUrl={joinUrl}
        copied={copied}
        onCopy={copyToClipboard}
        joinRequests={joinRequests}
        onApprove={handleApproveJoin}
        onReject={handleRejectJoin}
      />
      <DraggableRefreshButton onRefresh={handleRefresh} />
    </>
  );
}

export default CreateRoom;