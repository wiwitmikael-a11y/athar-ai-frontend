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
        body: JSON.stringify({ model: 'runwayml/stable-diffusion-v1-5', prompt: currentPrompt }),
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
    <div className="flex flex-col py-4">
      <div className="sticky top-0 z-10 mb-6 w-full">
        <div className="relative">
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateImage()}
            className="w-full rounded-2xl border border-white/20 bg-white/10 p-4 pr-40 text-white placeholder-gray-400 backdrop-blur-lg focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            placeholder="Describe an image..."
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerateImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-gray-500 disabled:saturate-50"
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {images.length === 0 && (
          <div className="mt-8 text-center text-gray-400">Generated images will appear here.</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {images.map(item => (
          <ImageCard key={item.id} image={item} />
        ))}
      </div>
    </div>
  );
};

export default ImageView;
