
import React from 'react';

const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="group relative flex items-center ml-1.5">
      <div className="w-4 h-4 rounded-full border border-slate-500 text-slate-500 flex items-center justify-center text-xs font-bold cursor-help select-none">?</div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[250px] p-2 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
