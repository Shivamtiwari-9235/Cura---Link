import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const ChatPage = lazy(() => import('./pages/ChatPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

function App() {
  return (
    <div style={{ background: '#0f1117', minHeight: '100vh' }}>
      <Router>
        <Suspense fallback={<div style={{ color: '#c8cce8', padding: '24px' }}>Loading application...</div>}>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/history/:id" element={<HistoryPage />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;