import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import Spinner from './Spinner';
import { usePuter } from '../App';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoggedIn, puter } = usePuter();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleSaveChat = async () => {
    if (!puter || !isLoggedIn || messages.length === 0 || saveStatus !== 'idle') return;

    setSaveStatus('saving');
    try {
      const formattedChat = messages
        .map(msg => `**${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:**\n\n${msg.text}\n`)
        .join('\n---\n');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `AtharAI-chat-${timestamp}.md`;

      await puter.fs.writeTextFile(`/Desktop/${filename}`, formattedChat);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error("Failed to save chat:", e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSendChat = async () => {
    if (!prompt.trim() || loading || !puter) return;

    const userMessage: Message = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    // Add a placeholder for the assistant's response
    setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

    try {
      const responseStream = await puter.ai.chat(currentPrompt, {
        model: 'gpt-4o-mini',
        stream: true,
      });

      for await (const chunk of responseStream) {
        if(chunk.text) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text += chunk.text;
            return newMessages;
          });
        }
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'An unknown error occurred.';
      setMessages(prev => {
        const newMessages = [...prev];
        // Replace the empty assistant message with an error message
        newMessages[newMessages.length-1] = { role: 'system', text: `Error: ${errorText}` };
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const bubbleClasses = "p-4 rounded-2xl max-w-lg break-words border border-white/20 backdrop-blur-md shadow-lg";
    if (msg.role === 'user') {
      return <div className={`${bubbleClasses} bg-blue-500/30 self-end text-white`}>{msg.text}</div>;
    }
    if (msg.role === 'assistant') {
      return <div className={`${bubbleClasses} bg-white/20 self-start text-white`}>{msg.text}</div>;
    }
    return <div className={`${bubbleClasses} bg-red-500/30 self-center text-center text-sm`}>{msg.text}</div>;
  };
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        <div className="flex flex-col space-y-4">
          {messages.length === 0 && !loading && (
            <div className="m-auto text-center text-gray-400">Start a conversation.</div>
          )}
          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
          {loading && messages[messages.length - 1]?.text === '' && (
            <div className="self-start flex items-center gap-3 rounded-2xl border border-white/20 bg-white/20 p-4 text-white shadow-lg backdrop-blur-md">
              <Spinner className="h-5 w-5" />
              <span>Assistant is thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="sticky bottom-0 z-10 w-full py-4">
        {isLoggedIn && messages.some(m => m.role !== 'system') && (
          <div className="mb-2 flex justify-end">
            <button
              onClick={handleSaveChat}
              disabled={saveStatus !== 'idle'}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-500/50"
              aria-label="Save chat history to Puter"
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Save Failed' : 'Save Chat'}
            </button>
          </div>
        )}
        <div className="relative">
          <input
            ref={inputRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendChat()}
            className="w-full rounded-2xl border border-white/20 bg-white/10 p-4 pr-14 text-white placeholder-gray-400 backdrop-blur-lg focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            placeholder="Type your message..."
            disabled={loading}
            aria-label="Chat input"
          />
          <button
            onClick={handleSendChat}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-500"
            disabled={loading || !prompt.trim()}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
