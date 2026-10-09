import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import RegisterAttendeeForm from '../components/RegisterAttendeeForm';
import RegistrationTable from '../components/RegistrationTable';

const RegistrationsPage = () => {
  const [searchParams] = useSearchParams();
  const workshopIdFromUrl = searchParams.get('workshopId');

  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(workshopIdFromUrl || '');
  const [registrations, setRegistrations] = useState([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWorkshops = async () => {
    const { data } = await api.get('/workshops');
    setWorkshops(data);
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedWorkshopId) params.workshopId = selectedWorkshopId;
      const { data } = await api.get('/registrations', { params });
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkshops(); }, []);
  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkshopId]);

  const selectedWorkshop = workshops.find((w) => w._id === selectedWorkshopId);

  const handleRegisterSuccess = () => {
    setShowRegisterForm(false);
    setError('');
    fetchRegistrations();
    fetchWorkshops();
  };

  const handleCancel = async (registration) => {
    if (!window.confirm(`Cancel registration for ${registration.attendeeName}?`)) return;
    try {
      await api.patch(`/registrations/${registration._id}/cancel`);
      fetchRegistrations();
      fetchWorkshops();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  // Summary stats
  const activeCount    = registrations.filter(r => r.status === 'active').length;
  const cancelledCount = registrations.filter(r => r.status === 'cancelled').length;

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Registrations</h2>
            <p style={styles.pageDesc}>View and manage attendee registrations</p>
          </div>
        </div>

        {/* Workshop selector + register button */}
        <div style={styles.controlBar}>
          <div style={styles.selectorGroup}>
            <label className="form-label">Filter by Workshop</label>
            <select
              value={selectedWorkshopId}
              onChange={(e) => setSelectedWorkshopId(e.target.value)}
              className="select-field"
              style={{ minWidth: '280px' }}
            >
              <option value="">— All Workshops —</option>
              {workshops.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.title} ({w.bookedSeats}/{w.capacity} seats)
                </option>
              ))}
            </select>
          </div>

          {selectedWorkshop && (
            <button
              onClick={() => setShowRegisterForm(true)}
              className="btn btn-success"
              disabled={selectedWorkshop.bookedSeats >= selectedWorkshop.capacity}
              style={{ alignSelf: 'flex-end' }}
            >
              {selectedWorkshop.bookedSeats >= selectedWorkshop.capacity
                ? '🚫 Workshop Full'
                : '+ Register Attendee'}
            </button>
          )}
        </div>

        {/* Mini stats */}
        {selectedWorkshop && (
          <div style={styles.miniStats}>
            <div style={styles.miniStat}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{activeCount}</span>
              <span style={styles.miniStatLabel}>Active</span>
            </div>
            <div style={styles.miniStatDivider} />
            <div style={styles.miniStat}>
              <span style={{ color: '#f87171', fontWeight: 700 }}>{cancelledCount}</span>
              <span style={styles.miniStatLabel}>Cancelled</span>
            </div>
            <div style={styles.miniStatDivider} />
            <div style={styles.miniStat}>
              <span style={{ color: '#a5b4fc', fontWeight: 700 }}>
                {selectedWorkshop.capacity - selectedWorkshop.bookedSeats}
              </span>
              <span style={styles.miniStatLabel}>Seats left</span>
            </div>
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: '14px' }}>⚠ {error}</div>}

        {/* Register form */}
        {showRegisterForm && selectedWorkshop && (
          <div className="animate-in">
            <RegisterAttendeeForm
              workshop={selectedWorkshop}
              onSuccess={handleRegisterSuccess}
              onCancel={() => setShowRegisterForm(false)}
            />
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="loading-pulse">Loading registrations…</div>
        ) : (
          <RegistrationTable registrations={registrations} onCancel={handleCancel} />
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
  controlBar: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '18px 22px',
    marginBottom: '16px',
  },
  selectorGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: '1 1 260px',
  },
  miniStats: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '10px 20px',
    marginBottom: '16px',
  },
  miniStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 20px',
    fontSize: '18px',
    gap: '2px',
  },
  miniStatLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  miniStatDivider: {
    width: '1px',
    height: '28px',
    background: 'rgba(255,255,255,0.08)',
  },
};

export default RegistrationsPage;