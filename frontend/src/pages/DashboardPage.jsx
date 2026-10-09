import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import WorkshopTable from '../components/WorkshopTable';
import WorkshopForm from '../components/WorkshopForm';

/* ─── inject CSS once (hover / focus styles inline-styles can't do) ─── */
const injectCSS = () => {
  if (document.getElementById('dash-styles')) return;
  const el = document.createElement('style');
  el.id = 'dash-styles';
  el.textContent = `
    @keyframes dash-spin { to { transform: rotate(360deg); } }

    .dash-input, .dash-select {
      width: 100%;
      padding: 9px 13px;
      background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 9px;
      color: #f1f5f9;
      font-size: 13.5px;
      font-family: inherit;
      outline: none;
      transition: border-color .22s, box-shadow .22s, background .22s;
      caret-color: #818cf8;
    }
    .dash-input::placeholder { color: rgba(148,163,184,0.45); }
    .dash-input:focus, .dash-select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.20);
      background: rgba(99,102,241,0.07);
    }
    .dash-input:hover:not(:focus), .dash-select:hover:not(:focus) {
      border-color: rgba(255,255,255,0.18);
    }
    .dash-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 18px;
      padding-right: 34px;
      cursor: pointer;
    }
    .dash-select option { background: #1a1040; color: #f1f5f9; }

    /* date input calendar icon colour */
    .dash-input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(0.55) sepia(1) saturate(2) hue-rotate(200deg);
      cursor: pointer;
    }

    /* checkbox */
    .dash-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #94a3b8;
      user-select: none;
      padding: 9px 0;
    }
    .dash-checkbox input[type="checkbox"] {
      width: 16px; height: 16px;
      accent-color: #6366f1;
      cursor: pointer;
    }

    /* stat card hover */
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 22px;
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.07);
      border-top: 3px solid;
      border-radius: 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: transform .2s, box-shadow .2s;
      cursor: default;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.4);
    }

    /* filter tag */
    .active-filter-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(99,102,241,0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99,102,241,0.25);
    }
    .active-filter-tag button {
      background: none;
      border: none;
      color: #a5b4fc;
      cursor: pointer;
      font-size: 13px;
      padding: 0;
      line-height: 1;
      opacity: .7;
    }
    .active-filter-tag button:hover { opacity: 1; }

    .apply-btn {
      padding: 9px 22px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border: none;
      border-radius: 9px;
      font-size: 13.5px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99,102,241,0.35);
      transition: transform .15s, box-shadow .15s;
      white-space: nowrap;
    }
    .apply-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.5); }
    .apply-btn:active { transform: translateY(0); }

    .reset-btn {
      padding: 9px 16px;
      background: transparent;
      color: #64748b;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 9px;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all .2s;
      white-space: nowrap;
    }
    .reset-btn:hover { background: rgba(255,255,255,0.06); color: #94a3b8; }

    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #059669, #10b981);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(16,185,129,0.35);
      transition: transform .15s, box-shadow .15s;
    }
    .add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(16,185,129,0.5); }
    .add-btn.close-mode {
      background: rgba(255,255,255,0.07);
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: none;
    }
    .add-btn.close-mode:hover { background: rgba(255,255,255,0.12); color: #f1f5f9; }

    .loading-spinner {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      color: #64748b; font-size: 14px; padding: 60px 0;
    }
    .loading-spinner::before {
      content: '';
      width: 22px; height: 22px;
      border: 2px solid rgba(99,102,241,0.25);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: dash-spin .75s linear infinite;
    }
  `;
  document.head.appendChild(el);
};

/* ─── small SVG icons ─── */
const Icon = {
  Filter: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Reset: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  ),
};

const EMPTY_FILTERS = { status: '', fromDate: '', toDate: '', availableOnly: false };

const DashboardPage = () => {
  injectCSS();

  const [workshops, setWorkshops]         = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [filters, setFilters]             = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading]             = useState(false);
  const [filterOpen, setFilterOpen]       = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── KEY FIX: accept explicit filter values so there's NO stale closure ── */
  const fetchWorkshops = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const f = activeFilters ?? EMPTY_FILTERS;
      const params = {};
      if (f.status)        params.status        = f.status;
      if (f.fromDate)      params.fromDate      = f.fromDate;
      if (f.toDate)        params.toDate        = f.toDate;
      if (f.availableOnly) params.availableOnly = 'true';

      const { data } = await api.get('/workshops', { params });
      setWorkshops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkshops(EMPTY_FILTERS);
  }, [fetchWorkshops]);

  /* Apply filters — pass current state directly, no closure issue */
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters(filters);       // track what is applied (for tags)
    fetchWorkshops(filters);          // ← pass current filters directly
  };

  /* Reset */
  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    fetchWorkshops(EMPTY_FILTERS);
  };

  /* Remove one tag */
  const removeFilter = (key) => {
    const next = { ...filters, [key]: key === 'availableOnly' ? false : '' };
    setFilters(next);
    setAppliedFilters(next);
    fetchWorkshops(next);
  };

  const handleAddClick = () => { setEditingWorkshop(null); setShowForm(true); };
  const handleEditClick = (w) => { setEditingWorkshop(w); setShowForm(true); };

  const handleFormSubmit = async (formData) => {
    const payload = { ...formData, capacity: Number(formData.capacity) };
    if (editingWorkshop) {
      await api.put(`/workshops/${editingWorkshop._id}`, payload);
    } else {
      await api.post('/workshops', payload);
    }
    setShowForm(false);
    setEditingWorkshop(null);
    fetchWorkshops(appliedFilters);
  };

  const handleViewRegistrations = (w) => navigate(`/registrations?workshopId=${w._id}`);

  /* Stats (from unfiltered workshop list — always show totals) */
  const totalWorkshops  = workshops.length;
  const activeWorkshops = workshops.filter(w => w.status === 'active').length;
  const completedCount  = workshops.filter(w => w.status === 'completed').length;
  const totalSeats      = workshops.reduce((a, w) => a + (w.capacity   || 0), 0);
  const bookedSeats     = workshops.reduce((a, w) => a + (w.bookedSeats|| 0), 0);
  const occupancyPct    = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  /* Active filter tags */
  const filterTags = [
    appliedFilters.status        && { key: 'status',        label: `Status: ${appliedFilters.status}` },
    appliedFilters.fromDate      && { key: 'fromDate',      label: `From: ${appliedFilters.fromDate}` },
    appliedFilters.toDate        && { key: 'toDate',        label: `To: ${appliedFilters.toDate}` },
    appliedFilters.availableOnly && { key: 'availableOnly', label: 'Available seats only' },
  ].filter(Boolean);

  const stats = [
    { label: 'Total Workshops', value: totalWorkshops,  icon: '🎓', color: '#6366f1', sub: 'All time'             },
    { label: 'Active',          value: activeWorkshops,  icon: '🟢', color: '#10b981', sub: 'Currently running'   },
    { label: 'Completed',       value: completedCount,   icon: '✅', color: '#06b6d4', sub: 'Finished sessions'   },
    { label: 'Occupancy',       value: `${occupancyPct}%`, icon: '📊', color: '#f59e0b', sub: `${bookedSeats}/${totalSeats} seats` },
  ];

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">

        {/* ── Page header ── */}
        <div style={s.pageHeader}>
          <div>
            <h2 style={s.pageTitle}>Workshop Catalogue</h2>
            <p style={s.pageDesc}>Manage, filter and track all training workshops</p>
          </div>
          {user.role === 'manager' && (
            <button
              onClick={showForm ? () => setShowForm(false) : handleAddClick}
              className={`add-btn${showForm ? ' close-mode' : ''}`}
            >
              {showForm ? <><Icon.X /> Close Form</> : <><Icon.Plus /> Add Workshop</>}
            </button>
          )}
        </div>

        {/* ── Stats row ── */}
        <div style={s.statsRow}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card"
              style={{ borderTopColor: stat.color }}
            >
              <div style={{ ...s.statIcon, background: `${stat.color}1a`, color: stat.color }}>
                {stat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
                <div style={s.statSub}>{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter panel ── */}
        <div style={s.filterPanel}>
          {/* Filter header bar */}
          <div style={s.filterHeader}>
            <div style={s.filterHeaderLeft}>
              <Icon.Filter />
              <span style={s.filterTitle}>Filter Workshops</span>
              {filterTags.length > 0 && (
                <span style={s.filterCountBadge}>{filterTags.length} active</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFilterOpen(o => !o)}
              style={s.collapseBtn}
            >
              {filterOpen ? '▲ Collapse' : '▼ Expand'}
            </button>
          </div>

          {/* Filter body */}
          {filterOpen && (
            <form onSubmit={handleApplyFilters}>
              <div style={s.filterGrid}>

                {/* Status */}
                <div style={s.filterField}>
                  <label style={s.filterLabel}>Status</label>
                  <select
                    value={filters.status}
                    onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                    className="dash-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* From date */}
                <div style={s.filterField}>
                  <label style={s.filterLabel}>From Date</label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))}
                    className="dash-input"
                  />
                </div>

                {/* To date */}
                <div style={s.filterField}>
                  <label style={s.filterLabel}>To Date</label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))}
                    className="dash-input"
                  />
                </div>

                {/* Available only */}
                <div style={s.filterField}>
                  <label style={s.filterLabel}>Availability</label>
                  <label className="dash-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.availableOnly}
                      onChange={e => setFilters(f => ({ ...f, availableOnly: e.target.checked }))}
                    />
                    Seats available only
                  </label>
                </div>

              </div>

              {/* Filter actions */}
              <div style={s.filterActions}>
                <button type="submit" className="apply-btn">
                  Apply Filters
                </button>
                <button type="button" className="reset-btn" onClick={handleResetFilters}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon.Reset /> Reset
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Active filter tags */}
          {filterTags.length > 0 && (
            <div style={s.tagRow}>
              <span style={s.tagRowLabel}>Applied:</span>
              {filterTags.map(tag => (
                <span key={tag.key} className="active-filter-tag">
                  {tag.label}
                  <button type="button" onClick={() => removeFilter(tag.key)} title="Remove">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Workshop form ── */}
        {showForm && (
          <div className="animate-in">
            <WorkshopForm
              initialData={editingWorkshop}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* ── Results header ── */}
        {!loading && (
          <div style={s.resultsHeader}>
            <span style={s.resultsCount}>
              {workshops.length} workshop{workshops.length !== 1 ? 's' : ''} found
            </span>
            {filterTags.length > 0 && (
              <span style={s.resultsFiltered}>— filtered results</span>
            )}
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="loading-spinner">Loading workshops…</div>
        ) : (
          <WorkshopTable
            workshops={workshops}
            onEdit={handleEditClick}
            onViewRegistrations={handleViewRegistrations}
          />
        )}
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const s = {
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '14px',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '1.55rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #f1f5f9 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.01em',
    marginBottom: '4px',
  },
  pageDesc: {
    fontSize: '13px',
    color: '#475569',
  },

  /* Stats */
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
    marginBottom: '22px',
  },
  statIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.35rem',
    flexShrink: 0,
  },
  statValue: {
    fontSize: '1.7rem',
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: '2px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statSub: {
    fontSize: '11px',
    color: '#334155',
    marginTop: '2px',
  },

  /* Filter panel */
  filterPanel: {
    background: 'rgba(255,255,255,0.038)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    gap: '10px',
  },
  filterHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
  },
  filterTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.03em',
  },
  filterCountBadge: {
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    background: 'rgba(99,102,241,0.2)',
    color: '#a5b4fc',
    border: '1px solid rgba(99,102,241,0.3)',
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '11.5px',
    fontWeight: 600,
    fontFamily: 'inherit',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'color .2s',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    padding: '18px 20px 6px',
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
  },
  filterActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    padding: '14px 20px 18px',
  },

  /* Active tags */
  tagRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '10px 20px 14px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  tagRowLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#475569',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },

  /* Results */
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  resultsCount: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#64748b',
  },
  resultsFiltered: {
    fontSize: '13px',
    color: '#475569',
    fontStyle: 'italic',
  },
};

export default DashboardPage;