import React, { useState } from 'react';
import type { ImageItem } from '../types';
import { BACKEND_URL } from '../constants';
import ImageCard from './ImageCard';

const ImageView: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const newItem: ImageItem = {
      id: crypto.randomUUID(),
      status: 'pending',
      prompt: prompt,
    };
    setImages(prev => [newItem, ...prev]);
    const currentPrompt = prompt;
    setPrompt('');

    try {
      const res = await fetch(`${BACKEND_URL}/inference/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentPrompt,
          quality: 'fast', // Uses FLUX.1-schnell for fastest generation
          parameters: {
            width: 1024,
            height: 1024,
            num_inference_steps: 4,
            guidance_scale: 0.0
          }
        }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const { jobId } = await res.json();
      if (!jobId) throw new Error('No job ID received.');

      const es = new EventSource(`${BACKEND_URL}/inference/stream/${jobId}`);
      
      es.addEventListener('result', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        const imgUri = payload.result?.image;
        if (imgUri) {
          setImages(prev => prev.map(img => img.id === newItem.id ? { ...img, status: 'done', uri: imgUri } : img));
        } else {
          setImages(prev => prev.map(img => img.id === newItem.id ? { ...img, status: 'failed', error: 'Image URI not found.' } : img));
        }
        es.close();
        setIsGenerating(false);
      });

      es.addEventListener('error', (e: MessageEvent) => {
        const payload = e.data ? JSON.parse(e.data) : { error: 'Unknown stream error' };
        setImages(prev => prev.map(img => img.id === newItem.id ? { ...img, status: 'failed', error: payload.error } : img));
        es.close();
        setIsGenerating(false);
      });

    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred.';
      setImages(prev => prev.map(img => img.id === newItem.id ? { ...img, status: 'failed', error } : img));
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col px-2 py-6">
      {/* Enhanced Image Generation Input */}
      <div className="sticky top-0 z-10 mb-8 animate-fade-in-up">
        <div className="mx-auto max-w-4xl">
          <div className="relative group">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-glow-lg">
              <input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleGenerateImage()}
                className="w-full bg-transparent px-6 py-4 pr-40 text-white placeholder-white/50 focus:outline-none text-lg"
                placeholder="Describe your image vision..."
                disabled={isGenerating}
              />
              
              <button
                onClick={handleGenerateImage}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-medium ${
                  isGenerating || !prompt.trim() 
                    ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-aurora-emerald to-aurora-cyan text-white shadow-glow hover:scale-105 hover:shadow-glow-lg active:scale-95'
                }`}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Model Info */}
            <div className="mt-2 flex items-center justify-center gap-2 text-white/40 text-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Powered by FLUX.1-schnell • Ultra-fast generation
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mx-auto max-w-6xl w-full">
        {images.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-aurora-emerald to-aurora-cyan animate-pulse-glow flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Create Stunning Images</h3>
            <p className="text-white/60 max-w-md">Describe your vision and watch it come to life with AI-powered image generation. From photorealistic to artistic styles.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((item, index) => (
            <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <ImageCard image={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageView;
