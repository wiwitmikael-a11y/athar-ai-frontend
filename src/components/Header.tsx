import React from 'react';
import type { Tab } from '../types';
import { usePuter } from '../App';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { isLoggedIn, user, login, logout } = usePuter();
  const commonButtonClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white';
  const activeButtonClasses = 'bg-white/90 text-gray-900 shadow-lg';
  const inactiveButtonClasses = 'bg-white/10 text-white hover:bg-white/20';
  const puterButtonClasses = 'px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-700';

  return (
    <header className="sticky top-0 z-20 mt-4 mb-2 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-lg">
      <h1 className="text-xl font-bold text-white md:text-2xl">
        AtharAI
        <span className="font-light opacity-70"> – Assistant</span>
      </h1>
      <div className="flex items-center gap-4">
        <nav className="flex gap-2 rounded-lg bg-black/20 p-1" aria-label="Main navigation">
          <button
            role="tab"
            aria-selected={activeTab === 'chat'}
            className={`${commonButtonClasses} ${activeTab === 'chat' ? activeButtonClasses : inactiveButtonClasses}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'image'}
            className={`${commonButtonClasses} ${activeTab === 'image' ? activeButtonClasses : inactiveButtonClasses}`}
            onClick={() => setActiveTab('image')}
          >
            Image
          </button>
        </nav>
        <div className="flex items-center gap-2">
          {isLoggedIn && user ? (
            <>
              <span className="hidden text-sm text-gray-300 sm:inline">Welcome, {user.username}!</span>
              <button onClick={logout} className={`${commonButtonClasses} ${puterButtonClasses}`}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={login} className={`${commonButtonClasses} ${puterButtonClasses}`}>
              Login with Puter
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
