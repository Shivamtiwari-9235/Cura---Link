import React from 'react';

function Sidebar({ chatHistory, onSelectChat, activeChatId }) {
  return (
    <div className="w-60 bg-bgSidebar border-r border-borderColor flex flex-col h-full">
      <div className="p-4">
        <button className="w-full h-10 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90">
          + New Research
        </button>
      </div>
      <div className="px-4 mb-2">
        <span className="text-xs text-textHint uppercase tracking-wider">RECENT</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-2 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${
              activeChatId === chat.id
                ? 'bg-[#1e2540] border-l-2 border-primary text-secondary'
                : 'hover:bg-[#1e2540] text-textPrimary'
            }`}
          >
            <div className="font-medium text-sm">{chat.disease}</div>
            <div className="text-xs text-textMuted">{new Date(chat.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-borderColor">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
            R
          </div>
          <span className="text-textMuted text-sm">Research Mode</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;