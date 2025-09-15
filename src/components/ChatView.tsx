import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { BACKEND_URL } from '../constants';
import Spinner from './Spinner';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const handleSendChat = async () => {
    if (!prompt.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    const userPrompt = prompt;
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/inference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userPrompt,
          quality: 'default', // Uses Mistral-7B-Instruct-v0.3
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.9
          }
        }),
      });

      if (!res.ok) throw new Error('Failed to enqueue job.');

      const { jobId } = await res.json();
      if (!jobId) throw new Error('No job ID received.');

      const es = new EventSource(`${BACKEND_URL}/inference/stream/${jobId}`);
      
      es.addEventListener('result', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        const text = payload.result?.[0]?.generated_text || JSON.stringify(payload.result) || 'No result text found.';
        setMessages(prev => [...prev, { role: 'assistant', text }]);
        es.close();
        setLoading(false);
      });

      es.addEventListener('error', (e: MessageEvent) => {
        const payload = e.data ? JSON.parse(e.data) : { error: 'Unknown stream error' };
        setMessages(prev => [...prev, { role: 'system', text: `Error: ${payload.error}` }]);
        es.close();
        setLoading(false);
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred.';
      setMessages(prev => [...prev, { role: 'system', text: `Request failed: ${error}` }]);
      setLoading(false);
    }
  };

  const MessageBubble: React.FC<{ msg: Message; index: number }> = ({ msg, index }) => {
    const baseClasses = "p-5 rounded-3xl max-w-2xl break-words backdrop-blur-xl shadow-glow transition-all duration-500 hover:scale-[1.02] animate-fade-in-up";
    
    if (msg.role === 'user') {
      return (
        <div className="flex justify-end mb-4" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className={`${baseClasses} bg-gradient-to-br from-aurora-purple/40 via-aurora-blue/30 to-aurora-cyan/40 border border-aurora-purple/30 text-white shadow-glow-lg`}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-aurora-purple to-aurora-blue rounded-3xl opacity-20 blur-sm"></div>
              <div className="relative text-white/95 font-medium leading-relaxed">{msg.text}</div>
            </div>
          </div>
        </div>
      );
    }
    
    if (msg.role === 'assistant') {
      return (
        <div className="flex justify-start mb-4" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className={`${baseClasses} bg-white/10 border border-white/20 text-white shadow-inner-glow`}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-aurora-emerald to-aurora-cyan flex items-center justify-center shadow-glow">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 text-white/90 leading-relaxed">{msg.text}</div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex justify-center mb-4" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className={`${baseClasses} bg-red-500/20 border border-red-400/30 text-red-200 text-center text-sm shadow-glow`}>
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {msg.text}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex h-full flex-col">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 py-6">
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
              <div className="mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-aurora-purple to-aurora-cyan animate-pulse-glow flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to AtharAI</h3>
              <p className="text-white/60 max-w-md">Start a conversation with the AI assistant. Ask questions, get creative, or explore ideas together.</p>
            </div>
          )}
          
          {messages.map((m, i) => <MessageBubble key={i} msg={m} index={i} />)}
          
          {loading && (
            <div className="flex justify-start mb-4 animate-fade-in-up">
              <div className="flex items-center gap-4 rounded-3xl border border-white/20 bg-white/10 p-5 text-white shadow-glow backdrop-blur-xl">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-aurora-emerald to-aurora-cyan flex items-center justify-center shadow-glow">
                  <Spinner className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white/90 font-medium">AI is thinking...</span>
                  <span className="text-white/60 text-sm">Using Mistral-7B-Instruct</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="sticky bottom-0 z-10 p-6 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
        <div className="mx-auto max-w-4xl">
          <div className="relative group">
            {/* Input Field with Enhanced Styling */}
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-glow-lg">
              <input
                ref={inputRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                className="w-full bg-transparent px-6 py-4 pr-16 text-white placeholder-white/50 focus:outline-none text-lg"
                placeholder="Message AtharAI..."
                disabled={loading}
              />
              
              {/* Send Button */}
              <button
                onClick={handleSendChat}
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                  loading || !prompt.trim() 
                    ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-aurora-purple to-aurora-blue text-white shadow-glow hover:scale-110 hover:shadow-glow-lg active:scale-95'
                }`}
                disabled={loading || !prompt.trim()}
                aria-label="Send message"
              >
                {loading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Helpful Hint */}
            <div className="mt-2 flex items-center justify-center gap-2 text-white/40 text-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Press Enter to send • Powered by Mistral-7B-Instruct
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
