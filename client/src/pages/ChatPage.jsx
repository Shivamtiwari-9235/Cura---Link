import React, { useState, useRef, useEffect } from 'react';
import SearchForm from '../components/SearchForm';
import MessageBubble from '../components/MessageBubble';
import SourceCard from '../components/SourceCard';
import { sendQuery, sendFollowUp } from '../api/chatApi';

const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    background: '#0f1117',
    overflow: 'hidden'
  },
  sidebar: {
    width: '240px',
    background: '#161b27',
    borderRight: '1px solid #2a2f45',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    gap: '8px',
    flexShrink: 0
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  sourcesPanel: {
    width: '260px',
    background: '#0d1120',
    borderLeft: '1px solid #2a2f45',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    gap: '10px',
    overflowY: 'auto',
    flexShrink: 0
  },
  navbar: {
    height: '56px',
    background: '#0f1117',
    borderBottom: '1px solid #2a2f45',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    flexShrink: 0
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  cura: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'white'
  },
  link: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#7c6ef7'
  },
  subtitle: {
    fontSize: '11px',
    color: '#4a5180'
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#4dc87a'
  },
  statusText: {
    fontSize: '13px',
    color: '#8890b5'
  },
  newResearchBtn: {
    background: 'linear-gradient(135deg, #6d5cf6, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    marginBottom: '16px'
  },
  recentLabel: {
    fontSize: '10px',
    color: '#4a5180',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    padding: '4px'
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#4a5180',
    fontSize: '16px',
    textAlign: 'center'
  },
  loader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#1a1f35',
    border: '1px solid #2a2f45',
    borderRadius: '12px',
    margin: '8px 0'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #2a2f45',
    borderTop: '2px solid #7c6ef7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    flexShrink: 0
  },
  loaderText: {
    color: '#8890b5',
    fontSize: '13px'
  },
  followUpBar: {
    padding: '12px 16px',
    borderTop: '1px solid #2a2f45',
    display: 'flex',
    gap: '10px',
    background: '#0f1117'
  },
  followUpInput: {
    flex: 1,
    background: '#1a1f35',
    border: '1px solid #2a2f45',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#c8cce8',
    fontSize: '13px',
    outline: 'none'
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #6d5cf6, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  sourcesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #2a2f45'
  },
  sourcesTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#c8cce8'
  },
  sourcesCount: {
    background: '#1e2540',
    color: '#7c6ef7',
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
    border: '1px solid #2e3560'
  },
  sourcesEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: '#4a5180',
    fontSize: '12px',
    textAlign: 'center',
    gap: '8px'
  },
  errorBox: {
    background: '#3e1c1c',
    color: '#ffb3b3',
    border: '1px solid #722020',
    borderRadius: '10px',
    padding: '12px',
    margin: '0 0 12px 0'
  }
};

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [loaderStep, setLoaderStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);

  const loaderSteps = [
    'Expanding query intelligently...',
    'Searching PubMed database...',
    'Fetching OpenAlex publications...',
    'Retrieving clinical trials...',
    'Ranking and filtering results...',
    'Generating AI response...'
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoaderStep(prev => (prev + 1) % loaderSteps.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleReset = () => {
    setMessages([]);
    setSources([]);
    setChatId(null);
    setFollowUpInput('');
    setIsFormVisible(true);
    setErrorMessage('');
  };

  const handleSearchSubmit = async (formData) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await sendQuery(formData);
      setMessages([
        { role: 'user', text: `Disease: ${formData.disease}\nQuery: ${formData.query}`, time: new Date() },
        { role: 'assistant', text: response.answer || 'No answer returned from the server.', time: new Date() }
      ]);
      setSources(response.sources || []);
      setChatId(response.chatId || null);
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error sending query:', error);
      setErrorMessage(error.message || 'Unable to communicate with the backend.');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Sorry, there was an error processing your request. Please try again.', time: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpInput.trim() || !chatId) return;

    const userMessage = followUpInput.trim();
    setFollowUpInput('');
    setLoading(true);
    setErrorMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, time: new Date() }]);

    try {
      const response = await sendFollowUp({ chatId, query: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', text: response.answer || 'No answer returned from the server.', time: new Date() }]);
    } catch (error) {
      console.error('Error sending follow-up:', error);
      setErrorMessage(error.message || 'Unable to send follow-up question.');
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, there was an error processing your follow-up. Please try again.', time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div>
            <span style={styles.cura}>Cura</span>
            <span style={styles.link}>link</span>
          </div>
          <div style={styles.subtitle}>Medical AI</div>
        </div>
        <button style={styles.newResearchBtn} onClick={handleReset}>+ New Research</button>
        <div style={styles.recentLabel}>RECENT</div>
      </div>

      <div style={styles.mainArea}>
        <div style={styles.navbar}>
          <div style={styles.logo}>
            <div>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '20px' }}>Cura</span>
              <span style={{ color: '#7c6ef7', fontWeight: '700', fontSize: '20px' }}>link</span>
            </div>
            <div style={{ color: '#4a5180', fontSize: '11px' }}>AI Medical Research Assistant</div>
          </div>
          <div style={styles.status}>
            <div style={styles.dot}></div>
            <span style={styles.statusText}>Mistral · Local</span>
          </div>
        </div>

        <div style={styles.messagesArea}>
          {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}
          {messages.length === 0 && !loading && (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
              <div>Start your medical research</div>
            </div>
          )}
          {messages.map((message, index) => (
            <MessageBubble key={index} role={message.role} text={message.text} time={message.time} />
          ))}
          {loading && (
            <div style={styles.loader}>
              <div style={styles.spinner}></div>
              <div style={styles.loaderText}>{loaderSteps[loaderStep]}</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <SearchForm onSubmit={handleSearchSubmit} loading={loading} isVisible={isFormVisible} onToggle={setIsFormVisible} />

        {chatId && (
          <div style={styles.followUpBar}>
            <input
              type="text"
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              style={styles.followUpInput}
              onKeyDown={(e) => e.key === 'Enter' && handleFollowUpSubmit(e)}
              disabled={loading}
            />
            <button onClick={handleFollowUpSubmit} style={styles.sendBtn} disabled={loading || !followUpInput.trim()}>
              Send
            </button>
          </div>
        )}
      </div>

      <div style={styles.sourcesPanel}>
        <div style={styles.sourcesHeader}>
          <div style={styles.sourcesTitle}>Sources</div>
          <div style={styles.sourcesCount}>({sources.length})</div>
        </div>
        {sources.length === 0 ? (
          <div style={styles.sourcesEmpty}>
            <div style={{ fontSize: '24px' }}>📚</div>
            <div>Sources will appear after your search</div>
          </div>
        ) : (
          sources.map((source, index) => (
            <SourceCard key={index} source={source} />
          ))
        )}
      </div>
    </div>
  );
}

export default ChatPage;
