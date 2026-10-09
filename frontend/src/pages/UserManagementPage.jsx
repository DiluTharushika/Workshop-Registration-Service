import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import UserForm from '../components/UserForm';
import { useAuth } from '../context/AuthContext';


/* ── inject CSS ── */
const injectCSS = () => {
  if (document.getElementById('usermgmt-styles')) return;
  const el = document.createElement('style');
  el.id = 'usermgmt-styles';
  el.textContent = `
    @keyframes um-spin { to { transform: rotate(360deg); } }
    @keyframes um-in {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .um-search {
      width: 100%;
      padding: 10px 14px 10px 40px;
      background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 10px;
      color: #f1f5f9;
      font-size: 13.5px;
      font-family: inherit;
      outline: none;
      transition: border-color .22s, box-shadow .22s, background .22s;
      caret-color: #818cf8;
    }
    .um-search::placeholder { color: rgba(148,163,184,0.45); }
    .um-search:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
      background: rgba(99,102,241,0.06);
    }
    .um-search:hover:not(:focus) { border-color: rgba(255,255,255,0.18); }

    .um-role-filter {
      padding: 9px 32px 9px 12px;
      background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 10px;
      color: #f1f5f9;
      font-size: 13.5px;
      font-family: inherit;
      outline: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 16px;
      cursor: pointer;
      min-width: 130px;
      transition: border-color .2s, box-shadow .2s;
    }
    .um-role-filter:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
    }
    .um-role-filter option { background: #1a1040; color: #f1f5f9; }

    .um-row { animation: um-in 0.25s ease both; }

    .um-table-row:hover { background: rgba(255,255,255,0.035) !important; }

    .um-create-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #059669, #10b981);
      color: #fff;
      border: none; border-radius: 10px;
      font-size: 13.5px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(16,185,129,0.35);
      transition: transform .15s, box-shadow .15s;
      white-space: nowrap;
    }
    .um-create-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(16,185,129,0.5); }
    .um-create-btn.close-mode {
      background: rgba(255,255,255,0.07);
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: none;
    }
    .um-create-btn.close-mode:hover { background: rgba(255,255,255,0.12); color: #f1f5f9; }

    .um-loading {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      color: #64748b; font-size: 14px; padding: 60px 0;
    }
    .um-loading::before {
      content: '';
      width: 22px; height: 22px;
      border: 2px solid rgba(99,102,241,0.25);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: um-spin .75s linear infinite;
    }
    .um-role-select {
      padding: 6px 28px 6px 10px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      color: #f1f5f9; font-size: 12.5px; font-family: inherit;
      outline: none; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 7px center; background-size: 14px;
      cursor: pointer; min-width: 100px; transition: border-color .2s;
    }
    .um-role-select:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.20); }
    .um-role-select option { background: #1a1040; }

    .um-save-btn {
      padding: 5px 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; border: none; border-radius: 7px;
      font-size: 12px; font-weight: 700; font-family: inherit;
      cursor: pointer; transition: opacity .2s;
    }
    .um-save-btn:hover { opacity: 0.85; }
    .um-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  document.head.appendChild(el);
};

const roleConfig = {
  admin:   { label: 'Admin',   badgeCls: 'badge-warning', color: '#f59e0b', avatarGrad: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  manager: { label: 'Manager', badgeCls: 'badge-info',    color: '#06b6d4', avatarGrad: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  staff:   { label: 'Staff',   badgeCls: 'badge-neutral', color: '#8b5cf6', avatarGrad: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
};

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const UserManagementPage = () => {
  injectCSS();

  const { user: currentUser } = useAuth();
  const [users, setUsers]           = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingRoles, setEditingRoles] = useState({}); // { userId: newRole }
  const [savingRole, setSavingRole]     = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (formData) => {
    await api.post('/users', formData);
    setShowForm(false);
    fetchUsers();
  };

  const updateRole = async (userId) => {
    const newRole = editingRoles[userId];
    if (!newRole) return;
    setSavingRole(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setEditingRoles(r => { const n = { ...r }; delete n[userId]; return n; });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setSavingRole('');
    }
  };


  /* Filtered users */
  const filteredUsers = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* Role distribution stats */
  const adminCount   = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'manager').length;
  const staffCount   = users.filter(u => u.role === 'staff').length;

  const stats = [
    { label: 'Total Users', value: users.length,   icon: '👥', color: '#6366f1', sub: 'Registered accounts' },
    { label: 'Admins',      value: adminCount,      icon: '👑', color: '#f59e0b', sub: 'Full access'         },
    { label: 'Managers',    value: managerCount,    icon: '🎓', color: '#06b6d4', sub: 'Workshop control'    },
    { label: 'Staff',       value: staffCount,      icon: '🧑‍💼', color: '#8b5cf6', sub: 'Registration access' },
  ];

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">

        {/* ── Page header ── */}
        <div style={s.pageHeader}>
          <div>
            <h2 style={s.pageTitle}>User Management</h2>
            <p style={s.pageDesc}>Manage system accounts and role-based access control</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className={`um-create-btn${showForm ? ' close-mode' : ''}`}
          >
            {showForm ? <><XIcon /> Close</> : <><PlusIcon /> Create User</>}
          </button>
        </div>

        {/* ── Stats row ── */}
        <div style={s.statsRow}>
          {stats.map(stat => (
            <div key={stat.label} className="stat-card" style={{ borderTopColor: stat.color }}>
              <div style={{ ...s.statIcon, background: `${stat.color}1a`, color: stat.color }}>
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
                <div style={s.statSub}>{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Create user form ── */}
        {showForm && (
          <div className="animate-in">
            <UserForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* ── Search + filter bar ── */}
        <div style={s.searchBar}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="um-search"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="um-role-filter"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
          {(search || roleFilter) && (
            <button
              onClick={() => { setSearch(''); setRoleFilter(''); }}
              style={s.clearBtn}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Users table ── */}
        {loading ? (
          <div className="um-loading">Loading users…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                {users.length === 0 ? 'No users yet' : 'No users match your search'}
              </p>
              <p style={{ fontSize: '13px', color: '#475569' }}>
                {users.length === 0
                  ? 'Create the first user account using the button above'
                  : 'Try adjusting your search or role filter'}
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-table-wrapper animate-in">
            {/* Results count */}
            <div style={s.tableHeader}>
              <span style={s.tableCount}>
                {filteredUsers.length} of {users.length} users
              </span>
              {(search || roleFilter) && (
                <span style={s.tableFiltered}>— filtered</span>
              )}
            </div>

            <table className="glass-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Change Role</th>
                  <th>Access Level</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const cfg = roleConfig[u.role] || roleConfig.staff;
                  const isSelf = String(u._id) === String(currentUser?._id);
                  const pendingRole = editingRoles[u._id];
                  const isDirty = pendingRole && pendingRole !== u.role;
                  return (
                    <tr
                      key={u._id}
                      className="um-table-row um-row"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      {/* User */}
                      <td>
                        <div style={s.userCell}>
                          <div style={{ ...s.avatar, background: cfg.avatarGrad }}>
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={s.userName}>
                              {u.name}
                              {isSelf && <span style={s.selfBadge}>You</span>}
                            </div>
                            <div style={s.userSub}>#{u._id?.slice(-6)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <div style={s.emailCell}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          <span style={s.emailText}>{u.email}</span>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td>
                        <span className={`badge ${cfg.badgeCls}`}>{cfg.label}</span>
                      </td>

                      {/* Change Role (editable, hidden for self) */}
                      <td>
                        {isSelf ? (
                          <span style={s.selfNote}>Can't edit own role</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                            <select
                              className="um-role-select"
                              value={pendingRole ?? u.role}
                              onChange={e => setEditingRoles(r => ({ ...r, [u._id]: e.target.value }))}
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="staff">Staff</option>
                            </select>
                            {isDirty && (
                              <button
                                className="um-save-btn"
                                disabled={savingRole === u._id}
                                onClick={() => updateRole(u._id)}
                              >
                                {savingRole === u._id ? '…' : 'Save'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Access level */}
                      <td>
                        <span style={s.accessText}>
                          {u.role === 'admin' ? 'Full system access'
                            : u.role === 'manager' ? 'Create & manage workshops'
                            : 'Register & view only'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td>
                        <div style={s.dateCell}>
                          {u.createdAt ? (
                            <>
                              <span style={s.dateMain}>
                                {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span style={s.dateTime}>
                                {new Date(u.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </>
                          ) : '—'}
                        </div>
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

const s = {
  pageHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '14px', marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '1.55rem', fontWeight: 800,
    background: 'linear-gradient(135deg, #f1f5f9 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    letterSpacing: '-0.01em', marginBottom: '4px',
  },
  pageDesc: { fontSize: '13px', color: '#475569' },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '14px',
    marginBottom: '22px',
  },
  statIcon: {
    width: '46px', height: '46px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.35rem', flexShrink: 0,
  },
  statValue: {
    fontSize: '1.7rem', fontWeight: 800, lineHeight: 1, marginBottom: '2px',
  },
  statLabel: {
    fontSize: '12px', color: '#64748b', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  statSub: { fontSize: '11px', color: '#334155', marginTop: '2px' },

  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  clearBtn: {
    padding: '9px 14px',
    background: 'transparent',
    color: '#64748b',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '9px',
    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all .2s',
    whiteSpace: 'nowrap',
  },

  tableHeader: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '12px 16px 0',
  },
  tableCount: { fontSize: '13px', fontWeight: 700, color: '#64748b' },
  tableFiltered: { fontSize: '13px', color: '#475569', fontStyle: 'italic' },

  userCell: {
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    color: '#fff', fontSize: '13px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  userName: { fontWeight: 700, color: '#f1f5f9', fontSize: '13.5px', marginBottom: '2px' },
  userSub:  { fontSize: '11px', color: '#334155', fontFamily: 'monospace' },

  emailCell: {
    display: 'flex', alignItems: 'center', gap: '7px',
  },
  emailText: { fontSize: '13px', color: '#94a3b8' },

  accessText: { fontSize: '12.5px', color: '#475569', fontStyle: 'italic' },

  selfBadge: {
    display: 'inline-block', marginLeft: '6px',
    padding: '1px 7px', borderRadius: '999px', fontSize: '10px',
    fontWeight: 700, background: 'rgba(99,102,241,0.15)',
    color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)',
  },
  selfNote: { fontSize: '12px', color: '#475569', fontStyle: 'italic' },

  dateCell: {
    display: 'flex', flexDirection: 'column', gap: '2px',
  },
  dateMain: { fontSize: '13px', color: '#94a3b8' },
  dateTime: { fontSize: '11px', color: '#475569' },
};

export default UserManagementPage;