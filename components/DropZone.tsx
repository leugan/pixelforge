import React, { useCallback, useEffect, useState } from 'react';
import { Upload, Image as ImageIcon, ClipboardPaste } from 'lucide-react';
import { translations, Language } from '../utils/i18n';

interface DropZoneProps {
  onImageSelected: (file: File) => void;
  disabled: boolean;
  lang: Language;
}

export const DropZone: React.FC<DropZoneProps> = ({ onImageSelected, disabled, lang }) => {
  const [isDragging, setIsDragging] = useState(false);
  const t = translations[lang];

  // Handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  // Handle Drag Over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  // Handle Drag Leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Handle Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  }, [disabled, onImageSelected]);

  // Handle Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            onImageSelected(blob);
          }
          break; // Stop after finding the first image
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, onImageSelected]);

  return (
    <div
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-2xl
        transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center
        h-64 sm:h-80 w-full overflow-hidden
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-750'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center space-y-4 text-center p-6 z-10">
        <div className={`
          p-4 rounded-full 
          ${isDragging ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
          transition-colors duration-300
        `}>
          {isDragging ? <Upload size={40} /> : <ImageIcon size={40} />}
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            {t.dropTitle}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.dropSub}
          </p>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
          <ClipboardPaste size={14} />
          <span>{t.dropPaste}</span>
        </div>
      </div>
    </div>
  );
};
