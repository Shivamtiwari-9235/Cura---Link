import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageBubble from '../components/MessageBubble';
import { getHistory } from '../api/chatApi';

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
    <div className="min-h-screen bg-bgMain p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-textPrimary text-2xl font-semibold">Chat History</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-bgCard border border-borderColor text-textPrimary rounded-lg hover:bg-[#1e2540] transition-all duration-200"
          >
            Back to Chat
          </button>
        </div>
        {loading ? (
          <div className="text-center text-textMuted">Loading history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-textHint">No messages found</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                role={message.role}
                text={message.text}
                time={message.timestamp}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;