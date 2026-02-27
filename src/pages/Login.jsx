import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LightRays from '../components/LightRays';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      setTimeout(() => {
        const userData = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          avatar: null
        };
        onLogin(userData, 'demo_token_' + Date.now());
        navigate('/');
      }, 1000);
    } catch (err) {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ id: Date.now().toString(), email: 'user@gmail.com', name: 'Google User', avatar: null }, 'google_token_' + Date.now());
      navigate('/');
    }, 1000);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ id: 'guest_' + Date.now(), email: 'guest@sharehub.com', name: 'Guest User', isGuest: true, avatar: null }, 'guest_token_' + Date.now());
      navigate('/');
    }, 500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:      #03050f;
          --accent1: #4f8ef7;
          --accent2: #38e8c4;
          --text:    #eef2ff;
          --muted:   #4a5578;
          --border:  rgba(255,255,255,0.07);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.9; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }

        .login-card {
          animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
          opacity: 0;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: #eef2ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .input-field::placeholder { color: rgba(148,163,184,0.35); }
        .input-field:focus {
          border-color: rgba(79,142,247,0.5);
          background: rgba(79,142,247,0.06);
          box-shadow: 0 0 0 3px rgba(79,142,247,0.12);
        }

        .btn-primary {
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 48px rgba(79,142,247,0.55);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-google {
          width: 100%;
          padding: 13px;
          background: rgba(255,255,255,0.96);
          border: none;
          border-radius: 14px;
          color: #1a1a2e;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .btn-google:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.4);
        }

        .btn-guest {
          width: 100%;
          padding: 13px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          color: rgba(238,242,255,0.7);
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 14.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .btn-guest:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.16);
          color: rgba(238,242,255,0.9);
        }

        .logo-icon {
          animation: float 4s ease-in-out infinite;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Dot grid bg */
        .dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(79,142,247,0.16) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.55;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 70% at 50% -10%, #0d1639 0%, #03050f 65%)',
        padding: '24px',
      }}>

        {/* Dot grid */}
        <div className="dot-grid" />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-15%', left: '15%',
            width: '550px', height: '550px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,142,247,0.14) 0%, transparent 70%)',
            animation: 'glow-pulse 5s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '-5%', right: '10%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,232,196,0.09) 0%, transparent 70%)',
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
            lightSpread={0.7}
            rayLength={2.0}
            followMouse={true}
            mouseInfluence={0.12}
            saturation={0.7}
            fadeDistance={1.8}
          />
        </div>

        {/* Card */}
        <div className="login-card" style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '440px',
        }}>
          {/* Glow border effect */}
          <div style={{
            position: 'absolute', inset: '-1px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, rgba(79,142,247,0.3), rgba(56,232,196,0.1), rgba(79,142,247,0.05))',
            zIndex: -1,
          }} />

          <div style={{
            background: 'linear-gradient(160deg, rgba(13,18,40,0.95), rgba(8,11,28,0.98))',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            padding: '40px 36px',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 120px rgba(79,142,247,0.07)',
          }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="logo-icon" style={{
                width: '60px', height: '60px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #4f8ef7, #6a5af7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 32px rgba(79,142,247,0.45), 0 0 0 1px rgba(79,142,247,0.2)',
              }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>

              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '26px', fontWeight: '800',
                color: '#eef2ff',
                letterSpacing: '-0.8px',
                marginBottom: '6px',
              }}>Welcome back</h1>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px', color: 'rgba(148,163,184,0.6)',
                fontWeight: '300',
              }}>Sign in to continue to ShareHub</p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13.5px',
              }}>{error}</div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px', fontWeight: '500',
                  color: 'rgba(238,242,255,0.6)',
                  marginBottom: '8px',
                  letterSpacing: '0.2px',
                }}>Email address</label>
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px', fontWeight: '500',
                    color: 'rgba(238,242,255,0.6)',
                    letterSpacing: '0.2px',
                  }}>Password</label>
                  <a href="#" style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px', color: 'rgba(79,142,247,0.75)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color='#4f8ef7'}
                  onMouseLeave={e => e.target.style.color='rgba(79,142,247,0.75)'}
                  >Forgot password?</a>
                </div>
                <input
                  className="input-field"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '4px' }}>
                {isLoading ? <><div className="spinner" />Signing in...</> : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div className="divider-line" />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12.5px', color: 'rgba(148,163,184,0.4)',
                whiteSpace: 'nowrap',
              }}>or continue with</span>
              <div className="divider-line" />
            </div>

            {/* Social buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-google" onClick={handleGoogleLogin} disabled={isLoading}>
                {isLoading
                  ? <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#1a1a2e' }} />
                  : <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                }
                Continue with Google
              </button>

              <button className="btn-guest" onClick={handleGuestLogin} disabled={isLoading}>
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
                Continue as Guest
              </button>
            </div>

            {/* Footer */}
            <p style={{
              marginTop: '28px', textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13.5px', color: 'rgba(148,163,184,0.5)',
            }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{
                color: '#4f8ef7', fontWeight: '600', textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color='#38e8c4'}
              onMouseLeave={e => e.target.style.color='#4f8ef7'}
              >Sign up free</Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default Login;