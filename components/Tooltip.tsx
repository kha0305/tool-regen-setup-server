

import React, { ReactNode, cloneElement, Children, isValidElement } from 'react';

const Tooltip: React.FC<{ text: string; children?: ReactNode }> = ({ text, children }) => {
  // If children are provided, it's a wrapper tooltip.
  if (children) {
    // We need to clone the child to add the 'group' class for the hover effect to work.
    const child = Children.only(children);
    // Fix: Add a type argument to isValidElement to inform TypeScript about the expected props.
    // This resolves type errors for both `child.props.className` and `cloneElement`,
    // and allows us to safely handle an optional className.
    if (!isValidElement<{ className?: string }>(child)) {
      return <>{children}</>;
    }
    
    // This is a more robust way to create a tooltip without adding extra divs
    // that could interfere with layout (e.g., flexbox or grid contexts).
    return (
      <div className="relative inline-block w-full">
        {cloneElement(child, { className: `${child.props.className || ''} group` })}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[250px] p-2 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
          {text}
        </div>
      </div>
    );
  }

  // Otherwise, it's the default '?' icon tooltip.
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