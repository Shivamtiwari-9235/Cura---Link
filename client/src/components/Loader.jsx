import React, { useState, useEffect } from 'react';

function Loader({ messages }) {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-5 h-5 border-2 border-borderColor border-t-primary rounded-full animate-spin mr-3"></div>
      <p className="text-textMuted text-sm">{messages[currentMessage]}</p>
    </div>
  );
}

export default Loader;