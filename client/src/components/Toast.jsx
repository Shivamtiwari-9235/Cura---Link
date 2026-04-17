import React from 'react';

const toastStyles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

function Toast({ message, type = 'info', onClose }) {
  return (
    <div className={`toast ${type}`} style={toastStyles.container}>
      <span>{message}</span>
      <button onClick={onClose} style={toastStyles.closeButton} aria-label="Close notification">
        ✕
      </button>
    </div>
  );
}

export default Toast;
