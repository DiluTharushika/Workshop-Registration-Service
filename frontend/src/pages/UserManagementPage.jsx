import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import UserForm from '../components/UserForm';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (formData) => {
    await api.post('/users', formData);
    setShowForm(false);
    fetchUsers();
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '24px' }}>
        <h2>User Management</h2>

        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? 'Close' : '+ Create User'}
        </button>

        {showForm && <UserForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  addBtn: {
    padding: '8px 16px',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: {
    textAlign: 'left',
    padding: '10px',
    background: '#e5e7eb',
    borderBottom: '2px solid #d1d5db',
  },
  td: { padding: '10px', borderBottom: '1px solid #e5e7eb' },
};

export default UserManagementPage;