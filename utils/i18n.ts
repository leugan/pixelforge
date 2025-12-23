export type Language = 'en' | 'zh';

export const translations = {
  en: {
    appTitle: "PixelForge",
    navRemoveBg: "Remove BG",
    navResize: "Resize",
    navColors: "Colors",
    
    // Remove BG
    rbTitle: "Background Remover",
    rbDesc: "Instantly remove image backgrounds using advanced Gemini Vision models.",
    rbAuto: "AI Auto",
    rbWand: "Magic Wand",
    rbReset: "Start Over",
    rbDownload: "Download",
    rbOriginal: "Original",
    rbProcessed: "Background Removed",
    rbReady: "Ready",
    rbLoading: "Loading...",
    rbTolerance: "Tolerance:",
    rbClickTip: "Click a color on the \"Original\" image to remove it",
    
    // Resize
    rzTitle: "Image Resizer",
    rzDesc: "Scale your images up or down while maintaining quality.",
    rzWidth: "Width (px)",
    rzHeight: "Height (px)",
    rzLock: "Lock Aspect Ratio",
    rzPresets: "Presets",
    rzDownload: "Download Resized",
    
    // Colors
    clTitle: "Color Extractor",
    clDesc: "Identify and extract the dominant color palette from your image.",
    clDominant: "Dominant Colors",
    clCopied: "Copied!",
    
    // Common
    dropTitle: "Click or Drop Image Here",
    dropSub: "JPG, PNG or WEBP",
    dropPaste: "Ctrl + V to paste",
    errorGeneric: "Something went wrong",
    processing: "Processing...",
    copyright: "© 2024 PixelForge. Powered by Google Gemini."
  },
  zh: {
    appTitle: "幻影画布",
    navRemoveBg: "去除背景",
    navResize: "调整大小",
    navColors: "颜色提取",
    
    // Remove BG
    rbTitle: "智能抠图",
    rbDesc: "使用先进的 Gemini 视觉模型即时去除图片背景。",
    rbAuto: "AI 自动",
    rbWand: "魔术棒",
    rbReset: "重新开始",
    rbDownload: "下载结果",
    rbOriginal: "原图",
    rbProcessed: "去除背景",
    rbReady: "完成",
    rbLoading: "处理中...",
    rbTolerance: "容差:",
    rbClickTip: "点击“原图”中的颜色以将其去除",
    
    // Resize
    rzTitle: "调整大小",
    rzDesc: "按比例放大或缩小您的图片，保持画质。",
    rzWidth: "宽度 (px)",
    rzHeight: "高度 (px)",
    rzLock: "锁定长宽比",
    rzPresets: "预设比例",
    rzDownload: "下载图片",
    
    // Colors
    clTitle: "颜色提取",
    clDesc: "自动识别并提取图片中的主要配色方案。",
    clDominant: "主要颜色",
    clCopied: "已复制!",
    
    // Common
    dropTitle: "点击或拖拽图片到这里",
    dropSub: "支持 JPG, PNG, WEBP",
    dropPaste: "Ctrl + V 粘贴",
    errorGeneric: "发生错误",
    processing: "处理中...",
    copyright: "© 2024 幻影画布. 由 Google Gemini 驱动."
  }
};

export const getSystemLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.toLowerCase();
  return lang.startsWith('zh') ? 'zh' : 'en';
};