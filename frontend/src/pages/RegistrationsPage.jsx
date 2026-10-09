import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import RegisterAttendeeForm from '../components/RegisterAttendeeForm';
import RegistrationTable from '../components/RegistrationTable';

/* ── inject CSS once ── */
const injectCSS = () => {
  if (document.getElementById('reg-page-styles')) return;
  const el = document.createElement('style');
  el.id = 'reg-page-styles';
  el.textContent = `
    @keyframes reg-spin { to { transform: rotate(360deg); } }
    .reg-select {
      width: 100%;
      padding: 10px 36px 10px 14px;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 10px;
      color: var(--input-text);
      font-size: 14px; font-family: inherit;
      outline: none; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center; background-size: 18px;
      cursor: pointer; transition: border-color .22s, box-shadow .22s, background .22s;
    }
    .reg-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.20); }
    .reg-select:hover:not(:focus) { border-color: rgba(255,255,255,0.22); }
    .reg-select option { background: #1a1040; color: #f1f5f9; }

    .reg-status-select {
      padding: 7px 30px 7px 12px;
      background: var(--input-bg); border: 1px solid var(--input-border);
      border-radius: 8px; color: var(--input-text);
      font-size: 13px; font-family: inherit; outline: none; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 8px center; background-size: 16px;
      cursor: pointer; transition: border-color .2s, box-shadow .2s;
    }
    .reg-status-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.18); }
    .reg-status-select option { background: #1a1040; }

    .reg-loading {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      color: #64748b; font-size: 14px; padding: 60px 0;
    }
    .reg-loading::before {
      content: ''; width: 22px; height: 22px;
      border: 2px solid rgba(99,102,241,0.25); border-top-color: #6366f1;
      border-radius: 50%; animation: reg-spin .75s linear infinite;
    }

    .reg-btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff; border: none; border-radius: 10px;
      font-size: 13.5px; font-weight: 700; font-family: inherit;
      cursor: pointer; box-shadow: 0 4px 14px rgba(16,185,129,0.35);
      transition: transform .15s, box-shadow .15s; white-space: nowrap;
    }
    .reg-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.5); }
    .reg-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .reg-btn-primary.waitlist-mode {
      background: linear-gradient(135deg, #d97706, #f59e0b);
      box-shadow: 0 4px 14px rgba(245,158,11,0.35);
    }

    .waitlist-row:hover { background: rgba(245,158,11,0.04) !important; }
    .waitlist-remove-btn {
      padding: 4px 10px;
      background: rgba(239,68,68,0.10); color: #f87171;
      border: 1px solid rgba(239,68,68,0.22); border-radius: 7px;
      font-size: 12px; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: all .2s;
    }
    .waitlist-remove-btn:hover { background: rgba(239,68,68,0.18); }

    .promoted-toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px;
      background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.28);
      border-radius: 12px; color: #c4b5fd; font-size: 13px; font-weight: 500;
      margin-bottom: 14px; animation: reg-spin 0s; /* just trigger paint */
    }
  `;
  document.head.appendChild(el);
};

const RegistrationsPage = () => {
  injectCSS();

  const [searchParams] = useSearchParams();
  const workshopIdFromUrl = searchParams.get('workshopId');

  const [workshops, setWorkshops]               = useState([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(workshopIdFromUrl || '');
  const [statusFilter, setStatusFilter]         = useState('');
  const [registrations, setRegistrations]       = useState([]);
  const [showForm, setShowForm]                 = useState(false);
  const [error, setError]                       = useState('');
  const [loading, setLoading]                   = useState(false);
  const [promotedMsg, setPromotedMsg]           = useState('');

  const fetchWorkshops = async () => {
    const { data } = await api.get('/workshops');
    setWorkshops(data);
  };

  const fetchRegistrations = useCallback(async (wid, status) => {
    setLoading(true);
    try {
      const params = {};
      if (wid)    params.workshopId = wid;
      if (status) params.status     = status;
      const { data } = await api.get('/registrations', { params });
      setRegistrations(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWorkshops(); }, []);
  useEffect(() => {
    fetchRegistrations(selectedWorkshopId, statusFilter);
  }, [selectedWorkshopId, statusFilter, fetchRegistrations]);

  const selectedWorkshop = workshops.find(w => w._id === selectedWorkshopId);
  const isFull = selectedWorkshop
    ? selectedWorkshop.bookedSeats >= selectedWorkshop.capacity
    : false;

  const refreshAll = () => {
    fetchWorkshops();
    fetchRegistrations(selectedWorkshopId, statusFilter);
  };

  const handleRegisterSuccess = () => {
    setShowForm(false); setError('');
    refreshAll();
  };

  const handleWaitlistSuccess = () => {
    setShowForm(false); setError('');
    fetchWorkshops(); // refresh waitlist count
  };

  const handleCancel = async (registration) => {
    if (!window.confirm(`Cancel registration for ${registration.attendeeName}?`)) return;
    try {
      const { data } = await api.patch(`/registrations/${registration._id}/cancel`);
      if (data.promoted) {
        setPromotedMsg(`🚀 ${data.promoted.attendeeName} was automatically promoted from the waitlist!`);
        setTimeout(() => setPromotedMsg(''), 6000);
      }
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleRemoveFromWaitlist = async (entryId) => {
    if (!selectedWorkshop) return;
    if (!window.confirm('Remove this person from the waitlist?')) return;
    try {
      await api.delete(`/workshops/${selectedWorkshop._id}/waitlist/${entryId}`);
      fetchWorkshops();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove');
    }
  };

  const activeCount    = registrations.filter(r => r.status === 'active').length;
  const cancelledCount = registrations.filter(r => r.status === 'cancelled').length;
  const seatsLeft      = selectedWorkshop ? selectedWorkshop.capacity - selectedWorkshop.bookedSeats : null;
  const waitlist       = selectedWorkshop?.waitlist ?? [];

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <h2 style={s.pageTitle}>Registrations</h2>
            <p style={s.pageDesc}>Track and manage all workshop attendee registrations</p>
          </div>
        </div>

        {/* Promoted toast */}
        {promotedMsg && (
          <div className="promoted-toast">
            <span style={{ fontSize: '20px' }}>🚀</span>
            <span>{promotedMsg}</span>
          </div>
        )}

        {/* Control bar */}
        <div style={s.controlCard}>
          <div style={s.controlRow}>
            <div style={s.selectorGroup}>
              <label style={s.selectorLabel}>Select Workshop</label>
              <select
                value={selectedWorkshopId}
                onChange={e => { setSelectedWorkshopId(e.target.value); setShowForm(false); }}
                className="reg-select"
              >
                <option value="">— All Workshops —</option>
                {workshops.map(w => (
                  <option key={w._id} value={w._id}>
                    {w.title} ({w.bookedSeats}/{w.capacity}
                    {w.waitlist?.length > 0 ? ` · ${w.waitlist.length} waiting` : ''})
                  </option>
                ))}
              </select>
            </div>

            <div style={s.statusGroup}>
              <label style={s.selectorLabel}>Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="reg-status-select">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {selectedWorkshop && selectedWorkshop.status === 'active' && (
              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  onClick={() => setShowForm(v => !v)}
                  className={`reg-btn-primary${isFull ? ' waitlist-mode' : ''}`}
                >
                  {showForm
                    ? '✕ Close'
                    : isFull
                    ? `⏳ Join Waitlist (${waitlist.length})`
                    : '+ Register Attendee'}
                </button>
              </div>
            )}
          </div>

          {/* Workshop details strip */}
          {selectedWorkshop && (
            <div style={s.workshopStrip}>
              {[
                { label: 'Workshop',   value: selectedWorkshop.title },
                { label: 'Date',       value: new Date(selectedWorkshop.dateTime).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) },
                { label: 'Instructor', value: selectedWorkshop.instructor },
                { label: 'Capacity',   value: `${selectedWorkshop.bookedSeats}/${selectedWorkshop.capacity}`, color: isFull ? '#f87171' : '#34d399' },
                { label: 'Waitlist',   value: waitlist.length, color: waitlist.length > 0 ? '#fbbf24' : '#475569' },
              ].map((item, i, arr) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={s.stripItem}>
                    <span style={s.stripLabel}>{item.label}</span>
                    <span style={{ ...s.stripValue, ...(item.color ? { color: item.color } : {}) }}>{item.value}</span>
                  </div>
                  {i < arr.length - 1 && <div style={s.stripDivider} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mini stats */}
        {registrations.length > 0 && (
          <div style={s.miniStats}>
            {[
              { label: 'Total',     value: registrations.length, color: '#a5b4fc' },
              { label: 'Active',    value: activeCount,          color: '#34d399' },
              { label: 'Cancelled', value: cancelledCount,       color: '#f87171' },
              ...(seatsLeft !== null ? [{ label: 'Seats Left', value: seatsLeft, color: '#fbbf24' }] : []),
              ...(waitlist.length > 0 ? [{ label: 'Waitlist', value: waitlist.length, color: '#c4b5fd' }] : []),
            ].map((st, i, arr) => (
              <div key={st.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={s.miniStat}>
                  <span style={{ ...s.miniVal, color: st.color }}>{st.value}</span>
                  <span style={s.miniLabel}>{st.label}</span>
                </div>
                {i < arr.length - 1 && <div style={s.miniDivider} />}
              </div>
            ))}
          </div>
        )}

        {error && <div style={s.errorBox}>⚠ {error}</div>}

        {/* Register / Waitlist form */}
        {showForm && selectedWorkshop && (
          <div className="animate-in">
            <RegisterAttendeeForm
              workshop={selectedWorkshop}
              onSuccess={handleRegisterSuccess}
              onWaitlistSuccess={handleWaitlistSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Waitlist panel */}
        {selectedWorkshop && waitlist.length > 0 && (
          <div style={s.waitlistPanel} className="animate-in">
            <div style={s.waitlistHeader}>
              <div style={s.waitlistTitle}>
                <span style={s.waitlistIcon}>⏳</span>
                <span>Waitlist</span>
                <span style={s.waitlistCount}>{waitlist.length} queued</span>
              </div>
              <p style={s.waitlistNote}>Attendees are auto-promoted when a seat becomes free</p>
            </div>
            <div style={s.waitlistBody}>
              {waitlist.map((entry, idx) => (
                <div key={entry._id} style={s.waitlistEntry} className="waitlist-row">
                  <div style={s.waitlistPos}>#{idx + 1}</div>
                  <div style={s.waitlistAvatar}>
                    {entry.attendeeName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.waitlistName}>{entry.attendeeName}</div>
                    <div style={s.waitlistEmail}>{entry.attendeeEmail}</div>
                  </div>
                  <div style={s.waitlistMeta}>
                    <span style={s.waitlistDate}>
                      Added {new Date(entry.addedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                    </span>
                    <button
                      className="waitlist-remove-btn"
                      onClick={() => handleRemoveFromWaitlist(entry._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results label */}
        {!loading && (
          <div style={s.resultsBar}>
            <span style={s.resultsCount}>
              {registrations.length} registration{registrations.length !== 1 ? 's' : ''}
            </span>
            {statusFilter && <span style={s.resultsFiltered}>· filtered by "{statusFilter}"</span>}
          </div>
        )}

        {/* Table */}
        {loading
          ? <div className="reg-loading">Loading registrations…</div>
          : <RegistrationTable registrations={registrations} onCancel={handleCancel} />
        }
      </div>
    </div>
  );
};

const s = {
  pageHeader: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'14px', marginBottom:'22px' },
  pageTitle: { fontSize:'1.55rem', fontWeight:800, background:'linear-gradient(135deg, #f1f5f9 0%, #a5b4fc 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:'-0.01em', marginBottom:'4px' },
  pageDesc: { fontSize:'13px', color:'#475569' },

  controlCard: { background:'rgba(255,255,255,0.038)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'20px 22px', marginBottom:'16px', overflow:'hidden' },
  controlRow: { display:'flex', gap:'16px', alignItems:'flex-end', flexWrap:'wrap' },
  selectorGroup: { display:'flex', flexDirection:'column', gap:'6px', flex:'1 1 260px' },
  statusGroup: { display:'flex', flexDirection:'column', gap:'6px', flex:'0 0 130px' },
  selectorLabel: { fontSize:'11px', fontWeight:700, color:'#64748b', letterSpacing:'0.07em', textTransform:'uppercase' },

  workshopStrip: { display:'flex', alignItems:'center', flexWrap:'wrap', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.06)' },
  stripItem: { display:'flex', flexDirection:'column', gap:'2px', padding:'0 18px' },
  stripDivider: { width:'1px', height:'30px', background:'rgba(255,255,255,0.07)', flexShrink:0 },
  stripLabel: { fontSize:'10.5px', fontWeight:700, color:'#475569', letterSpacing:'0.06em', textTransform:'uppercase' },
  stripValue: { fontSize:'13.5px', fontWeight:600, color:'var(--text-primary)' },

  miniStats: { display:'inline-flex', alignItems:'center', background:'rgba(255,255,255,0.035)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'10px 4px', marginBottom:'16px' },
  miniStat: { display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', padding:'0 16px' },
  miniVal: { fontSize:'20px', fontWeight:800, lineHeight:1 },
  miniLabel: { fontSize:'10.5px', color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' },
  miniDivider: { width:'1px', height:'30px', background:'rgba(255,255,255,0.07)', flexShrink:0 },

  errorBox: { padding:'11px 14px', background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', color:'#f87171', fontSize:'13px', fontWeight:500, marginBottom:'14px' },

  waitlistPanel: {
    background:'rgba(245,158,11,0.05)',
    backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
    border:'1px solid rgba(245,158,11,0.20)',
    borderRadius:'16px', marginBottom:'20px', overflow:'hidden',
  },
  waitlistHeader: { padding:'16px 20px', borderBottom:'1px solid rgba(245,158,11,0.12)' },
  waitlistTitle: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' },
  waitlistIcon: { fontSize:'1.1rem' },
  waitlistCount: { fontSize:'12px', fontWeight:700, background:'rgba(245,158,11,0.15)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.25)', padding:'2px 9px', borderRadius:'999px' },
  waitlistNote: { fontSize:'12px', color:'#92400e' },
  waitlistBody: { padding:'8px 8px' },
  waitlistEntry: { display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', borderRadius:'10px', marginBottom:'4px', transition:'background .15s' },
  waitlistPos: { fontSize:'12px', fontWeight:800, color:'#92400e', width:'24px', textAlign:'center', flexShrink:0 },
  waitlistAvatar: { width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg, #d97706, #f59e0b)', color:'#fff', fontSize:'13px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  waitlistName: { fontSize:'13.5px', fontWeight:600, color:'var(--text-primary)' },
  waitlistEmail: { fontSize:'12px', color:'#475569' },
  waitlistMeta: { display:'flex', alignItems:'center', gap:'10px', flexShrink:0 },
  waitlistDate: { fontSize:'11.5px', color:'#64748b' },

  resultsBar: { display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' },
  resultsCount: { fontSize:'13px', fontWeight:700, color:'#64748b' },
  resultsFiltered: { fontSize:'13px', color:'#475569', fontStyle:'italic' },
};

export default RegistrationsPage;