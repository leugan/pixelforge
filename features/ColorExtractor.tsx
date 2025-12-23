import React, { useState } from 'react';
import { DropZone } from '../components/DropZone';
import { extractColors } from '../utils/imageProcessing';
import { Language, translations } from '../utils/i18n';
import { RefreshCw, Copy, Check } from 'lucide-react';

interface ColorExtractorProps {
  lang: Language;
}

export const ColorExtractor: React.FC<ColorExtractorProps> = ({ lang }) => {
  const t = translations[lang];
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<Array<{r:number, g:number, b:number, hex:string}>>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const src = reader.result as string;
      setImgSrc(src);
      const extracted = await extractColors(src, 8);
      setColors(extracted);
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!imgSrc) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.clTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400">{t.clDesc}</p>
        </div>
        <DropZone onImageSelected={handleImageSelected} disabled={false} lang={lang} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t.clTitle}</h2>
        <button 
          onClick={() => { setImgSrc(null); setColors([]); }}
          className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors"
        >
          <RefreshCw size={18} />
          <span>{t.rbReset}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Image Preview */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
           <img src={imgSrc} alt="Preview" className="w-full h-auto object-contain" />
        </div>

        {/* Colors Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t.clDominant}</h3>
          <div className="grid gap-4">
            {colors.map((c, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div 
                  className="w-16 h-16 rounded-lg shadow-inner border border-slate-100 dark:border-slate-600" 
                  style={{backgroundColor: c.hex}}
                ></div>
                
                <div className="flex-1 space-y-2">
                  <button 
                    onClick={() => copyToClipboard(c.hex)}
                    className="flex items-center justify-between w-full text-left px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">{c.hex.toUpperCase()}</span>
                    {copied === c.hex ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400 opacity-0 group-hover:opacity-100" />}
                  </button>
                  
                  <button 
                     onClick={() => copyToClipboard(`rgb(${c.r}, ${c.g}, ${c.b})`)}
                     className="flex items-center justify-between w-full text-left px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">rgb({c.r}, {c.g}, {c.b})</span>
                    {copied === `rgb(${c.r}, ${c.g}, ${c.b})` ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400 opacity-0 group-hover:opacity-100" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
