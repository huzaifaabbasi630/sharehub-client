import { QRCodeSVG } from 'qrcode.react';

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes glow-pulse {
      0%,100% { opacity: 0.5; } 50% { opacity: 1; }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-5px); }
    }

    .qr-card {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      position: relative;
      animation: fadeUp 0.4s ease;
    }

    /* Outer glow border */
    .qr-glow {
      position: absolute; inset: -1px;
      border-radius: 22px;
      background: linear-gradient(135deg, rgba(79,142,247,0.3), rgba(56,232,196,0.15), rgba(79,142,247,0.05));
      z-index: -1;
    }

    .qr-inner {
      background: linear-gradient(160deg, rgba(13,18,40,0.97), rgba(8,11,28,0.98));
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      padding: 20px 20px 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      box-shadow: 0 20px 48px rgba(0,0,0,0.5);
    }

    /* QR white canvas */
    .qr-canvas {
      background: rgba(255,255,255,0.97);
      border-radius: 14px;
      padding: 12px;
      animation: float 4s ease-in-out infinite;
      box-shadow: 0 0 32px rgba(79,142,247,0.2), 0 8px 24px rgba(0,0,0,0.3);
    }

    .qr-label {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .qr-label-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #38e8c4;
      animation: glow-pulse 2s ease-in-out infinite;
    }
    .qr-label-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      color: rgba(148,163,184,0.6);
      letter-spacing: 0.3px;
    }
  `}</style>
);

function QRCodeCard({ value, title = 'Scan to join' }) {
  return (
    <>
      <S />
      <div className="qr-card">
        <div className="qr-glow" />
        <div className="qr-inner">

          {/* QR Code on white background */}
          <div className="qr-canvas">
            <QRCodeSVG
              value={value}
              size={160}
              level="M"
              includeMargin={false}
              imageSettings={{
                src: '/vite.svg',
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>

          {/* Label */}
          <div className="qr-label">
            <div className="qr-label-dot" />
            <span className="qr-label-text">{title}</span>
          </div>

        </div>
      </div>
    </>
  );
}

export default QRCodeCard;