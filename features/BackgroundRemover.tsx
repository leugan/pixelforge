import React, { useState, useCallback, useRef } from 'react';
import { DropZone } from '../components/DropZone';
import { ComparisonViewer } from '../components/ComparisonViewer';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { generateMaskWithGemini } from '../services/gemini';
import { getGeminiAspectRatio, compositeImageWithMask, loadImage, performMagicWand } from '../utils/imageProcessing';
import { ProcessedImage, ProcessingState } from '../types';
import { Language, translations } from '../utils/i18n';

interface BackgroundRemoverProps {
  lang: Language;
}

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ lang }) => {
  const [imageState, setImageState] = useState<ProcessedImage | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isLoading: false,
    error: null,
  });
  const t = translations[lang];

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelected = useCallback(async (file: File) => {
    setProcessing({ isLoading: true, error: null });
    
    try {
      const base64Full = await fileToBase64(file);
      const imageObj = await loadImage(base64Full);
      
      setImageState({
        originalUrl: base64Full,
        processedUrl: null,
        fileName: file.name
      });

      const aspectRatio = getGeminiAspectRatio(imageObj.naturalWidth, imageObj.naturalHeight);
      const base64Data = base64Full.split(',')[1];
      const mimeType = file.type || 'image/png';

      const maskBase64 = await generateMaskWithGemini(base64Data, mimeType, aspectRatio);
      const transparentImageUrl = await compositeImageWithMask(base64Full, maskBase64);
      
      setImageState(prev => prev ? { ...prev, processedUrl: transparentImageUrl } : null);
      
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || t.errorGeneric;
      
      // Check for 429/Quota error messages to show a more helpful text
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
        errorMessage = t.errorQuota || errorMessage;
      }
      
      setProcessing({ 
        isLoading: false, 
        error: errorMessage
      });
    } finally {
      setProcessing(prev => ({ ...prev, isLoading: false }));
    }
  }, [t.errorGeneric, t.errorQuota]);

  const handleMagicWand = useCallback(async (x: number, y: number, tolerance: number) => {
    if (!imageState) return;
    try {
      const newUrl = await performMagicWand(imageState.originalUrl, x, y, tolerance);
      setImageState(prev => prev ? { ...prev, processedUrl: newUrl } : null);
    } catch (err: any) {
      console.error("Magic Wand error:", err);
    }
  }, [imageState]);

  const handleReset = () => {
    setImageState(null);
    setProcessing({ isLoading: false, error: null });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.rbTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.rbDesc}</p>
      </div>

      {processing.error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center justify-between">
          <span className="flex-1 mr-2">{processing.error}</span>
          <button onClick={() => setProcessing(p => ({...p, error: null}))}>&times;</button>
        </div>
      )}

      {!imageState ? (
        <div className="animate-in fade-in zoom-in duration-300">
          {processing.isLoading && <ProcessingOverlay />}
          <DropZone onImageSelected={handleImageSelected} disabled={processing.isLoading} lang={lang} />
        </div>
      ) : (
        <div className="relative">
          {processing.isLoading && !imageState.processedUrl && <ProcessingOverlay />}
          <ComparisonViewer 
            data={imageState} 
            onReset={handleReset} 
            onMagicWand={handleMagicWand}
          />
        </div>
      )}
    </div>
  );
};