import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <strong>Workshop Registration</strong>
        <Link to="/dashboard" style={styles.link}>Workshops</Link>
        <Link to="/registrations" style={styles.link}>Registrations</Link>
        {user?.role === 'admin' && (
          <Link to="/users" style={styles.link}>User Management</Link>
        )}
      </div>
      <div style={styles.right}>
        <span style={{ marginRight: '15px' }}>
          {user?.name} ({user?.role})
        </span>
        <button onClick={handleLogout} style={styles.button}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#1e293b',
    color: 'white',
  },
  left: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { color: 'white', textDecoration: 'none' },
  right: { display: 'flex', alignItems: 'center' },
  button: {
    padding: '6px 12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Navbar;