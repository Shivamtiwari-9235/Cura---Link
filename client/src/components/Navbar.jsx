import React from 'react';

function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-bgMain border-b border-borderColor flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <span className="text-white text-xl font-semibold">Cura</span>
        <span className="text-primary text-xl font-semibold">link</span>
        <span className="text-textHint text-xs ml-2">AI Medical Research</span>
      </div>
      <div className="flex items-center">
        <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
        <span className="text-textMuted text-sm">Mistral · Local</span>
      </div>
    </div>
  );
}

export default Navbar;