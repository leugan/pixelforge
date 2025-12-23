import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const ProcessingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
      <div className="flex flex-col items-center space-y-4 p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
          <Loader2 size={48} className="text-indigo-600 dark:text-indigo-400 animate-spin relative z-10" />
          <Sparkles size={20} className="text-amber-400 absolute -top-2 -right-2 animate-bounce z-20" />
        </div>
        <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Processing Image</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gemini is detecting the subject...</p>
        </div>
      </div>
    </div>
  );
};
