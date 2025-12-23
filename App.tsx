import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BackgroundRemover } from './features/BackgroundRemover';
import { ImageResizer } from './features/ImageResizer';
import { ColorExtractor } from './features/ColorExtractor';
import { getSystemLanguage, Language } from './utils/i18n';

type Tab = 'remove-bg' | 'resize' | 'colors';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('remove-bg');
  const [lang, setLang] = useState<Language>('en');

  // Initialize Language
  useEffect(() => {
    setLang(getSystemLanguage());
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        lang={lang}
        onLangChange={setLang}
      />

      <div className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 pb-20">
          {activeTab === 'remove-bg' && <BackgroundRemover lang={lang} />}
          {activeTab === 'resize' && <ImageResizer lang={lang} />}
          {activeTab === 'colors' && <ColorExtractor lang={lang} />}
        </div>
      </div>

    </div>
  );
};

export default App;
