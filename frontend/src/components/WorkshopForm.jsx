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
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>{initialData ? 'Edit Workshop' : 'Add Workshop'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        name="code"
        placeholder="Workshop Code (e.g. WS-005)"
        value={form.code}
        onChange={handleChange}
        disabled={!!initialData}
        required
        style={styles.input}
      />
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        name="instructor"
        placeholder="Instructor"
        value={form.instructor}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        type="datetime-local"
        name="dateTime"
        value={form.dateTime}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        type="number"
        name="capacity"
        placeholder="Capacity"
        value={form.capacity}
        onChange={handleChange}
        min="1"
        required
        style={styles.input}
      />
      <textarea
        name="description"
        placeholder="Description (optional)"
        value={form.description}
        onChange={handleChange}
        style={styles.input}
      />

      {initialData && (
        <select name="status" value={form.status} onChange={handleChange} style={styles.input}>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" style={styles.submitBtn}>
          {initialData ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    maxWidth: '400px',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  submitBtn: {
    padding: '8px 16px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 16px',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default WorkshopForm;