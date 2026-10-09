import { useState } from 'react';
import api from '../api/axios';

const RegisterAttendeeForm = ({ workshop, onSuccess, onCancel, onWaitlistSuccess }) => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const isFull = workshop.bookedSeats >= workshop.capacity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isFull) {
        // Join waitlist
        await api.post(`/workshops/${workshop._id}/waitlist`, {
          attendeeName: name,
          attendeeEmail: email,
        });
        setName(''); setEmail('');
        onWaitlistSuccess?.();
      } else {
        // Normal registration
        await api.post('/registrations', {
          workshopId: workshop._id,
          attendeeName: name,
          attendeeEmail: email,
        });
        setName(''); setEmail('');
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || (isFull ? 'Failed to join waitlist' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isFull ? '#f59e0b' : '#06b6d4';
  const seatsLeft   = workshop.capacity - workshop.bookedSeats;

  return (
    <div style={{ ...s.wrapper, borderColor: `${accentColor}30`, background: isFull ? 'rgba(245,158,11,0.04)' : 'rgba(6,182,212,0.04)' }}>
      <div style={s.header}>
        <h3 style={s.heading}>
          {isFull ? '⏳ Join Waitlist' : '📝 Register Attendee'}
        </h3>
        <div style={s.workshopInfo}>
          <span style={{ ...s.workshopName, color: accentColor }}>{workshop.title}</span>
          <span style={{ ...s.seatsBadge, background: `${accentColor}14`, color: accentColor, border: `1px solid ${accentColor}28` }}>
            {isFull
              ? `Full · ${workshop.waitlist?.length ?? 0} on waitlist`
              : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>
        {isFull && (
          <p style={s.waitlistNote}>
            This workshop is full. Adding to the waitlist — they will be automatically registered when a seat becomes available.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={s.errorBox}>⚠ {error}</div>
        )}

        <div style={s.grid}>
          <div className="form-group">
            <label className="form-label">Attendee Name</label>
            <input
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
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
              onChange={e => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
        </div>

        <div style={s.actions}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.submitBtn,
              background: isFull
                ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                : 'linear-gradient(135deg, #059669, #10b981)',
              boxShadow: isFull
                ? '0 4px 14px rgba(245,158,11,0.35)'
                : '0 4px 14px rgba(16,185,129,0.35)',
            }}
          >
            {loading
              ? (isFull ? 'Adding to waitlist…' : 'Registering…')
              : (isFull ? '+ Add to Waitlist' : '✓ Register Attendee')}
          </button>
          <button type="button" onClick={onCancel} style={s.cancelBtn}>
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

const s = {
  wrapper: {
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid',
    borderRadius: '16px',
    padding: '22px 26px',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
  },
  header:       { marginBottom: '18px' },
  heading:      { fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' },
  workshopInfo: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' },
  workshopName: { fontSize: '13px', fontWeight: 600 },
  seatsBadge: {
    fontSize: '12px', padding: '3px 10px', borderRadius: '999px', fontWeight: 600,
  },
  waitlistNote: {
    fontSize: '12.5px', color: '#92400e',
    background: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.22)',
    borderRadius: '8px', padding: '8px 12px', lineHeight: 1.5,
  },
  errorBox: {
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px', color: '#f87171', fontSize: '13px', fontWeight: 500,
    marginBottom: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px', marginBottom: '18px',
  },
  actions: { display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  submitBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '10px 20px', color: '#fff',
    border: 'none', borderRadius: '10px',
    fontSize: '13.5px', fontWeight: 700, fontFamily: 'inherit',
    cursor: 'pointer', transition: 'transform .15s',
  },
  cancelBtn: {
    padding: '10px 18px',
    background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '10px', fontSize: '13px', fontWeight: 600,
    fontFamily: 'inherit', cursor: 'pointer',
  },
};

export default RegisterAttendeeForm;