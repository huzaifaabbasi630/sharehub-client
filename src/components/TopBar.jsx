const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes glow-pulse {
      0%,100% { opacity: 0.5; } 50% { opacity: 1; }
    }

    .tb-wrap {
      background: rgba(7,12,27,0.97);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 1px 24px rgba(0,0,0,0.4);
      padding: 0 20px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'DM Sans', sans-serif;
    }

    /* Left side */
    .tb-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Hamburger — mobile only */
    .tb-hamburger {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      display: none;
      align-items: center;
      justify-content: center;
      color: rgba(238,242,255,0.6);
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      flex-shrink: 0;
    }
    .tb-hamburger:hover {
      background: rgba(255,255,255,0.08);
      color: #eef2ff;
    }
    @media (max-width: 1023px) {
      .tb-hamburger { display: flex; }
    }

    /* Room icon */
    .tb-room-icon {
      width: 38px; height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(79,142,247,0.2), rgba(106,90,247,0.12));
      border: 1px solid rgba(79,142,247,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    /* Room info */
    .tb-room-name {
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #eef2ff;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }
    .tb-room-meta {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .tb-online-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #38e8c4;
      animation: glow-pulse 2s ease-in-out infinite;
    }
    .tb-participants {
      font-size: 11.5px;
      color: rgba(148,163,184,0.45);
    }

    /* Right side */
    .tb-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Action buttons */
    .tb-btn {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      display: flex; align-items: center; justify-content: center;
      color: rgba(148,163,184,0.6);
      cursor: pointer;
      transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
      position: relative;
    }
    .tb-btn:hover {
      background: rgba(79,142,247,0.1);
      border-color: rgba(79,142,247,0.25);
      color: #4f8ef7;
      transform: translateY(-1px);
    }

    /* Leave button — red variant */
    .tb-btn.leave {
      margin-left: 4px;
    }
    .tb-btn.leave:hover {
      background: rgba(239,68,68,0.12);
      border-color: rgba(239,68,68,0.3);
      color: #f87171;
    }

    /* Divider between call btns and leave */
    .tb-divider {
      width: 1px;
      height: 22px;
      background: rgba(255,255,255,0.06);
      margin: 0 4px;
    }

    /* Tooltip */
    .tb-btn::after {
      content: attr(data-tip);
      position: absolute;
      bottom: -28px;
      left: 50%; transform: translateX(-50%);
      background: rgba(7,12,27,0.92);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      padding: 3px 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: rgba(148,163,184,0.7);
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s;
      z-index: 99;
    }
    .tb-btn:hover::after { opacity: 1; }
  `}</style>
);

function TopBar({
  roomName,
  participantsCount,
  onToggleSidebar,
  onStartVideoCall,
  onStartVoiceCall,
  onLeaveRoom,
  onShowAIAssistant,
}) {
  return (
    <>
      <S />
      <div className="tb-wrap">

        {/* Left */}
        <div className="tb-left">

          {/* Hamburger (mobile) */}
          <button className="tb-hamburger" onClick={onToggleSidebar}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Room icon */}
          <div className="tb-room-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Room info */}
          <div>
            <p className="tb-room-name">{roomName}</p>
            <div className="tb-room-meta">
              <div className="tb-online-dot" />
              <span className="tb-participants">{participantsCount} online</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="tb-right">

          {/* Voice call */}
          <button className="tb-btn" onClick={onStartVoiceCall} data-tip="Voice Call">
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.35 7.77a16 16 0 006.88 6.88l1.13-1.13a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.99 15l-.07 1.92z" />
            </svg>
          </button>

          {/* AI Work Assistant */}
          <button className="tb-btn" onClick={onShowAIAssistant} data-tip="AI Work Assistant">
            <span>🤖</span>
          </button>

          {/* Video call */}
          <button className="tb-btn" onClick={onStartVideoCall} data-tip="Video Call">
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>

          <div className="tb-divider" />

          {/* Leave room */}
          <button className="tb-btn leave" onClick={onLeaveRoom} data-tip="Leave Room">
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

        </div>
      </div>
    </>
  );
}

export default TopBar;