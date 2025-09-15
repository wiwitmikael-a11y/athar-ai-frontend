import React, { useState } from 'react';
import Header from './components/Header';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';

export type Tab = 'chat' | 'image';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans text-white">
      {/* Enhanced Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Aurora Layers */}
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-aurora-1 rounded-full bg-gradient-to-br from-aurora-purple via-aurora-blue to-aurora-cyan opacity-40 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[700px] -translate-x-1/3 -translate-y-1/3 animate-aurora-2 rounded-full bg-gradient-to-br from-aurora-indigo via-aurora-violet to-aurora-pink opacity-25 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 h-[700px] w-[500px] translate-x-1/3 translate-y-1/3 animate-aurora-3 rounded-full bg-gradient-to-br from-aurora-pink via-aurora-purple to-aurora-blue opacity-35 blur-3xl"></div>
        
        {/* Secondary Aurora Effects */}
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] -translate-y-1/4 translate-x-1/4 animate-aurora-4 rounded-full bg-gradient-to-br from-aurora-emerald via-aurora-cyan to-aurora-blue opacity-20 blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 h-[350px] w-[450px] translate-y-1/4 -translate-x-1/4 animate-aurora-5 rounded-full bg-gradient-to-br from-aurora-violet via-aurora-indigo to-aurora-purple opacity-30 blur-2xl"></div>
        
        {/* Subtle Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10"></div>
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
