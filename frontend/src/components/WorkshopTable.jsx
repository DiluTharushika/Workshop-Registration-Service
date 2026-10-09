import { useAuth } from '../context/AuthContext';

const WorkshopTable = ({ workshops, onEdit, onViewRegistrations }) => {
  const { user } = useAuth();

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Code</th>
          <th style={styles.th}>Title</th>
          <th style={styles.th}>Instructor</th>
          <th style={styles.th}>Date</th>
          <th style={styles.th}>Seats</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {workshops.length === 0 && (
          <tr>
            <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
              No workshops found
            </td>
          </tr>
        )}
        {workshops.map((w) => (
          <tr key={w._id}>
            <td style={styles.td}>{w.code}</td>
            <td style={styles.td}>{w.title}</td>
            <td style={styles.td}>{w.instructor}</td>
            <td style={styles.td}>{new Date(w.dateTime).toLocaleString()}</td>
            <td style={styles.td}>
              {w.bookedSeats}/{w.capacity}
              {w.bookedSeats >= w.capacity && (
                <span style={{ color: 'red', marginLeft: '5px' }}>(FULL)</span>
              )}
            </td>
            <td style={styles.td}>{w.status}</td>
            <td style={styles.td}>
              {user.role === 'manager' && (
                <button onClick={() => onEdit(w)} style={styles.btn}>Edit</button>
              )}
              <button onClick={() => onViewRegistrations(w)} style={styles.btn}>
                Register / View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: {
    textAlign: 'left',
    padding: '10px',
    background: '#e5e7eb',
    borderBottom: '2px solid #d1d5db',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #e5e7eb',
  },
  btn: {
    marginRight: '6px',
    padding: '4px 10px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default WorkshopTable;