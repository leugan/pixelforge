import React, { useState, useEffect } from 'react';
import { DropZone } from '../components/DropZone';
import { loadImage, resizeImage } from '../utils/imageProcessing';
import { Language, translations } from '../utils/i18n';
import { Download, RefreshCw, Lock, Unlock } from 'lucide-react';

interface ImageResizerProps {
  lang: Language;
}

export const ImageResizer: React.FC<ImageResizerProps> = ({ lang }) => {
  const t = translations[lang];
  const [file, setFile] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<{w: number, h: number} | null>(null);
  const [resizedSrc, setResizedSrc] = useState<string | null>(null);
  
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);

  // Load image
  const handleImageSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const src = reader.result as string;
      setOriginalSrc(src);
      const img = await loadImage(src);
      setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
  };

  // Process resize
  useEffect(() => {
    if (!originalSrc || !width || !height) return;
    const timer = setTimeout(async () => {
      const result = await resizeImage(originalSrc, width, height);
      setResizedSrc(result);
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [width, height, originalSrc]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && originalDims) {
      const ratio = originalDims.h / originalDims.w;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && originalDims) {
      const ratio = originalDims.w / originalDims.h;
      setWidth(Math.round(val * ratio));
    }
  };

  const setScale = (scale: number) => {
    if (!originalDims) return;
    setWidth(Math.round(originalDims.w * scale));
    setHeight(Math.round(originalDims.h * scale));
  };

  const handleDownload = () => {
    if (!resizedSrc || !file) return;
    const link = document.createElement('a');
    link.href = resizedSrc;
    link.download = `resized-${width}x${height}-${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!originalSrc) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8">
         <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.rzTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400">{t.rzDesc}</p>
        </div>
        <DropZone onImageSelected={handleImageSelected} disabled={false} lang={lang} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t.rzTitle}</h2>
        <button 
          onClick={() => { setOriginalSrc(null); setFile(null); }}
          className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors"
        >
          <RefreshCw size={18} />
          <span>{t.rbReset}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Controls Sidebar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6 h-fit">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.rzWidth}</label>
              <button onClick={() => setLockRatio(!lockRatio)} className="text-slate-400 hover:text-indigo-500" title={t.rzLock}>
                {lockRatio ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
            </div>
            <input 
              type="number" 
              value={width} 
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.rzHeight}</label>
            <input 
              type="number" 
              value={height} 
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">{t.rzPresets}</span>
             <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 0.75, 2].map(scale => (
                   <button 
                     key={scale} 
                     onClick={() => setScale(scale)}
                     className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700"
                   >
                     {scale}x
                   </button>
                ))}
             </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-3 rounded-lg shadow-md mt-4 transition-all"
          >
            <Download size={20} />
            <span>{t.rzDownload}</span>
          </button>
        </div>

        {/* Preview */}
        <div className="md:col-span-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-4 overflow-hidden relative min-h-[400px]">
           {resizedSrc && (
             <img 
               src={resizedSrc} 
               alt="Resized Preview" 
               className="max-w-full max-h-[600px] object-contain shadow-lg rounded-lg"
             />
           )}
           <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
             {width} x {height} px
           </div>
        </div>
      </div>
    </div>
  );
};
