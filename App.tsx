import React, { useState } from 'react';
import Header from './components/Header';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';

export type Tab = 'chat' | 'image';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900 font-sans text-white">
      {/* Aurora Background */}
      <div className="absolute top-0 left-0 h-full w-full overflow-hidden">
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
  );
};

export default App;
