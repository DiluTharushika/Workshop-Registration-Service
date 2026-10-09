import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Workshops', icon: '🎓' },
    { to: '/registrations', label: 'Registrations', icon: '📋' },
    ...(user?.role === 'admin' ? [{ to: '/users', label: 'User Management', icon: '👥' }] : []),
  ];

  const getRoleBadge = (role) => {
    const map = {
      admin:   { label: 'Admin',   color: '#f59e0b' },
      manager: { label: 'Manager', color: '#6366f1' },
      staff:   { label: 'Staff',   color: '#06b6d4' },
    };
    return map[role] || { label: role, color: '#94a3b8' };
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <nav style={styles.nav}>
      {/* Left: Brand + nav links */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>⬡</span>
          <div>
            <div style={styles.brandName}>WorkshopHub</div>
            <div style={styles.brandSub}>Registration System</div>
          </div>
        </div>

        <div style={styles.dividerV} />

        <div style={styles.links}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right: User info + logout */}
      <div style={styles.right}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={styles.userMeta}>
            <span style={styles.userName}>{user?.name}</span>
            <span
              style={{
                ...styles.rolePill,
                background: `${roleBadge.color}22`,
                color: roleBadge.color,
                border: `1px solid ${roleBadge.color}44`,
              }}
            >
              {roleBadge.label}
            </span>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
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
    padding: '0 28px',
    height: '64px',
    background: 'rgba(10, 8, 30, 0.80)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.35)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    gap: '20px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: 1,
    minWidth: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  brandIcon: {
    fontSize: '1.6rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1,
  },
  brandName: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#f1f5f9',
    letterSpacing: '0.01em',
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  dividerV: {
    width: '1px',
    height: '28px',
    background: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  links: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '8px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: 500,
    transition: 'all 0.2s',
    background: 'transparent',
    border: '1px solid transparent',
  },
  linkActive: {
    color: '#a5b4fc',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 0 2px rgba(99,102,241,0.35)',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#f1f5f9',
    lineHeight: 1,
  },
  rolePill: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
};

export default Navbar;