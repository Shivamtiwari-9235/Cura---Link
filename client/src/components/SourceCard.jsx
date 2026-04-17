import React from 'react';

const styles = {
  card: {
    background: '#1a1f35',
    border: '1px solid #2a2f45',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '8px'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  badge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  pubmedBadge: {
    background: '#1a2e40',
    color: '#4db8e8'
  },
  openalexBadge: {
    background: '#2a1a40',
    color: '#a78bfa'
  },
  trialBadge: {
    background: '#1a2e1a',
    color: '#4dc87a'
  },
  yearBadge: {
    background: '#1e2030',
    color: '#8890b5'
  },
  title: {
    fontSize: '12.5px',
    color: '#c8cce8',
    fontWeight: '500',
    lineHeight: '1.5',
    marginBottom: '6px'
  },
  snippet: {
    fontSize: '11px',
    color: '#5a6080',
    lineHeight: '1.5',
    marginBottom: '8px'
  },
  openBtn: {
    fontSize: '11px',
    color: '#7c6ef7',
    background: 'transparent',
    border: '1px solid #2a2f45',
    borderRadius: '5px',
    padding: '4px 10px',
    cursor: 'pointer'
  }
};

function SourceCard({ source }) {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'pubmed':
        return styles.pubmedBadge;
      case 'openalex':
        return styles.openalexBadge;
      case 'trial':
        return styles.trialBadge;
      default:
        return styles.yearBadge;
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ ...styles.badge, ...getBadgeStyle(source.type) }}>
            {source.type === 'pubmed' ? 'PubMed' : source.type === 'openalex' ? 'OpenAlex' : 'Trial'}
          </span>
          <span style={{ ...styles.badge, ...styles.yearBadge }}>{source.year}</span>
        </div>
      </div>
      <h4 style={styles.title}>{source.title}</h4>
      <p style={styles.snippet}>
        {source.abstract ? source.abstract.substring(0, 100) + '...' : 'No abstract available'}
      </p>
      <button
        style={styles.openBtn}
        onClick={() => window.open(source.url, '_blank')}
      >
        Open ↗
      </button>
    </div>
  );
}

export default SourceCard;