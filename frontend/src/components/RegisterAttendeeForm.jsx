import { useState } from 'react';
import api from '../api/axios';

const RegisterAttendeeForm = ({ workshop, onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/registrations', {
        workshopId: workshop._id,
        attendeeName: name,
        attendeeEmail: email,
      });
      setName('');
      setEmail('');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Register Attendee</h3>
      <p><strong>Workshop:</strong> {workshop.title} ({workshop.bookedSeats}/{workshop.capacity} seats)</p>

      {error && <p style={styles.error}>{error}</p>}

      <input
        placeholder="Attendee name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>
          Close
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
    background: '#f0f9ff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    maxWidth: '400px',
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
  error: { color: 'red', fontSize: '13px' },
};

export default RegisterAttendeeForm;