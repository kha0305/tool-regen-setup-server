
import React from 'react';
import { BotMessageSquare } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BotMessageSquare className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-white">AI Game Server Builder</h1>
            <p className="text-sm text-slate-400">Instantly generate your custom server files</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
