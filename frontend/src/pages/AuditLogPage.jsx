import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

/* ── inject CSS once ── */
const injectCSS = () => {
  if (document.getElementById('audit-styles')) return;
  const el = document.createElement('style');
  el.id = 'audit-styles';
  el.textContent = `
    @keyframes audit-spin { to { transform: rotate(360deg); } }
    @keyframes audit-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .audit-row { animation: audit-in 0.2s ease both; }
    .audit-row:hover td { background: rgba(99,102,241,0.05) !important; }

    .audit-loading {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      color: #64748b; font-size: 14px; padding: 60px 0;
    }
    .audit-loading::before {
      content: '';
      width: 22px; height: 22px;
      border: 2px solid rgba(99,102,241,0.2);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: audit-spin .75s linear infinite;
    }

    .audit-filter-select {
      padding: 8px 30px 8px 12px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.11);
      border-radius: 9px;
      color: var(--text-primary);
      font-size: 13px; font-family: inherit;
      outline: none; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 8px center; background-size: 16px;
      cursor: pointer; transition: border-color .2s, box-shadow .2s;
    }
    .audit-filter-select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
    }
    .audit-filter-select option { background: #1a1040; color: #f1f5f9; }

    .audit-changes-cell {
      max-width: 280px;
      overflow: hidden;
    }
    .audit-change-item {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11.5px; margin: 2px 2px 0 0;
      padding: 2px 7px; border-radius: 6px;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.15);
      color: #a5b4fc; white-space: nowrap;
    }
    .audit-from { color: #f87171; text-decoration: line-through; opacity: 0.7; }
    .audit-to   { color: #34d399; }

    .pagination-btn {
      padding: 6px 14px;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 7px;
      background: rgba(255,255,255,0.05);
      color: var(--text-secondary);
      font-size: 12.5px; font-family: inherit; font-weight: 600;
      cursor: pointer; transition: all .2s;
    }
    .pagination-btn:hover:not(:disabled) {
      background: rgba(99,102,241,0.12); color: #a5b4fc;
      border-color: rgba(99,102,241,0.25);
    }
    .pagination-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  `;
  document.head.appendChild(el);
};

/* ── Action badge colours ── */
const actionConfig = {
  WORKSHOP_CREATED:       { label: 'Workshop Created',      color: '#10b981', icon: '➕' },
  WORKSHOP_UPDATED:       { label: 'Workshop Updated',      color: '#6366f1', icon: '✏️' },
  REGISTRATION_CREATED:   { label: 'Registered',            color: '#06b6d4', icon: '📋' },
  REGISTRATION_CANCELLED: { label: 'Registration Cancelled',color: '#ef4444', icon: '❌' },
  WAITLIST_JOINED:        { label: 'Joined Waitlist',       color: '#f59e0b', icon: '⏳' },
  WAITLIST_LEFT:          { label: 'Left Waitlist',         color: '#94a3b8', icon: '👋' },
  WAITLIST_PROMOTED:      { label: 'Waitlist Promoted',     color: '#8b5cf6', icon: '🚀' },
  USER_CREATED:           { label: 'User Created',          color: '#10b981', icon: '👤' },
  USER_ROLE_CHANGED:      { label: 'Role Changed',          color: '#f59e0b', icon: '🔑' },
};

const formatChanges = (changes) => {
  if (!changes || Object.keys(changes).length === 0) return null;
  return Object.entries(changes).map(([field, val]) => {
    if (val && typeof val === 'object' && 'from' in val) {
      return (
        <span key={field} className="audit-change-item">
          <strong>{field}:</strong>
          <span className="audit-from">{String(val.from)?.slice(0, 20)}</span>
          →
          <span className="audit-to">{String(val.to)?.slice(0, 20)}</span>
        </span>
      );
    }
    return null;
  });
};

const AuditLogPage = () => {
  injectCSS();

  const [logs, setLogs]               = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);
  const [loading, setLoading]         = useState(false);
  const [targetType, setTargetType]   = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const LIMIT = 20;

  const fetchLogs = useCallback(async (pg, type, act) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page: pg };
      if (type) params.targetType = type;
      if (act)  params.action     = act;
      const { data } = await api.get('/audit', { params });
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page, targetType, actionFilter);
  }, [page, targetType, actionFilter, fetchLogs]);

  const handleTypeChange = (v) => { setTargetType(v); setPage(1); };
  const handleActionChange = (v) => { setActionFilter(v); setPage(1); };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">
        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <h2 style={s.pageTitle}>Audit Trail</h2>
            <p style={s.pageDesc}>Complete history of every action performed in the system</p>
          </div>
          <div style={s.totalBadge}>
            <span style={s.totalNum}>{total}</span>
            <span style={s.totalLabel}>total events</span>
          </div>
        </div>

        {/* Filters */}
        <div style={s.filterBar}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Category</label>
            <select value={targetType} onChange={e => handleTypeChange(e.target.value)} className="audit-filter-select">
              <option value="">All Categories</option>
              <option value="Workshop">Workshops</option>
              <option value="Registration">Registrations</option>
              <option value="User">Users</option>
              <option value="Waitlist">Waitlist</option>
            </select>
          </div>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Action Type</label>
            <select value={actionFilter} onChange={e => handleActionChange(e.target.value)} className="audit-filter-select">
              <option value="">All Actions</option>
              <option value="CREATED">Created</option>
              <option value="UPDATED">Updated</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="WAITLIST">Waitlist</option>
              <option value="ROLE">Role Changes</option>
            </select>
          </div>
          {(targetType || actionFilter) && (
            <button
              onClick={() => { setTargetType(''); setActionFilter(''); setPage(1); }}
              style={s.clearBtn}
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="audit-loading">Loading audit logs…</div>
        ) : logs.length === 0 ? (
          <div className="glass-table-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>No audit events yet</p>
              <p style={{ fontSize: '13px', color: '#475569' }}>Events will appear here as actions are performed</p>
            </div>
          </div>
        ) : (
          <div className="glass-table-wrapper animate-in">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Target</th>
                  <th>Changes</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const cfg = actionConfig[log.action] || { label: log.action, color: '#94a3b8', icon: '•' };
                  return (
                    <tr key={log._id} className="audit-row" style={{ animationDelay: `${idx * 20}ms` }}>
                      {/* Action */}
                      <td>
                        <div style={s.actionCell}>
                          <span style={{ ...s.actionIcon, background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                            {cfg.icon}
                          </span>
                          <span style={{ ...s.actionLabel, color: cfg.color }}>{cfg.label}</span>
                        </div>
                      </td>

                      {/* Performed by */}
                      <td>
                        <div style={s.userCell}>
                          <div style={s.miniAvatar}>
                            {log.performedBy?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={s.userName}>{log.performedBy?.name || '—'}</div>
                            <div style={s.userRole}>{log.performedBy?.role || ''}</div>
                          </div>
                        </div>
                      </td>

                      {/* Target */}
                      <td>
                        <div style={s.targetLabel}>{log.targetLabel || '—'}</div>
                        <div style={s.targetType}>
                          <span style={s.targetTypePill}>{log.targetType}</span>
                        </div>
                      </td>

                      {/* Changes */}
                      <td>
                        <div className="audit-changes-cell">
                          {formatChanges(log.changes) || (
                            log.meta && Object.keys(log.meta).length > 0 ? (
                              <span style={s.metaText}>
                                {Object.entries(log.meta)
                                  .slice(0, 2)
                                  .map(([k, v]) => `${k}: ${String(v).slice(0,30)}`)
                                  .join(' · ')}
                              </span>
                            ) : (
                              <span style={{ color: '#334155', fontSize: '12px' }}>—</span>
                            )
                          )}
                        </div>
                      </td>

                      {/* Time */}
                      <td>
                        <div style={s.timeMain}>
                          {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={s.timeSub}>
                          {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          <span style={s.timeAgo}> · {timeAgo(log.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={s.pagination}>
            <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              ← Prev
            </button>
            <span style={s.pageInfo}>
              Page <strong>{page}</strong> of <strong>{pages}</strong>
              <span style={{ color: '#475569', marginLeft: 8 }}>({total} events)</span>
            </span>
            <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  pageHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '14px', marginBottom: '22px',
  },
  pageTitle: {
    fontSize: '1.55rem', fontWeight: 800,
    background: 'linear-gradient(135deg, #f1f5f9 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    letterSpacing: '-0.01em', marginBottom: '4px',
  },
  pageDesc: { fontSize: '13px', color: '#475569' },
  totalBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    padding: '10px 18px',
    background: 'rgba(99,102,241,0.10)',
    border: '1px solid rgba(99,102,241,0.20)',
    borderRadius: '12px',
  },
  totalNum: { fontSize: '1.5rem', fontWeight: 800, color: '#a5b4fc', lineHeight: 1 },
  totalLabel: { fontSize: '10.5px', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },

  filterBar: {
    display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap',
    background: 'rgba(255,255,255,0.038)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '16px 20px', marginBottom: '18px',
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  filterLabel: {
    fontSize: '11px', fontWeight: 700, color: '#64748b',
    letterSpacing: '0.07em', textTransform: 'uppercase',
  },
  clearBtn: {
    padding: '8px 14px',
    background: 'transparent', color: '#64748b',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, fontFamily: 'inherit',
    cursor: 'pointer', alignSelf: 'flex-end',
  },

  actionCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  actionIcon: {
    width: '28px', height: '28px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', flexShrink: 0,
  },
  actionLabel: { fontSize: '12.5px', fontWeight: 700, whiteSpace: 'nowrap' },

  userCell: { display: 'flex', alignItems: 'center', gap: '9px' },
  miniAvatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '11px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userName: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 },
  userRole: { fontSize: '11px', color: '#475569', textTransform: 'capitalize' },

  targetLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' },
  targetType:  { display: 'flex' },
  targetTypePill: {
    fontSize: '10.5px', fontWeight: 700, padding: '1px 8px', borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)', color: '#64748b',
    border: '1px solid rgba(255,255,255,0.08)', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  metaText: { fontSize: '12px', color: '#475569', fontStyle: 'italic' },

  timeMain: { fontSize: '13px', color: 'var(--text-secondary)' },
  timeSub:  { fontSize: '11.5px', color: '#475569' },
  timeAgo:  { color: '#334155' },

  pagination: {
    display: 'flex', alignItems: 'center', gap: '12px',
    justifyContent: 'center', marginTop: '20px',
  },
  pageInfo: { fontSize: '13px', color: '#64748b' },
};

export default AuditLogPage;
