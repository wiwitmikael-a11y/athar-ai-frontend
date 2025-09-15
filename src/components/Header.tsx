import React from 'react';
import type { Tab } from '../App';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const commonButtonClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white';
  const activeButtonClasses = 'bg-white/90 text-gray-900 shadow-lg';
  const inactiveButtonClasses = 'bg-white/10 text-white hover:bg-white/20';

  return (
    <header className="sticky top-0 z-20 mt-4 mb-2 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-lg">
      <h1 className="text-xl font-bold text-white md:text-2xl">
        AtharAI
        <span className="font-light opacity-70"> – Assistant</span>
      </h1>
      <div className="flex gap-2 rounded-lg bg-black/20 p-1">
        <button
          className={`${commonButtonClasses} ${activeTab === 'chat' ? activeButtonClasses : inactiveButtonClasses}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`${commonButtonClasses} ${activeTab === 'image' ? activeButtonClasses : inactiveButtonClasses}`}
          onClick={() => setActiveTab('image')}
        >
          Image
        </button>
      </div>
    </header>
  );
};

export default Header;
