import React from 'react';

const styles = {
  userBubble: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px'
  },
  userBubbleContent: {
    background: 'linear-gradient(135deg, #5b4de0, #7c6ef7)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '12px 12px 4px 12px',
    maxWidth: '70%',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  assistantBubble: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6d5cf6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0
  },
  assistantBubbleContent: {
    background: '#1a1f35',
    border: '1px solid #2a2f45',
    borderRadius: '4px 12px 12px 12px',
    padding: '14px 16px',
    maxWidth: '85%',
    fontSize: '13.5px',
    lineHeight: '1.7',
    color: '#c8cce8'
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
    marginTop: '12px'
  },
  sectionDivider: {
    height: '1px',
    background: '#2a2f45',
    margin: '10px 0'
  }
};

function MessageBubble({ role, text, time }) {
  const formatText = (text) => {
    const lines = text.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach((line, index) => {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const header = line.slice(3);
        let labelColor = '#8890b5';
        if (header === 'Condition Overview') labelColor = '#a78bfa';
        else if (header === 'Research Insights') labelColor = '#4db8e8';
        else if (header === 'Clinical Trials') labelColor = '#4dc87a';
        else if (header === 'Personalized Notes') labelColor = '#f0a050';
        else if (header === 'Sources') labelColor = '#8890b5';
        currentSection = { header, labelColor, content: [] };
      } else {
        if (!currentSection) {
          currentSection = { header: null, content: [] };
        }
        currentSection.content.push(line);
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.map((section, index) => (
      <div key={index}>
        {section.header && (
          <div style={{ ...styles.sectionLabel, color: section.labelColor }}>
            {section.header}
          </div>
        )}
        <div>
          {section.content.map((line, lineIndex) => (
            <p key={lineIndex} style={{ marginTop: lineIndex > 0 ? '6px' : '0' }}>
              {line}
            </p>
          ))}
        </div>
        {index < sections.length - 1 && <div style={styles.sectionDivider} />}
      </div>
    ));
  };

  if (role === 'user') {
    return (
      <div style={styles.userBubble}>
        <div style={styles.userBubbleContent}>
          {text}
          {time && (
            <div style={{ fontSize: '11px', marginTop: '8px', opacity: '0.8' }}>
              {new Date(time).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.assistantBubble}>
      <div style={styles.avatar}>AI</div>
      <div style={styles.assistantBubbleContent}>
        {formatText(text)}
        {time && (
          <div style={{ fontSize: '11px', marginTop: '8px', color: '#8890b5' }}>
            {new Date(time).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;