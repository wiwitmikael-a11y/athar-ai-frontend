import React from 'react';
import type { Tab } from '../App';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const commonButtonClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  const activeButtonClasses = 'bg-blue-600 text-white shadow';
  const inactiveButtonClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <header className="p-4 flex items-center justify-between border-b bg-white flex-wrap gap-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">
        AtharAI
        <span className="text-blue-600 font-light"> – Open-source Assistant</span>
      </h1>
      <div className="flex gap-2">
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
