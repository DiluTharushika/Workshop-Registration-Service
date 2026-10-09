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
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const seatsLeft = workshop.capacity - workshop.bookedSeats;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h3 style={styles.heading}>📝 Register Attendee</h3>
        <div style={styles.workshopInfo}>
          <span style={styles.workshopName}>{workshop.title}</span>
          <span style={styles.seatsInfo}>
            {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} remaining
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '14px' }}>
            ⚠ {error}
          </div>
        )}

        <div style={styles.grid}>
          <div className="form-group">
            <label className="form-label">Attendee Name</label>
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Registering…' : '✓ Register Attendee'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    background: 'rgba(6, 182, 212, 0.05)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    borderRadius: '16px',
    padding: '22px 26px',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
  },
  header: {
    marginBottom: '18px',
  },
  heading: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  workshopInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  workshopName: {
    fontSize: '13px',
    color: '#22d3ee',
    fontWeight: 600,
  },
  seatsInfo: {
    fontSize: '12px',
    background: 'rgba(6, 182, 212, 0.12)',
    color: '#22d3ee',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '3px 10px',
    borderRadius: '999px',
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
    marginBottom: '18px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(6, 182, 212, 0.1)',
  },
};

export default RegisterAttendeeForm;