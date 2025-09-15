import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { BACKEND_URL } from '../constants';
import Spinner from './Spinner';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        body: JSON.stringify({ model: 'distilgpt2', prompt: userPrompt }),
      });

      if (!res.ok) {
        throw new Error('Failed to enqueue job.');
      }

      const { jobId } = await res.json();
      if (!jobId) {
        throw new Error('No job ID received.');
      }

      const es = new EventSource(`${BACKEND_URL}/inference/stream/${jobId}`);
      
      // Fix: Specify MessageEvent type for the event object to access `data` property.
      es.addEventListener('result', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        let text = 'No result text found.';
        if (payload.result) {
            text = typeof payload.result[0]?.generated_text === 'string' ? payload.result[0].generated_text : JSON.stringify(payload.result);
        }
        const assistantMessage: Message = { role: 'assistant', text };
        setMessages(prev => [...prev, assistantMessage]);
        es.close();
        setLoading(false);
      });

      // Fix: Specify MessageEvent type for the event object to access `data` property.
      es.addEventListener('error', (e: MessageEvent) => {
        const payload = e.data ? JSON.parse(e.data) : { error: 'Unknown stream error' };
        const errorMessage: Message = { role: 'system', text: `Error: ${payload.error}` };
        setMessages(prev => [...prev, errorMessage]);
        es.close();
        setLoading(false);
      });
      
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred.';
      const errorMessage: Message = { role: 'system', text: `Request failed: ${error}` };
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
    if (msg.role === 'user') {
      return <div className="bg-blue-600 text-white p-3 rounded-lg max-w-lg self-end break-words">{msg.text}</div>;
    }
    if (msg.role === 'assistant') {
      return <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-lg self-start break-words">{msg.text}</div>;
    }
    return <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg max-w-lg self-center text-center text-sm">{msg.text}</div>;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 mb-4 space-y-4 flex flex-col">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 m-auto">Start a conversation with open-source HF models.</div>
        )}
        {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        {loading && (
          <div className="self-start flex items-center gap-2 bg-gray-200 text-gray-800 p-3 rounded-lg">
            <Spinner className="w-5 h-5" />
            <span>Assistant is thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-3 border-t pt-4 bg-gray-50 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 px-4 sm:px-6 py-4">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendChat()}
          className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={handleSendChat}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatView;