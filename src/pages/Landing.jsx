import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LightRays from '../components/LightRays';
import HistoryModal from '../components/HistoryModal';

/* ═══════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #03050f;
      --surface:  #080d1e;
      --border:   rgba(255,255,255,0.07);
      --accent1:  #4f8ef7;
      --accent2:  #38e8c4;
      --text:     #eef2ff;
      --muted:    #4a5578;
      --card-bg:  rgba(255,255,255,0.03);
    }

    body { background: var(--bg); }

    .sh-btn-primary {
      background: linear-gradient(135deg, var(--accent1), #6a5af7);
      color: #fff;
      border: none;
      padding: 14px 34px;
      border-radius: 14px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 0 32px rgba(79,142,247,0.35);
      transition: transform 0.2s, box-shadow 0.2s;
      letter-spacing: 0.2px;
    }
    .sh-btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 48px rgba(79,142,247,0.55);
    }

    .sh-btn-ghost {
      background: rgba(255,255,255,0.05);
      color: var(--text);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 14px 34px;
      border-radius: 14px;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s, border-color 0.2s;
    }
    .sh-btn-ghost:hover {
      background: rgba(255,255,255,0.09);
      border-color: rgba(255,255,255,0.2);
    }

    .plan-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 32px 28px;
      cursor: pointer;
      transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
      position: relative;
    }
    .plan-card:hover {
      transform: translateY(-8px);
      border-color: rgba(79,142,247,0.35);
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    }
    .plan-card.popular {
      background: linear-gradient(145deg, rgba(79,142,247,0.12), rgba(106,90,247,0.08));
      border-color: rgba(79,142,247,0.4);
      box-shadow: 0 0 60px rgba(79,142,247,0.1);
    }

    .nav-link {
      background: none;
      border: none;
      color: rgba(238,242,255,0.5);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
      letter-spacing: 0.2px;
    }
    .nav-link:hover { color: var(--text); }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(79,142,247,0.1);
      border: 1px solid rgba(79,142,247,0.2);
      border-radius: 50px;
      padding: 7px 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12.5px;
      color: #93b4fb;
      letter-spacing: 0.3px;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes glow-pulse {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .hero-animate > * {
      opacity: 0;
      animation: fadeUp 0.7s ease forwards;
    }
    .hero-animate > *:nth-child(1) { animation-delay: 0.1s; }
    .hero-animate > *:nth-child(2) { animation-delay: 0.25s; }
    .hero-animate > *:nth-child(3) { animation-delay: 0.4s; }
    .hero-animate > *:nth-child(4) { animation-delay: 0.55s; }
    .hero-animate > *:nth-child(5) { animation-delay: 0.7s; }

    .modal-backdrop {
      position: fixed; inset: 0; z-index: 999;
      background: rgba(3,5,15,0.85);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: fadeUp 0.3s ease;
    }

    .modal-box {
      background: linear-gradient(160deg, #0b1027, #090d1f);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 28px;
      padding: 44px 40px;
      max-width: 900px;
      width: 100%;
      box-shadow: 0 60px 120px rgba(0,0,0,0.7);
      position: relative;
    }

    .close-btn {
      position: absolute; top: 20px; right: 20px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      color: var(--muted);
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 20px;
      transition: background 0.2s, color 0.2s;
    }
    .close-btn:hover { background: rgba(255,255,255,0.1); color: var(--text); }

    .feature-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: var(--muted);
    }
    .feature-chip span { color: var(--accent2); font-size: 16px; }
  `}</style>
);

/* ═══════════════════════════════════════════
   PRICING MODAL
═══════════════════════════════════════════ */
const PricingModal = ({ onClose }) => {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      sub: 'Free forever',
      color: '#4a5578',
      features: ['3 rooms', '5 participants', 'Basic chat', '1 GB storage'],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$5',
      sub: 'per month',
      color: '#4f8ef7',
      features: ['Unlimited rooms', '25 participants', 'HD video calls', '10 GB storage'],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Business',
      price: '$15',
      sub: 'per month',
      color: '#38e8c4',
      features: ['Everything in Pro', '100 participants', 'Admin dashboard', '100 GB storage'],
      cta: 'Go Business',
      popular: false,
    },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="badge-pill" style={{ marginBottom: '20px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent2)', display: 'inline-block' }}></span>
            Welcome to ShareHub
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '30px',
            fontWeight: '800',
            color: 'var(--text)',
            letterSpacing: '-0.8px',
            marginBottom: '8px',
          }}>
            Choose your plan
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--muted)', fontSize: '15px' }}>
            Upgrade or downgrade anytime — no lock-ins
          </p>
        </div>

        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '16px' }}>
          {plans.map((plan, i) => (
            <div key={i} className={`plan-card${plan.popular ? ' popular' : ''}`}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, var(--accent1), #6a5af7)',
                  color: '#fff',
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '11px', fontWeight: '700',
                  padding: '4px 14px', borderRadius: '20px',
                  whiteSpace: 'nowrap', letterSpacing: '0.5px',
                }}>MOST POPULAR</div>
              )}

              {/* Plan name & price */}
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '38px', fontWeight: '800', color: 'var(--text)' }}>{plan.price}</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>{plan.sub}</p>

              {/* Features */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '28px' }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontFamily: "'DM Sans', sans-serif", color: '#8899bb', fontSize: '13.5px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                fontFamily: "'Syne', sans-serif",
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.09)',
                background: plan.popular
                  ? 'linear-gradient(135deg, var(--accent1), #6a5af7)'
                  : 'rgba(255,255,255,0.04)',
                color: '#fff',
                boxShadow: plan.popular ? '0 4px 24px rgba(79,142,247,0.4)' : 'none',
                letterSpacing: '0.2px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              onClick={onClose}
              >{plan.cta}</button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", color: '#232a3e', fontSize: '12.5px', marginTop: '24px' }}>
          Free plan available forever · No credit card required
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════ */
const Navbar = ({ user, onLogout, scrolled, onHistoryClick, onGuestHistoryClick }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHistoryClick = () => {
    if (user?.isGuest) {
      onGuestHistoryClick();
    } else {
      onHistoryClick();
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(3,5,15,0.82)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
    }}>
      <div style={{
        maxWidth: '1180px', margin: '0 auto',
        padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '70px',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent1), #6a5af7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(79,142,247,0.4)',
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: '800', fontSize: '19px', color: 'var(--text)', letterSpacing: '-0.5px' }}>ShareHub</span>
        </div>

        {/* Desktop Nav links */}
        <div className="mobile-hidden" style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
          <button className="nav-link" onClick={handleHistoryClick} style={{ color: '#fbbf24' }}>
            📜 History
          </button>
          {['Features', 'Pricing', 'About'].map(l => (
            <button key={l} className="nav-link" onClick={() => navigate(`/${l.toLowerCase()}`)}>{l}</button>
          ))}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="desktop-hidden"
          style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '8px' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Right side */}
        <div className="mobile-hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.isGuest && (
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px', fontWeight: '600',
              padding: '4px 11px', borderRadius: '20px',
              background: 'rgba(251,191,36,0.1)',
              color: '#fbbf24',
              border: '1px solid rgba(251,191,36,0.2)',
              letterSpacing: '0.3px',
            }}>Guest</span>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '7px 14px',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent1), #6a5af7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Syne', sans-serif", color: '#fff', fontSize: '13px', fontWeight: '700',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#c8d0e7', fontSize: '13.5px', fontWeight: '500' }}>{user?.name}</span>
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '11px',
              color: 'var(--muted)',
              width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="desktop-hidden"
          style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '8px' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: 0,
          right: 0,
          background: 'rgba(3,5,15,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <button className="nav-link" onClick={() => { handleHistoryClick(); setMobileMenuOpen(false); }} style={{ color: '#fbbf24', textAlign: 'left', padding: '12px 0' }}>
            📜 History
          </button>
          {['Features', 'Pricing', 'About'].map(l => (
            <button key={l} className="nav-link" onClick={() => { navigate(`/${l.toLowerCase()}`); setMobileMenuOpen(false); }} style={{ textAlign: 'left', padding: '12px 0' }}>{l}</button>
          ))}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user?.isGuest && (
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px', fontWeight: '600',
                  padding: '4px 11px', borderRadius: '20px',
                  background: 'rgba(251,191,36,0.1)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251,191,36,0.2)',
                  letterSpacing: '0.3px',
                }}>Guest</span>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '7px 14px',
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent1), #6a5af7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Syne', sans-serif", color: '#fff', fontSize: '13px', fontWeight: '700',
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#c8d0e7', fontSize: '13.5px', fontWeight: '500' }}>{user?.name}</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '11px',
                color: 'var(--muted)',
                width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

/* ═══════════════════════════════════════════
   HERO
═══════════════════════════════════════════ */
const HeroSection = ({ onCreateRoom, onJoinRoom, onGuestMode }) => (
  <section style={{
    position: 'relative',
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    background: 'var(--bg)',
  }}>

    {/* Deep bg */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0d1639 0%, #03050f 70%)' }} />

    {/* Dot grid */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'radial-gradient(rgba(79,142,247,0.18) 1px, transparent 1px)',
      backgroundSize: '42px 42px',
      opacity: 0.6,
    }} />

    {/* Glow orbs */}
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', top: '-10%', left: '20%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,142,247,0.15) 0%, transparent 70%)',
        animation: 'glow-pulse 5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '0%', right: '10%',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,232,196,0.1) 0%, transparent 70%)',
        animation: 'glow-pulse 5s ease-in-out infinite',
        animationDelay: '2.5s',
      }} />
    </div>

    {/* LightRays */}
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      <LightRays
        raysOrigin="top-center"
        raysColor="#4f8ef7"
        raysSpeed={0.2}
        lightSpread={0.8}
        rayLength={2.0}
        followMouse={true}
        mouseInfluence={0.1}
        saturation={0.7}
        fadeDistance={1.8}
      />
    </div>

    {/* Content */}
    <div className="hero-animate" style={{
      position: 'relative', zIndex: 10,
      maxWidth: '780px', margin: '0 auto',
      padding: '120px 28px 80px',
      textAlign: 'center',
    }}>

      {/* Badge */}
      <div>
        <div className="badge-pill">
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent2)', display: 'inline-block', animation: 'glow-pulse 2s infinite' }} />
          Real-time · Secure · Zero-install
        </div>
      </div>

      {/* Headline */}
      <div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(44px, 7vw, 82px)',
          fontWeight: '800',
          color: 'var(--text)',
          lineHeight: '1.05',
          letterSpacing: '-2.5px',
          marginTop: '28px',
        }}>
          One Room.
          <br />
          <span style={{
            background: 'linear-gradient(110deg, var(--accent1) 20%, var(--accent2) 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Infinite Possibilities.
          </span>
        </h1>
      </div>

      {/* Sub */}
      <div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '17.5px',
          color: 'rgba(148,163,184,0.75)',
          lineHeight: '1.75',
          maxWidth: '500px',
          margin: '22px auto 0',
          fontWeight: '300',
        }}>
          Create a secure room, invite anyone via link or QR code, and start chatting, calling, and sharing — instantly.
        </p>
      </div>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '42px' }}>
        <button className="sh-btn-primary" onClick={onCreateRoom}>
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Room
        </button>
        <button className="sh-btn-ghost" onClick={onJoinRoom}>
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
          </svg>
          Join Room
        </button>
      </div>

      {/* Feature chips */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '20px',
        justifyContent: 'center', marginTop: '56px',
      }}>
        {[
          ['✦', 'HD Video Calls'],
          ['✦', 'File Sharing'],
          ['✦', 'Screen Share'],
          ['✦', 'QR Code Invite'],
        ].map(([icon, label], i) => (
          <div key={i} className="feature-chip">
            <span>{icon}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Floating mock UI card */}
      <div style={{
        marginTop: '70px',
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(145deg,#080e22,#050a18)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,142,247,0.08)',
      }}>
        {/* Gradient fade at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(to top, var(--bg), transparent)',
          zIndex: 5, pointerEvents: 'none',
        }} />

        {/* Window chrome */}
        <div style={{
          background: '#060c1d',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981' }} />
          <div style={{
            flex: 1, textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
            color: 'rgba(148,163,184,0.3)', fontSize: '12px',
          }}>sharehub.app/room/xk9-2tf</div>
        </div>

        {/* Mock content */}
        <div style={{ display: 'flex', minHeight: '200px' }}>
          {/* Sidebar */}
          <div style={{ width: '190px', borderRight: '1px solid rgba(255,255,255,0.04)', padding: '18px 16px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(148,163,184,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Online — 3</p>
            {[['A','#4f8ef7'], ['M','#38e8c4'], ['S','#a78bfa']].map(([n, c], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: `linear-gradient(135deg,${c}44,${c}22)`,
                  border: `1px solid ${c}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: c, fontFamily: "'Syne', sans-serif", fontSize: '12px', fontWeight: '700',
                }}>{n}</div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(148,163,184,0.5)', fontSize: '13px' }}>{'Alex Maria Sam'.split(' ')[i]}</span>
                <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              </div>
            ))}
          </div>

          {/* Chat */}
          <div style={{ flex: 1, padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'flex-end' }}>
            {[
              { msg: 'Hey team, ready to ship? 🚀', side: 'right', c: '#4f8ef7' },
              { msg: 'Yep! Sharing screen now', side: 'left', c: '#38e8c4' },
              { msg: 'Let\'s go 🔥', side: 'right', c: '#4f8ef7' },
            ].map(({ msg, side, c }, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: side === 'right' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '9px 15px', borderRadius: '13px',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                  maxWidth: '72%',
                  background: side === 'right' ? `${c}18` : 'rgba(255,255,255,0.04)',
                  color: 'rgba(200,210,235,0.85)',
                  border: `1px solid ${side === 'right' ? `${c}30` : 'rgba(255,255,255,0.05)'}`,
                }}>{msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════
   FOOTER (minimal)
═══════════════════════════════════════════ */
const Footer = () => (
  <footer style={{
    background: '#020408',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    padding: '28px 28px',
  }}>
    <div style={{
      maxWidth: '1180px', margin: '0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,var(--accent1),#6a5af7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: '700', color: 'rgba(238,242,255,0.6)', fontSize: '14px' }}>ShareHub</span>
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#1e2535', fontSize: '13px' }}>© 2024 ShareHub. All rights reserved.</p>
    </div>
  </footer>
);

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
function Landing({ user, onLogout }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showGuestLogin, setShowGuestLogin] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Show pricing modal every time user arrives on landing page
  useEffect(() => {
    if (user) {
      const t = setTimeout(() => setShowModal(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <>
      <GlobalStyles />
      {showModal && <PricingModal onClose={() => setShowModal(false)} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} user={user} />}

      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar 
          user={user} 
          onLogout={onLogout} 
          scrolled={scrolled} 
          onHistoryClick={() => setShowHistory(true)}
          onGuestHistoryClick={() => setShowGuestLogin(true)}
        />
        <HeroSection
          onCreateRoom={() => navigate('/create')}
          onJoinRoom={() => navigate('/join')}
          onGuestMode={() => navigate('/create')}
        />
        <Footer />
      </div>

      {/* Guest Login Modal - for History click */}
      {showGuestLogin && (
        <div className="modal-backdrop" onClick={() => setShowGuestLogin(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <button className="close-btn" onClick={() => setShowGuestLogin(false)}>×</button>

            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
            
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '12px',
            }}>
              Please Login First
            </h3>
            
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--muted)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              Guest users cannot access room history. Please login or create an account to view your room history.
            </p>

            <button
              className="sh-btn-primary"
              onClick={() => {
                setShowGuestLogin(false);
                navigate('/login');
              }}
              style={{ width: '100%' }}
            >
              Go to Login
            </button>

            <button
              onClick={() => setShowGuestLogin(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                marginTop: '12px',
                cursor: 'pointer',
              }}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Landing;