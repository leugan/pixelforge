import React from 'react';
import { Layers, Scaling, Palette, Languages } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface SidebarProps {
  activeTab: 'remove-bg' | 'resize' | 'colors';
  onTabChange: (tab: 'remove-bg' | 'resize' | 'colors') => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, lang, onLangChange }) => {
  const t = translations[lang];

  const navItems = [
    { id: 'remove-bg', label: t.navRemoveBg, icon: Layers },
    { id: 'resize', label: t.navResize, icon: Scaling },
    { id: 'colors', label: t.navColors, icon: Palette },
  ] as const;

  return (
    <div className="w-full md:w-64 flex-shrink-0 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 md:h-screen sticky top-0 z-40">
      
      {/* Brand */}
      <div className="p-6 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-700/50">
        <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
           <Layers className="text-white h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
          {lang === 'zh' ? (
             <>幻影<span className="text-indigo-600 dark:text-indigo-400">画布</span></>
          ) : (
             <>Pixel<span className="text-indigo-600 dark:text-indigo-400">Forge</span></>
          )}
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                ${isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Language Toggle */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700/50">
        <button
          onClick={() => onLangChange(lang === 'en' ? 'zh' : 'en')}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          <div className="flex items-center space-x-2">
            <Languages size={18} />
            <span>{lang === 'en' ? 'English' : '中文'}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
            {lang.toUpperCase()}
          </span>
        </button>
      </div>
    </div>
  );
};