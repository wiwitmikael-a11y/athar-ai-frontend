import React, { useState, createContext, useContext, useEffect } from 'react';
import Header from './components/Header';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import type { PuterContextType, PuterUser, Tab } from './types';

export const PuterContext = createContext<PuterContextType | null>(null);

export const usePuter = (): PuterContextType => {
  const context = useContext(PuterContext);
  if (!context) {
    throw new Error('usePuter must be used within a PuterProvider');
  }
  return context;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [puter, setPuter] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<PuterUser | null>(null);

  useEffect(() => {
    if (window.puter) {
      setPuter(window.puter);

      const checkUser = async () => {
        try {
          const currentUser = await window.puter.auth.user();
          if (currentUser) {
            setUser(currentUser);
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error("Error checking for current user:", error);
        }
      };
      
      checkUser();
      
      window.puter.auth.on('sign-in', (newUser: PuterUser) => {
        setUser(newUser);
        setIsLoggedIn(true);
      });
      
      window.puter.auth.on('sign-out', () => {
        setUser(null);
        setIsLoggedIn(false);
      });
    }
  }, []);

  const login = () => puter?.auth.signIn();
  const logout = () => puter?.auth.signOut();

  return (
    <PuterContext.Provider value={{ puter, isLoggedIn, user, login, logout }}>
      <div className="relative h-screen w-screen overflow-hidden bg-gray-900 font-sans text-white">
        {/* Aurora Background */}
        <div className="absolute top-0 left-0 h-full w-full overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-aurora-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-30 blur-3xl filter"></div>
          <div className="absolute top-1/4 left-1/4 h-[400px] w-[600px] -translate-x-1/4 -translate-y-1/4 animate-aurora-2 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 opacity-20 blur-3xl filter"></div>
          <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[400px] -translate-x-1/4 -translate-y-1/4 animate-aurora-3 rounded-full bg-gradient-to-br from-pink-500 to-red-500 opacity-30 blur-3xl filter"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 overflow-y-auto px-4 md:px-6">
            {activeTab === 'chat' ? <ChatView /> : <ImageView />}
          </main>
        </div>
      </div>
    </PuterContext.Provider>
  );
};

export default App;
