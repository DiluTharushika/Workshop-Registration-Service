import { useState } from 'react';

const UserForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(form);
      setForm({ name: '', email: '', password: '', role: 'staff' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h3 style={styles.heading}>👤 Create User Account</h3>
        <p style={styles.subheading}>New users will be able to log in immediately</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            ⚠ {error}
          </div>
        )}

        <div style={styles.grid}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="john@company.com"
              value={form.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-field"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="select-field">
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating…' : '✓ Create User'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    background: 'rgba(15, 12, 41, 0.72)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '16px',
    padding: '24px 28px',
    marginBottom: '24px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  },
  header: {
    marginBottom: '18px',
  },
  heading: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  subheading: {
    fontSize: '13px',
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
    marginBottom: '4px',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    opacity: 0.6,
    padding: '2px',
    lineHeight: 1,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '18px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
};

export default UserForm;