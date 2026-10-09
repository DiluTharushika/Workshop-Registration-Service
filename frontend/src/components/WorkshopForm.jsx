import { useState, useEffect } from 'react';

const emptyForm = {
  code: '',
  title: '',
  instructor: '',
  dateTime: '',
  capacity: '',
  description: '',
};

const WorkshopForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code || '',
        title: initialData.title || '',
        instructor: initialData.instructor || '',
        dateTime: initialData.dateTime
          ? new Date(initialData.dateTime).toISOString().slice(0, 16)
          : '',
        capacity: initialData.capacity || '',
        description: initialData.description || '',
        status: initialData.status || 'active',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'code',       label: 'Workshop Code',  placeholder: 'e.g. WS-005', type: 'text',          disabled: !!initialData },
    { name: 'title',      label: 'Title',           placeholder: 'Workshop title',  type: 'text' },
    { name: 'instructor', label: 'Instructor',      placeholder: 'Instructor name', type: 'text' },
    { name: 'dateTime',   label: 'Date & Time',     placeholder: '',               type: 'datetime-local' },
    { name: 'capacity',   label: 'Capacity',        placeholder: 'Max attendees',  type: 'number', min: 1 },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h3 style={styles.heading}>
          {initialData ? '✏️ Edit Workshop' : '➕ Add New Workshop'}
        </h3>
        <p style={styles.subheading}>
          {initialData
            ? 'Update the workshop details below'
            : 'Fill in the details to create a new workshop'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            ⚠ {error}
          </div>
        )}

        <div style={styles.grid}>
          {fields.map((f) => (
            <div className="form-group" key={f.name}>
              <label className="form-label">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                disabled={f.disabled}
                required={f.name !== 'description'}
                min={f.min}
                className="input-field"
              />
            </div>
          ))}
        </div>

        {/* Description — full width */}
        <div className="form-group" style={{ marginTop: '14px' }}>
          <label className="form-label">Description (optional)</label>
          <textarea
            name="description"
            placeholder="Brief description of what attendees will learn…"
            value={form.description}
            onChange={handleChange}
            className="textarea-field"
          />
        </div>

        {/* Status (edit mode only) */}
        {initialData && (
          <div className="form-group" style={{ marginTop: '14px', maxWidth: '200px' }}>
            <label className="form-label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="select-field">
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        <div style={styles.actions}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? (initialData ? 'Updating…' : 'Creating…')
              : (initialData ? '✓ Update Workshop' : '✓ Create Workshop')}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    background: 'rgba(15, 12, 41, 0.72)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '16px',
    padding: '24px 28px',
    marginBottom: '24px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  },
  header: {
    marginBottom: '20px',
  },
  heading: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  subheading: {
    fontSize: '13px',
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '18px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
};

export default WorkshopForm;