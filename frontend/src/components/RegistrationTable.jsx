const RegistrationTable = ({ registrations, onCancel }) => {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Attendee</th>
          <th style={styles.th}>Email</th>
          <th style={styles.th}>Workshop</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Registered By</th>
          <th style={styles.th}>Registered At</th>
          <th style={styles.th}>Cancelled By</th>
          <th style={styles.th}>Cancelled At</th>
          <th style={styles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {registrations.length === 0 && (
          <tr>
            <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
              No registrations found
            </td>
          </tr>
        )}
        {registrations.map((r) => (
          <tr key={r._id}>
            <td style={styles.td}>{r.attendeeName}</td>
            <td style={styles.td}>{r.attendeeEmail}</td>
            <td style={styles.td}>{r.workshop?.title || '—'}</td>
            <td style={styles.td}>
              <span style={{ color: r.status === 'cancelled' ? 'red' : 'green' }}>
                {r.status}
              </span>
            </td>
            <td style={styles.td}>{r.registeredBy?.name || '—'}</td>
            <td style={styles.td}>{r.registeredAt ? new Date(r.registeredAt).toLocaleString() : '—'}</td>
            <td style={styles.td}>{r.cancelledBy?.name || '—'}</td>
            <td style={styles.td}>{r.cancelledAt ? new Date(r.cancelledAt).toLocaleString() : '—'}</td>
            <td style={styles.td}>
              {r.status === 'active' && (
                <button onClick={() => onCancel(r)} style={styles.cancelBtn}>
                  Cancel
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '13px' },
  th: {
    textAlign: 'left',
    padding: '8px',
    background: '#e5e7eb',
    borderBottom: '2px solid #d1d5db',
  },
  td: { padding: '8px', borderBottom: '1px solid #e5e7eb' },
  cancelBtn: {
    padding: '4px 10px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default RegistrationTable;