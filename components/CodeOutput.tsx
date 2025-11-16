import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';

interface CodeOutputProps {
  title: string;
  code: string;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ title, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800 rounded-t-lg border-b border-slate-700">
        <h3 className="font-mono text-sm font-bold text-gray-300">{title}</h3>
        <div className="flex items-center gap-2">
            <button
            onClick={handleCopy}
            className="flex items-center text-xs text-gray-400 hover:text-white transition bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md"
            >
            {copied ? (
                <>
                <Check className="w-3 h-3 mr-1 text-green-400" /> Copied!
                </>
            ) : (
                <>
                <Copy className="w-3 h-3 mr-1" /> Copy
                </>
            )}
            </button>
            <button
                onClick={handleDownload}
                className="flex items-center text-xs text-gray-400 hover:text-white transition bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md"
            >
                <Download className="w-3 h-3 mr-1" /> Download
            </button>
        </div>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-gray-300">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
};

export default CodeOutput;