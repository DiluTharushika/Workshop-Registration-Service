import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import UserForm from '../components/UserForm';

const roleConfig = {
  admin:   { label: 'Admin',   cls: 'badge-warning' },
  manager: { label: 'Manager', cls: 'badge-info'    },
  staff:   { label: 'Staff',   cls: 'badge-neutral' },
};

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

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (formData) => {
    await api.post('/users', formData);
    setShowForm(false);
    fetchUsers();
  };

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h2 style={{ marginBottom: 4 }}>User Management</h2>
            <p style={styles.pageDesc}>Manage system users and their access roles</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={showForm ? 'btn btn-ghost' : 'btn btn-success'}
          >
            {showForm ? '✕ Close' : '+ Create User'}
          </button>
        </div>

        {/* User form */}
        {showForm && (
          <div className="animate-in">
            <UserForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Users table */}
        {loading ? (
          <div className="loading-pulse">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="glass-table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>No users found</p>
              <p style={{ fontSize: '13px', color: '#475569' }}>Create the first user account above</p>
            </div>
          </div>
        ) : (
          <div className="glass-table-wrapper animate-in">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const cfg = roleConfig[u.role] || { label: u.role, cls: 'badge-neutral' };
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={styles.userWrap}>
                          <div style={{
                            ...styles.avatar,
                            background: u.role === 'admin'
                              ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                              : u.role === 'manager'
                              ? 'linear-gradient(135deg, #06b6d4, #22d3ee)'
                              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          }}>
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span style={styles.userName}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '13px' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '24px',
  },
  pageDesc: {
    fontSize: '13.5px',
    color: '#64748b',
  },
  userWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userName: {
    fontWeight: 600,
    color: '#f1f5f9',
    fontSize: '13.5px',
  },
};

export default UserManagementPage;