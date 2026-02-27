import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LightRays from '../components/LightRays';

function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm) {
      setError("Passwords don't match");
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const userData = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        avatar: null,
      };
      onLogin(userData, 'signup_token_' + Date.now());
      navigate('/');
    }, 1200);
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ id: Date.now().toString(), email: 'user@gmail.com', name: 'Google User', avatar: null }, 'google_token_' + Date.now());
      navigate('/');
    }, 1000);
  };

  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <>
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

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.9; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes strength-fill {
          from { width: 0; }
        }

        .signup-card {
          animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
          opacity: 0;
        }

        .input-field {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: #eef2ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .input-field::placeholder { color: rgba(148,163,184,0.3); }
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
        .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(79,142,247,0.16) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.55;
        }

        .logo-icon { animation: float 4s ease-in-out infinite; }

        .strength-bar {
          height: 3px;
          border-radius: 4px;
          background: rgba(255,255,255,0.07);
          flex: 1;
          overflow: hidden;
        }
        .strength-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease, background 0.4s ease;
          animation: strength-fill 0.4s ease;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          transition: color 0.2s;
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
            position: 'absolute', top: '-15%', right: '15%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,232,196,0.1) 0%, transparent 70%)',
            animation: 'glow-pulse 5s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '-5%', left: '10%',
            width: '420px', height: '420px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)',
            animation: 'glow-pulse 5s ease-in-out infinite',
            animationDelay: '2.5s',
          }} />
        </div>

        {/* LightRays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#38e8c4"
            raysSpeed={0.2}
            lightSpread={0.65}
            rayLength={1.8}
            followMouse={true}
            mouseInfluence={0.1}
            saturation={0.65}
            fadeDistance={1.8}
          />
        </div>

        {/* Card */}
        <div className="signup-card" style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '460px',
        }}>
          {/* Glow border */}
          <div style={{
            position: 'absolute', inset: '-1px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, rgba(56,232,196,0.25), rgba(79,142,247,0.15), rgba(56,232,196,0.05))',
            zIndex: -1,
          }} />

          <div style={{
            background: 'linear-gradient(160deg, rgba(13,18,40,0.96), rgba(8,11,28,0.98))',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            padding: '36px 36px',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 120px rgba(56,232,196,0.06)',
          }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div className="logo-icon" style={{
                width: '58px', height: '58px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #38e8c4, #4f8ef7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 0 32px rgba(56,232,196,0.4), 0 0 0 1px rgba(56,232,196,0.2)',
              }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>

              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '25px', fontWeight: '800',
                color: '#eef2ff',
                letterSpacing: '-0.8px', marginBottom: '6px',
              }}>Create your account</h1>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px', color: 'rgba(148,163,184,0.55)',
                fontWeight: '300',
              }}>Join ShareHub and start collaborating</p>
            </div>

            {/* Google signup */}
            <button className="btn-google" onClick={handleGoogleSignup} disabled={isLoading} style={{ marginBottom: '20px' }}>
              {isLoading
                ? <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.15)', borderTopColor: '#1a1a2e' }} />
                : <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
              }
              Sign up with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(148,163,184,0.35)', whiteSpace: 'nowrap' }}>or sign up with email</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: '16px', padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13.5px',
              }}>{error}</div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Name */}
              <div>
                <label style={{
                  display: 'block', fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px', fontWeight: '500',
                  color: 'rgba(238,242,255,0.55)', marginBottom: '7px',
                }}>Full name</label>
                <input
                  className="input-field"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block', fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px', fontWeight: '500',
                  color: 'rgba(238,242,255,0.55)', marginBottom: '7px',
                }}>Email address</label>
                <input
                  className="input-field"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block', fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px', fontWeight: '500',
                  color: 'rgba(238,242,255,0.55)', marginBottom: '7px',
                }}>Password</label>
                <input
                  className="input-field"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                />

                {/* Strength bars */}
                {formData.password.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '6px' }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} className="strength-bar">
                          <div className="strength-bar-fill" style={{
                            width: i < passwordStrength ? '100%' : '0%',
                            background: strengthColors[passwordStrength - 1] || 'transparent',
                          }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {[
                        ['8+ chars', formData.password.length >= 8],
                        ['Uppercase', /[A-Z]/.test(formData.password)],
                        ['Number', /[0-9]/.test(formData.password)],
                        ['Symbol', /[^A-Za-z0-9]/.test(formData.password)],
                      ].map(([label, passed], i) => (
                        <div key={i} className="check-item" style={{ color: passed ? '#38e8c4' : 'rgba(148,163,184,0.3)' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            {passed
                              ? <polyline points="20 6 9 17 4 12"/>
                              : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                            }
                          </svg>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{
                  display: 'block', fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px', fontWeight: '500',
                  color: 'rgba(238,242,255,0.55)', marginBottom: '7px',
                }}>Confirm password</label>
                <input
                  className="input-field"
                  type="password"
                  name="confirm"
                  value={formData.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                  style={{
                    borderColor: formData.confirm && formData.confirm !== formData.password
                      ? 'rgba(239,68,68,0.4)'
                      : formData.confirm && formData.confirm === formData.password
                      ? 'rgba(56,232,196,0.4)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                />
                {formData.confirm && formData.confirm === formData.password && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#38e8c4', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Passwords match
                  </p>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '4px' }}>
                {isLoading
                  ? <><div className="spinner" />Creating account...</>
                  : <>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                      Create Account
                    </>
                }
              </button>
            </form>

            {/* Footer */}
            <p style={{
              marginTop: '24px', textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13.5px', color: 'rgba(148,163,184,0.45)',
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: '#4f8ef7', fontWeight: '600', textDecoration: 'none',
              }}
              onMouseEnter={e => e.target.style.color = '#38e8c4'}
              onMouseLeave={e => e.target.style.color = '#4f8ef7'}
              >Login</Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;