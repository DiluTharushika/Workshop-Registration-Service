import { useAuth } from '../context/AuthContext';

const statusConfig = {
  active:    { label: 'Active',    cls: 'badge-success' },
  cancelled: { label: 'Cancelled', cls: 'badge-danger'  },
  completed: { label: 'Completed', cls: 'badge-info'    },
};

const WorkshopTable = ({ workshops, onEdit, onViewRegistrations }) => {
  const { user } = useAuth();

  if (workshops.length === 0) {
    return (
      <div className="glass-table-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">🎓</div>
          <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>No workshops found</p>
          <p style={{ fontSize: '13px', color: '#475569' }}>Try adjusting your filters or add a new workshop</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-table-wrapper animate-in">
      <table className="glass-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Title</th>
            <th>Instructor</th>
            <th>Date & Time</th>
            <th>Seats</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workshops.map((w) => {
            const isFull = w.bookedSeats >= w.capacity;
            const fillPct = w.capacity > 0 ? Math.round((w.bookedSeats / w.capacity) * 100) : 0;
            const cfg = statusConfig[w.status] || { label: w.status, cls: 'badge-neutral' };

            return (
              <tr key={w._id}>
                <td>
                  <code style={styles.code}>{w.code}</code>
                </td>
                <td>
                  <span style={styles.title}>{w.title}</span>
                  {w.description && (
                    <span style={styles.desc} title={w.description}>
                      {w.description.length > 50 ? w.description.slice(0, 50) + '…' : w.description}
                    </span>
                  )}
                </td>
                <td style={{ color: '#94a3b8' }}>{w.instructor}</td>
                <td style={styles.dateCell}>
                  {new Date(w.dateTime).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                  <span style={styles.time}>
                    {new Date(w.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>
                <td>
                  <div style={styles.seatsWrap}>
                    <span style={isFull ? styles.seatsFull : styles.seatsOk}>
                      {w.bookedSeats}/{w.capacity}
                    </span>
                    <div style={styles.progress}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${fillPct}%`,
                          background: isFull
                            ? 'linear-gradient(90deg, #ef4444, #f87171)'
                            : fillPct > 70
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #10b981, #34d399)',
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                </td>
                <td>
                  <div style={styles.actions}>
                    {user.role === 'manager' && (
                      <button
                        onClick={() => onEdit(w)}
                        className="btn btn-ghost"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                      >
                        ✏ Edit
                      </button>
                    )}
                    <button
                      onClick={() => onViewRegistrations(w)}
                      className="btn btn-primary"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                    >
                      👥 Register / View
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  code: {
    background: 'rgba(99,102,241,0.15)',
    color: '#a5b4fc',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid rgba(99,102,241,0.2)',
  },
  title: {
    display: 'block',
    fontWeight: 600,
    color: '#f1f5f9',
    marginBottom: '2px',
  },
  desc: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  time: {
    fontSize: '11.5px',
    color: '#64748b',
  },
  seatsWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  seatsOk: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#34d399',
  },
  seatsFull: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#f87171',
  },
  progress: {
    width: '80px',
    height: '4px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  },
  actions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
};

export default WorkshopTable;