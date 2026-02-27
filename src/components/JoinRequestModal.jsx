const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.92) translateY(16px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes backdropIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes ping {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    .jrm-backdrop {
      position: fixed; inset: 0; z-index: 50;
      background: rgba(3,5,15,0.82);
      backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: backdropIn 0.25s ease;
    }

    .jrm-box {
      width: 100%; max-width: 400px;
      position: relative;
      animation: modalIn 0.35s cubic-bezier(0.16,1,0.3,1);
    }

    .jrm-glow-border {
      position: absolute; inset: -1px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(79,142,247,0.3), rgba(56,232,196,0.1), rgba(79,142,247,0.05));
      z-index: -1;
    }

    .jrm-inner {
      background: linear-gradient(160deg, rgba(13,18,40,0.98), rgba(8,11,28,0.99));
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 22px;
      padding: 36px 32px 28px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.7);
      text-align: center;
    }

    .jrm-avatar-wrap {
      position: relative;
      width: 72px; height: 72px;
      margin: 0 auto 20px;
      display: flex; align-items: center; justify-content: center;
    }
    .jrm-avatar-wrap::before {
      content: '';
      position: absolute; inset: 0;
      border-radius: 50%;
      background: rgba(79,142,247,0.12);
      animation: ping 2s ease-out infinite;
    }
    .jrm-avatar {
      width: 64px; height: 64px; border-radius: 50%;
      background: linear-gradient(135deg, #4f8ef7, #6a5af7);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 28px rgba(79,142,247,0.4);
      animation: float 3.5s ease-in-out infinite;
      position: relative; z-index: 1;
    }

    .jrm-btn-accept {
      flex: 1; padding: 13px;
      background: linear-gradient(135deg, #4f8ef7, #6a5af7);
      border: none; border-radius: 14px;
      color: #fff;
      font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 14px;
      cursor: pointer; letter-spacing: 0.3px;
      box-shadow: 0 0 24px rgba(79,142,247,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 7px;
    }
    .jrm-btn-accept:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 36px rgba(79,142,247,0.6);
    }

    .jrm-btn-decline {
      flex: 1; padding: 13px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 14px;
      color: rgba(238,242,255,0.55);
      font-family: 'Syne', sans-serif;
      font-weight: 600; font-size: 14px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 7px;
    }
    .jrm-btn-decline:hover {
      background: rgba(239,68,68,0.1);
      border-color: rgba(239,68,68,0.25);
      color: #f87171;
    }
  `}</style>
);

function JoinRequestModal({ request, onApprove, onReject }) {
  return (
    <>
      <S />
      <div className="jrm-backdrop">
        <div className="jrm-box">
          <div className="jrm-glow-border" />
          <div className="jrm-inner">

            {/* Avatar */}
            <div className="jrm-avatar-wrap">
              <div className="jrm-avatar">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '19px', fontWeight: '800',
              color: '#eef2ff', letterSpacing: '-0.5px',
              marginBottom: '10px',
            }}>
              Join Request
            </h3>

            {/* Message */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14.5px', color: 'rgba(148,163,184,0.65)',
              lineHeight: '1.6', marginBottom: '28px',
            }}>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: '700', fontSize: '15px',
                color: '#eef2ff',
              }}>{request.requesterName}</span>
              {' '}wants to join your room
            </p>

            {/* Name chip */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              background: 'rgba(79,142,247,0.08)',
              border: '1px solid rgba(79,142,247,0.18)',
              borderRadius: '50px', padding: '7px 16px',
              marginBottom: '28px',
            }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#4f8ef7,#6a5af7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Syne',sans-serif", color: '#fff',
                fontSize: '11px', fontWeight: '800',
              }}>
                {request.requesterName?.charAt(0).toUpperCase()}
              </div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13.5px', fontWeight: '500',
                color: '#93b4fb',
              }}>{request.requesterName}</span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="jrm-btn-decline" onClick={onReject}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Decline
              </button>
              <button className="jrm-btn-accept" onClick={onApprove}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Accept
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default JoinRequestModal;