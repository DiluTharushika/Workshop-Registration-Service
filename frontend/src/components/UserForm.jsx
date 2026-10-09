import { useState } from 'react';

const UserForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Create User Account</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        name="name"
        placeholder="Full name"
        value={form.name}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        type="email"
        name="email"
        placeholder="Email address"
        value={form.email}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        minLength={6}
        style={styles.input}
      />
      <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
        <option value="staff">Staff</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    maxWidth: '350px',
  },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  submitBtn: {
    padding: '8px 16px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 16px',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default UserForm;