import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <div style={{ background: '#0f1117', minHeight: '100vh' }}>
      <Router>
        <Routes>
          <Route path="/" element={<ChatPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;