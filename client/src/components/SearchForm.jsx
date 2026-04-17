import React, { useState } from 'react';

const styles = {
  container: {
    background: '#1a1f35',
    border: '1px solid #2a2f45',
    borderRadius: '12px',
    padding: '20px',
    margin: '12px 16px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    color: '#c8cce8',
    fontSize: '14px',
    fontWeight: '600'
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: '#7c6ef7',
    cursor: 'pointer',
    fontSize: '12px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '12px',
    color: '#8890b5',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    background: '#0f1117',
    border: '1px solid #2a2f45',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#c8cce8',
    fontSize: '13px',
    outline: 'none'
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #6d5cf6, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  submitBtnDisabled: {
    background: '#3a3560',
    cursor: 'not-allowed'
  },
  notice: {
    fontSize: '11px',
    color: '#8890b5',
    marginTop: '10px',
    padding: '8px',
    background: '#12180a',
    borderRadius: '6px',
    border: '1px solid #2a3a1a'
  }
};

function SearchForm({ onSubmit, loading, isVisible, onToggle }) {
  const [formData, setFormData] = useState({
    patientName: '',
    disease: '',
    query: '',
    location: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isVisible) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>New Research Query</div>
          <button style={styles.toggleBtn} onClick={() => onToggle(true)}>
            ▶ Show
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>New Research Query</div>
        <button style={styles.toggleBtn} onClick={() => onToggle(false)}>
          ▼ Hide
        </button>
      </div>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="patientName">Patient Name</label>
          <input
            id="patientName"
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter patient name"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="disease">Disease of Interest *</label>
          <input
            id="disease"
            type="text"
            name="disease"
            value={formData.disease}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter disease"
            required
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="query">Additional Query *</label>
          <input
            id="query"
            type="text"
            name="query"
            value={formData.query}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter additional query"
            required
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter location"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitBtn,
            ...(loading ? styles.submitBtnDisabled : {})
          }}
        >
          Search Research
        </button>
        <div style={styles.notice}>
          ⚠ This tool provides research information only, not medical diagnosis.
        </div>
      </form>
    </div>
  );
}

export default SearchForm;