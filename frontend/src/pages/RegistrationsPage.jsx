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

  useEffect(() => {
    fetchWorkshops();
  }, []);

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

  return (
    <div>
      <Navbar />
      <div style={{ padding: '24px' }}>
        <h2>Registrations</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ marginRight: '10px' }}>Workshop:</label>
          <select
            value={selectedWorkshopId}
            onChange={(e) => setSelectedWorkshopId(e.target.value)}
            style={styles.select}
          >
            <option value="">-- All Workshops --</option>
            {workshops.map((w) => (
              <option key={w._id} value={w._id}>
                {w.title} ({w.bookedSeats}/{w.capacity})
              </option>
            ))}
          </select>

          {selectedWorkshop && (
            <button
              onClick={() => setShowRegisterForm(true)}
              style={styles.addBtn}
              disabled={selectedWorkshop.bookedSeats >= selectedWorkshop.capacity}
            >
              {selectedWorkshop.bookedSeats >= selectedWorkshop.capacity
                ? 'Workshop Full'
                : '+ Register Attendee'}
            </button>
          )}
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {showRegisterForm && selectedWorkshop && (
          <RegisterAttendeeForm
            workshop={selectedWorkshop}
            onSuccess={handleRegisterSuccess}
            onCancel={() => setShowRegisterForm(false)}
          />
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <RegistrationTable registrations={registrations} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
};

const styles = {
  select: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px' },
  addBtn: {
    padding: '8px 16px',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default RegistrationsPage;