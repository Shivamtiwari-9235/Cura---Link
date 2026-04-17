import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageBubble from '../components/MessageBubble';
import { getHistory } from '../api/chatApi';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1117',
    color: '#c8cce8',
    padding: '24px'
  },
  container: {
    maxWidth: '980px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700'
  },
  button: {
    background: '#1a1f35',
    border: '1px solid #2a2f45',
    borderRadius: '10px',
    color: '#c8cce8',
    padding: '10px 16px',
    cursor: 'pointer'
  },
  status: {
    textAlign: 'center',
    color: '#8890b5',
    padding: '24px 0'
  }
};

function HistoryPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory(id);
        setMessages(response.messages || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHistory();
  }, [id]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Chat History</h1>
          <button onClick={() => navigate('/')} style={styles.button}>
            Back to Chat
          </button>
        </div>
        {loading ? (
          <div style={styles.status}>Loading history...</div>
        ) : messages.length === 0 ? (
          <div style={styles.status}>No messages found</div>
        ) : (
          <div style={{ display: 'grid', gap: '18px' }}>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                role={message.role}
                text={message.text}
                time={message.time}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;