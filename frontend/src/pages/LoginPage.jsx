import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── Inline CSS injected once ── */
const injectStyles = () => {
  if (document.getElementById('login-styles')) return;
  const s = document.createElement('style');
  s.id = 'login-styles';
  s.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes float-up {
      0%   { opacity: 0; transform: translateY(24px) scale(0.97); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes grid-move {
      0%   { transform: translateY(0); }
      100% { transform: translateY(40px); }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);    opacity: 0.6; }
      100% { transform: scale(1.55); opacity: 0; }
    }

    .login-card { animation: float-up 0.5s cubic-bezier(.16,1,.3,1) both; }

    .login-input {
      width: 100%;
      padding: 12px 44px 12px 44px;
      background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 12px;
      color: #f1f5f9;
      font-size: 14.5px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
      caret-color: #818cf8;
    }
    .login-input::placeholder { color: rgba(148,163,184,0.5); }
    .login-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.22);
      background: rgba(99,102,241,0.07);
    }
    .login-input:hover:not(:focus) {
      border-color: rgba(255,255,255,0.18);
    }

    .login-submit {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      font-family: inherit;
      letter-spacing: 0.02em;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
      transition: transform 0.15s, box-shadow 0.15s;
      position: relative;
      overflow: hidden;
    }
    .login-submit::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
      pointer-events: none;
    }
    .login-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 30px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .login-submit:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 12px rgba(99,102,241,0.35);
    }
    .login-submit:disabled { opacity: 0.65; cursor: not-allowed; }

    .eye-toggle {
      position: absolute;
      right: 13px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #64748b;
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 6px;
      transition: color 0.2s;
    }
    .eye-toggle:hover { color: #94a3b8; }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      transition: background 0.2s;
    }
    .feature-item:hover {
      background: rgba(255,255,255,0.07);
    }

    .login-grid-bg {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
      background-size: 40px 40px;
      animation: grid-move 8s linear infinite alternate;
    }

    .pulse-dot {
      position: relative;
      width: 10px;
      height: 10px;
      flex-shrink: 0;
    }
    .pulse-dot::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #10b981;
      animation: pulse-ring 1.8s ease-out infinite;
    }
    .pulse-dot::after {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: 50%;
      background: #34d399;
    }
  `;
  document.head.appendChild(s);
};

const EyeIcon = ({ open }) => (
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
);

const features = [
  {
    icon: '🎓',
    color: '#6366f1',
    title: 'Workshop Management',
    desc: 'Create, schedule and track all training sessions',
  },
  {
    icon: '📋',
    color: '#06b6d4',
    title: 'Attendee Registrations',
    desc: 'Register participants and manage seat availability',
  },
  {
    icon: '👥',
    color: '#10b981',
    title: 'Role-Based Access',
    desc: 'Admin, Manager and Staff permission levels',
  },
];

const LoginPage = () => {
  injectStyles();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const emailRef                  = useRef(null);

  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* ── Background layers ── */}
      <div style={s.bgBase} />
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      {/* ── Two-column layout ── */}
      <div style={s.layout} className="login-card">

        {/* ═══ LEFT PANEL — Branding ═══ */}
        <div style={s.leftPanel}>
          <div className="login-grid-bg" />

          {/* Brand */}
          <div style={s.brandBlock}>
            <div style={s.logoBox}>
              <span style={s.logoGlyph}>⬡</span>
              <div style={s.logoRing} />
            </div>
            <h1 style={s.brandName}>WorkshopHub</h1>
            <p style={s.brandTag}>Professional Training Management</p>
          </div>

          {/* Features */}
          <div style={s.featureList}>
            {features.map((f) => (
              <div className="feature-item" key={f.title}>
                <div style={{ ...s.featureIcon, background: `${f.color}1a`, border: `1px solid ${f.color}33` }}>
                  {f.icon}
                </div>
                <div>
                  <div style={s.featureTitle}>{f.title}</div>
                  <div style={s.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Status indicator */}
          <div style={s.statusBar}>
            <div className="pulse-dot" />
            <span style={s.statusText}>All systems operational</span>
            <span style={s.versionBadge}>v1.0</span>
          </div>
        </div>

        {/* ═══ RIGHT PANEL — Form ═══ */}
        <div style={s.rightPanel}>

          {/* Top bar */}
          <div style={s.topBar}>
            <span style={s.topBarLabel}>Secure Sign-In</span>
            <div style={s.lockIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>Welcome back</h2>
            <p style={s.formSubtitle}>Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={s.form} noValidate>
            {/* Email */}
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="login-email">Email Address</label>
              <div style={s.inputWrap}>
                <svg style={s.inputIconLeft} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="login-email"
                  ref={emailRef}
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={s.label} htmlFor="login-password">Password</label>
              </div>
              <div style={s.inputWrap}>
                <svg style={s.inputIconLeft} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={s.spinner} />
                  Signing in…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>secured with JWT</span>
            <div style={s.dividerLine} />
          </div>

          {/* Trust badges */}
          <div style={s.trustRow}>
            {[
              { icon: '🔐', label: 'Encrypted' },
              { icon: '🛡', label: 'Role-based' },
              { icon: '⚡', label: 'Fast & Reliable' },
            ].map((t) => (
              <div key={t.label} style={s.trustBadge}>
                <span>{t.icon}</span>
                <span style={s.trustLabel}>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p style={s.footer}>
            © 2026 WorkshopHub · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ── */
const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgBase: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #060414 0%, #0d0a2a 40%, #0a1628 70%, #04101e 100%)',
    zIndex: 0,
  },
  orb1: {
    position: 'fixed',
    width: 700,
    height: 700,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)',
    filter: 'blur(60px)',
    top: '-200px',
    left: '-150px',
    zIndex: 0,
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.14), transparent 65%)',
    filter: 'blur(60px)',
    bottom: '-150px',
    right: '-100px',
    zIndex: 0,
    pointerEvents: 'none',
  },
  orb3: {
    position: 'fixed',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 65%)',
    filter: 'blur(60px)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  /* ── Two-column card ── */
  layout: {
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    minHeight: '560px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 40px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
    position: 'relative',
    zIndex: 1,
  },

  /* ── Left panel ── */
  leftPanel: {
    flex: '0 0 340px',
    background: 'linear-gradient(160deg, rgba(99,102,241,0.18) 0%, rgba(15,12,41,0.95) 50%, rgba(6,182,212,0.1) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    position: 'relative',
    overflow: 'hidden',
  },

  brandBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
  },
  logoBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.35))',
    border: '1px solid rgba(99,102,241,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
  },
  logoRing: {
    position: 'absolute',
    inset: '-6px',
    borderRadius: '22px',
    border: '1px solid rgba(99,102,241,0.15)',
    pointerEvents: 'none',
  },
  logoGlyph: {
    fontSize: '1.9rem',
    background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1,
  },
  brandName: {
    fontSize: '22px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #f1f5f9 0%, #c4b5fd 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.01em',
    marginTop: '2px',
  },
  brandTag: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },

  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  featureIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.15rem',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '2px',
  },
  featureDesc: {
    fontSize: '11.5px',
    color: '#475569',
    lineHeight: 1.5,
  },

  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusText: {
    fontSize: '11.5px',
    color: '#34d399',
    fontWeight: 500,
    flex: 1,
  },
  versionBadge: {
    fontSize: '10.5px',
    color: '#475569',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: 600,
  },

  /* ── Right panel ── */
  rightPanel: {
    flex: 1,
    background: 'rgba(8, 6, 24, 0.90)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    padding: '36px 40px 32px',
    display: 'flex',
    flexDirection: 'column',
  },

  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
  },
  topBarLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#334155',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  lockIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  formHeader: {
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
  },
  formSubtitle: {
    fontSize: '13.5px',
    color: '#475569',
    fontWeight: 400,
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 14px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px',
    color: '#f87171',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '16px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    fontSize: '11.5px',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIconLeft: {
    position: 'absolute',
    left: '14px',
    color: '#475569',
    pointerEvents: 'none',
    zIndex: 1,
    flexShrink: 0,
  },

  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.25)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0 20px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
  },
  dividerText: {
    fontSize: '11px',
    color: '#334155',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },

  trustRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    justifyContent: 'center',
  },
  trustBadge: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '10px 6px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    fontSize: '16px',
  },
  trustLabel: {
    fontSize: '10px',
    color: '#334155',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },

  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#1e293b',
    letterSpacing: '0.03em',
    marginTop: 'auto',
  },
};

export default LoginPage;