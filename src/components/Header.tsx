import React from 'react';
import type { Tab } from '../App';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const commonButtonClasses = 'relative px-6 py-3 rounded-2xl font-medium transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-aurora-purple/50 focus:scale-105 transform';
  const inactiveButtonClasses = 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white hover:shadow-inner-glow hover:scale-105 border border-white/10';

  return (
    <header className="sticky top-0 z-20 mt-6 mb-4 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl shadow-glow-lg">
        {/* Logo Section with Enhanced Styling */}
        <div className="flex items-center gap-3 animate-float">
          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-aurora-purple via-aurora-blue to-aurora-cyan animate-gradient-x"></div>
            <div className="absolute inset-0 h-10 w-10 rounded-2xl bg-gradient-to-br from-aurora-purple via-aurora-blue to-aurora-cyan blur-md opacity-50 animate-pulse-glow"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-aurora-purple to-aurora-cyan bg-clip-text text-transparent md:text-3xl">
              AtharAI
            </h1>
            <p className="text-sm font-light text-white/60 -mt-1">AI Assistant</p>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="relative flex gap-1 rounded-2xl bg-black/20 p-2 backdrop-blur-md border border-white/10">
          {/* Background Slider */}
          <div 
            className={`absolute top-2 h-11 w-24 rounded-xl bg-gradient-to-r from-aurora-purple to-aurora-blue shadow-glow transition-transform duration-500 ease-in-out ${
              activeTab === 'chat' ? 'translate-x-0' : 'translate-x-24'
            }`}
          />
          
          {/* Chat Button */}
          <button
            className={`${commonButtonClasses} z-10 ${activeTab === 'chat' ? 'text-white' : inactiveButtonClasses.split(' ').slice(1).join(' ')}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Chat
            </span>
          </button>
          
          {/* Image Button */}
          <button
            className={`${commonButtonClasses} z-10 ${activeTab === 'image' ? 'text-white' : inactiveButtonClasses.split(' ').slice(1).join(' ')}`}
            onClick={() => setActiveTab('image')}
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Image
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
