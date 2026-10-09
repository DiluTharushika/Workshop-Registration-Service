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
    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
    };

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

  return (
    <div>
      <Navbar />
      <div style={{ padding: '24px' }}>
        <h2>Workshop Catalogue</h2>

        {/* Filters */}
        <form onSubmit={handleFilterSubmit} style={styles.filterBar}>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={styles.input}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
            style={styles.input}
          />
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            style={styles.input}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
            />
            Seats available only
          </label>

          <button type="submit" style={styles.filterBtn}>Apply Filters</button>
        </form>

        {user.role === 'manager' && (
          <button onClick={handleAddClick} style={styles.addBtn}>
            + Add Workshop
          </button>
        )}

        {showForm && (
          <WorkshopForm
            initialData={editingWorkshop}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading ? (
          <p>Loading...</p>
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
  filterBar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  input: { padding: '6px', borderRadius: '4px', border: '1px solid #ccc' },
  filterBtn: {
    padding: '6px 14px',
    background: '#4b5563',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  addBtn: {
    padding: '8px 16px',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
};

export default DashboardPage;