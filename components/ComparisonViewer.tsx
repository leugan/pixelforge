import React, { useState, useRef } from 'react';
import { Download, RefreshCw, Wand2, Sparkles, AlertCircle } from 'lucide-react';
import { ProcessedImage } from '../types';

// We could pass translation strings as props or assume the parent handles text.
// To keep it simple and reusable without heavy drilling, I'll stick to icons + English defaults 
// OR pass specific labels. Given the setup, I will adapt this to accept children or just keep simple English 
// for buttons inside shared components, BUT for strict requirements I should localize.
// However, since `ComparisonViewer` is only used in RemoveBg feature now, I'll leave it as is 
// or update it if I want strict localization inside. 
// Let's make it accept text labels for maximum flexibility in the parent.

interface ComparisonViewerProps {
  data: ProcessedImage;
  onReset: () => void;
  onMagicWand: (x: number, y: number, tolerance: number) => void;
  // Optional labels for i18n
  labels?: {
    startOver?: string;
    download?: string;
    auto?: string;
    wand?: string;
    original?: string;
    processed?: string;
    ready?: string;
    loading?: string;
    tolerance?: string;
    clickTip?: string;
  };
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({ data, onReset, onMagicWand, labels }) => {
  const [mode, setMode] = useState<'auto' | 'wand'>('auto');
  const [tolerance, setTolerance] = useState<number>(30);
  const imgRef = useRef<HTMLImageElement>(null);

  // Defaults
  const txt = {
    startOver: "Start Over",
    download: "Download",
    auto: "AI Auto",
    wand: "Magic Wand",
    original: "Original",
    processed: "Background Removed",
    ready: "Ready",
    loading: "Loading...",
    tolerance: "Tolerance:",
    clickTip: "Click a color on the \"Original\" image to remove it",
    ...labels
  };

  const handleDownload = () => {
    if (!data.processedUrl) return;
    const link = document.createElement('a');
    link.href = data.processedUrl;
    link.download = `clearcut-${data.fileName.split('.')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOriginalClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (mode !== 'wand' || !imgRef.current) return;
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const rectRatio = rect.width / rect.height;

    let drawWidth = rect.width;
    let drawHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > rectRatio) {
      drawHeight = rect.width / imgRatio;
      offsetY = (rect.height - drawHeight) / 2;
    } else {
      drawWidth = rect.height * imgRatio;
      offsetX = (rect.width - drawWidth) / 2;
    }

    if (x < offsetX || x > offsetX + drawWidth || y < offsetY || y > offsetY + drawHeight) return;

    const naturalX = Math.round(((x - offsetX) / drawWidth) * img.naturalWidth);
    const naturalY = Math.round(((y - offsetY) / drawHeight) * img.naturalHeight);
    const finalX = Math.min(Math.max(naturalX, 0), img.naturalWidth - 1);
    const finalY = Math.min(Math.max(naturalY, 0), img.naturalHeight - 1);

    onMagicWand(finalX, finalY, tolerance);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
              <button
                onClick={() => setMode('auto')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'auto' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles size={16} />
                <span>{txt.auto}</span>
              </button>
              <button
                onClick={() => setMode('wand')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'wand' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Wand2 size={16} />
                <span>{txt.wand}</span>
              </button>
           </div>

           <div className="flex items-center gap-3">
              <button
                onClick={onReset}
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <RefreshCw size={18} />
                <span>{txt.startOver}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!data.processedUrl}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Download size={18} />
                <span>{txt.download}</span>
              </button>
           </div>
        </div>

        {mode === 'wand' && (
          <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{txt.tolerance}</span>
            <input 
              type="range" min="0" max="100" value={tolerance} 
              onChange={(e) => setTolerance(parseInt(e.target.value))}
              className="w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
            />
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400 w-8">{tolerance}</span>
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 ml-auto bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full">
              <AlertCircle size={14} />
              <span>{txt.clickTip}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{txt.original}</span>
                <span className="text-xs text-slate-400">{data.fileName}</span>
            </div>
            <div className={`
                relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-inner group
                ${mode === 'wand' ? 'cursor-crosshair ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
            `}>
                <img 
                    ref={imgRef}
                    src={data.originalUrl} 
                    alt="Original" 
                    className="w-full h-full object-contain p-2 select-none"
                    onClick={handleOriginalClick}
                    draggable={false}
                />
            </div>
        </div>

        <div className="flex flex-col space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">{txt.processed}</span>
                <div className="flex items-center space-x-1 text-xs text-green-500">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span>{txt.ready}</span>
                </div>
            </div>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-indigo-500/30 dark:border-indigo-400/30 shadow-lg shadow-indigo-500/10 bg-checkerboard group">
                {data.processedUrl ? (
                    <img src={data.processedUrl} alt="Processed" className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="animate-pulse">{txt.loading}</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
