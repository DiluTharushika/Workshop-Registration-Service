import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import WorkshopTable from '../components/WorkshopTable';
import WorkshopForm from '../components/WorkshopForm';

const DashboardPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [filters, setFilters] = useState({ status: '', fromDate: '', toDate: '', availableOnly: false });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.availableOnly) params.availableOnly = 'true';

      const { data } = await api.get('/workshops', { params });
      setWorkshops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchWorkshops();
  };

  const handleAddClick = () => {
    setEditingWorkshop(null);
    setShowForm(true);
  };

  const handleEditClick = (workshop) => {
    setEditingWorkshop(workshop);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    const payload = { ...formData, capacity: Number(formData.capacity) };
    if (editingWorkshop) {
      await api.put(`/workshops/${editingWorkshop._id}`, payload);
    } else {
      await api.post('/workshops', payload);
    }
    setShowForm(false);
    setEditingWorkshop(null);
    fetchWorkshops();
  };

  const handleViewRegistrations = (workshop) => {
    navigate(`/registrations?workshopId=${workshop._id}`);
  };

  // Stats
  const totalWorkshops = workshops.length;
  const activeWorkshops = workshops.filter(w => w.status === 'active').length;
  const totalSeats = workshops.reduce((a, w) => a + (w.capacity || 0), 0);
  const bookedSeats = workshops.reduce((a, w) => a + (w.bookedSeats || 0), 0);

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">
        {/* Page header */}
        <div style={styles.pageHeader}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Workshop Catalogue</h2>
            <p style={styles.pageDesc}>Manage and track all workshops in one place</p>
          </div>
          {user.role === 'manager' && (
            <button
              onClick={showForm ? () => setShowForm(false) : handleAddClick}
              className="btn btn-success"
            >
              {showForm ? '✕ Close Form' : '+ Add Workshop'}
            </button>
          )}
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Workshops', value: totalWorkshops, icon: '🎓', color: '#6366f1' },
            { label: 'Active',          value: activeWorkshops, icon: '✅', color: '#10b981' },
            { label: 'Total Capacity',  value: totalSeats,      icon: '🪑', color: '#06b6d4' },
            { label: 'Seats Booked',   value: bookedSeats,     icon: '👥', color: '#f59e0b' },
          ].map((stat) => (
            <div key={stat.label} style={{ ...styles.statCard, borderTopColor: stat.color }}>
              <div style={{ ...styles.statIcon, background: `${stat.color}22`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filterCard}>
          <p style={styles.filterTitle}>🔍 Filter Workshops</p>
          <form onSubmit={handleFilterSubmit} style={styles.filterForm}>
            <div style={styles.filterField}>
              <label className="form-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="select-field"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div style={styles.filterField}>
              <label className="form-label">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={styles.filterField}>
              <label className="form-label">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={styles.filterField}>
              <label className="form-label">&nbsp;</label>
              <label className="checkbox-label" style={{ paddingTop: '6px' }}>
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                />
                Seats available only
              </label>
            </div>

            <div style={styles.filterField}>
              <label className="form-label">&nbsp;</label>
              <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Workshop form */}
        {showForm && (
          <div className="animate-in">
            <WorkshopForm
              initialData={editingWorkshop}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="loading-pulse">Loading workshops…</div>
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
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '22px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 20px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderTop: '3px solid',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
  },
  statIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    flexShrink: 0,
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: '3px',
  },
  statLabel: {
    fontSize: '11.5px',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  filterCard: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '18px 22px',
    marginBottom: '20px',
  },
  filterTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#94a3b8',
    marginBottom: '14px',
    letterSpacing: '0.02em',
  },
  filterForm: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    minWidth: '160px',
    flex: '1 1 160px',
  },
};

export default DashboardPage;