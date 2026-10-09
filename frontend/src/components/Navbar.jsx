import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/dashboard',     label: 'Workshops',       icon: '🎓', roles: ['admin','manager','staff'] },
    { to: '/registrations', label: 'Registrations',   icon: '📋', roles: ['admin','manager','staff'] },
    { to: '/users',         label: 'Users',            icon: '👥', roles: ['admin'] },
    { to: '/audit',         label: 'Audit Trail',      icon: '📜', roles: ['admin','manager'] },
  ].filter(l => l.roles.includes(user?.role));

  const roleMap = {
    admin:   { label: 'Admin',   color: '#f59e0b' },
    manager: { label: 'Manager', color: '#6366f1' },
    staff:   { label: 'Staff',   color: '#06b6d4' },
  };
  const rb = roleMap[user?.role] || { label: user?.role, color: '#94a3b8' };

  const isDark = theme === 'dark';

  return (
    <nav style={{ ...styles.nav, background: isDark ? 'rgba(10,8,30,0.88)' : 'rgba(255,255,255,0.92)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.15)'}` }}>
      {/* Left */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>⬡</span>
          <div>
            <div style={{ ...styles.brandName, color: isDark ? '#f1f5f9' : '#1e1b4b' }}>WorkshopHub</div>
            <div style={styles.brandSub}>Registration System</div>
          </div>
        </div>

        <div style={{ ...styles.dividerV, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.15)' }} />

        <div style={styles.links}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                ...styles.link,
                color: isActive ? '#a5b4fc' : isDark ? '#94a3b8' : '#4338ca',
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
              })}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={styles.right}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{ ...styles.themeBtn, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.10)', color: isDark ? '#94a3b8' : '#4338ca', border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.18)'}` }}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* User info */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={styles.userMeta}>
            <span style={{ ...styles.userName, color: isDark ? '#f1f5f9' : '#1e1b4b' }}>{user?.name}</span>
            <span style={{ ...styles.rolePill, background: `${rb.color}22`, color: rb.color, border: `1px solid ${rb.color}44` }}>
              {rb.label}
            </span>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    height: '64px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    gap: '16px',
  },
  left: { display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  brandIcon: {
    fontSize: '1.6rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1,
  },
  brandName: { fontSize: '15px', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.2 },
  brandSub: { fontSize: '10px', color: '#6366f1', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' },
  dividerV: { width: '1px', height: '28px', flexShrink: 0 },
  links: { display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' },
  link: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '6px 12px', borderRadius: '8px',
    textDecoration: 'none', fontSize: '13px', fontWeight: 500,
    transition: 'all 0.18s', whiteSpace: 'nowrap',
  },
  right: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  themeBtn: {
    width: '34px', height: '34px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
    flexShrink: 0,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '9px' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '13px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 0 0 2px rgba(99,102,241,0.35)',
  },
  userMeta: { display: 'flex', flexDirection: 'column', gap: '3px' },
  userName: { fontSize: '13px', fontWeight: 600, lineHeight: 1 },
  rolePill: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
    fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'capitalize',
  },
  logoutBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 13px',
    background: 'rgba(239,68,68,0.12)', color: '#f87171',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
    transition: 'all 0.2s', fontFamily: 'inherit',
  },
};

export default Navbar;