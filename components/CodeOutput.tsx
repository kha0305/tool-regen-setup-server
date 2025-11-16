import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CodeOutputProps {
  title: string;
  code: string;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ title, code }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

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
    <div className="bg-black/20 rounded-lg border border-slate-800">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-900/70 rounded-t-lg border-b border-slate-800">
        <h3 className="font-mono text-sm font-bold text-slate-300">{title}</h3>
        <div className="flex items-center gap-2">
            <button
            onClick={handleCopy}
            className="flex items-center text-xs text-slate-400 hover:text-white transition bg-slate-700/50 hover:bg-slate-700 px-2 py-1 rounded-md"
            >
            {copied ? (
                <>
                <Check className="w-3 h-3 mr-1 text-green-400" /> {t('code.copied')}
                </>
            ) : (
                <>
                <Copy className="w-3 h-3 mr-1" /> {t('code.copy')}
                </>
            )}
            </button>
            <button
                onClick={handleDownload}
                className="flex items-center text-xs text-slate-400 hover:text-white transition bg-slate-700/50 hover:bg-slate-700 px-2 py-1 rounded-md"
            >
                <Download className="w-3 h-3 mr-1" /> {t('code.download')}
            </button>
        </div>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-slate-300">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
};

export default CodeOutput;