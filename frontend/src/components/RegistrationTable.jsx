const RegistrationTable = ({ registrations, onCancel }) => {
  if (registrations.length === 0) {
    return (
      <div className="glass-table-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>No registrations found</p>
          <p style={{ fontSize: '13px', color: '#475569' }}>
            Select a workshop and register attendees to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-table-wrapper animate-in">
      <table className="glass-table">
        <thead>
          <tr>
            <th>Attendee</th>
            <th>Email</th>
            <th>Workshop</th>
            <th>Status</th>
            <th>Registered By</th>
            <th>Registered At</th>
            <th>Cancelled By</th>
            <th>Cancelled At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r._id}>
              <td>
                <div style={styles.attendeeWrap}>
                  <div style={styles.attendeeAvatar}>
                    {r.attendeeName?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <span style={styles.attendeeName}>{r.attendeeName}</span>
                </div>
              </td>
              <td style={{ color: '#94a3b8', fontSize: '13px' }}>{r.attendeeEmail}</td>
              <td>
                {r.workshop?.title ? (
                  <span style={styles.workshopTitle}>{r.workshop.title}</span>
                ) : (
                  <span style={{ color: '#475569' }}>—</span>
                )}
              </td>
              <td>
                <span className={`badge ${r.status === 'cancelled' ? 'badge-danger' : 'badge-success'}`}>
                  {r.status}
                </span>
              </td>
              <td style={{ color: '#94a3b8', fontSize: '13px' }}>
                {r.registeredBy?.name || '—'}
              </td>
              <td style={styles.dateCell}>
                {r.registeredAt ? (
                  <>
                    <span>{new Date(r.registeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span style={styles.time}>{new Date(r.registeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : '—'}
              </td>
              <td style={{ color: '#94a3b8', fontSize: '13px' }}>
                {r.cancelledBy?.name || '—'}
              </td>
              <td style={styles.dateCell}>
                {r.cancelledAt ? (
                  <>
                    <span>{new Date(r.cancelledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span style={styles.time}>{new Date(r.cancelledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : '—'}
              </td>
              <td>
                {r.status === 'active' ? (
                  <button
                    onClick={() => onCancel(r)}
                    className="btn btn-danger"
                    style={{ padding: '5px 12px', fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                ) : (
                  <span style={{ color: '#475569', fontSize: '12px' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  attendeeWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  attendeeAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  attendeeName: {
    fontWeight: 600,
    color: '#f1f5f9',
    fontSize: '13.5px',
  },
  workshopTitle: {
    fontSize: '13px',
    color: '#a5b4fc',
    fontWeight: 500,
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '13px',
  },
  time: {
    fontSize: '11.5px',
    color: '#64748b',
  },
};

export default RegistrationTable;