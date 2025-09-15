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

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const { jobId } = await res.json();
      if (!jobId) {
        throw new Error('No job ID received.');
      }

      const es = new EventSource(`${BACKEND_URL}/inference/stream/${jobId}`);
      
      // Fix: Specify MessageEvent type for the event object to access `data` property.
      es.addEventListener('result', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        const imgUri = payload.result?.image;
        if (imgUri) {
          setImages(prev => prev.map(img => img.id === newItem.id ? { ...img, status: 'done', uri: imgUri } : img));
        } else {
          // Fix: Handle cases where the result is successful but doesn't contain the image URI.
          setImages(prev => prev.map(img => img.id === newItem.id ? { ...img, status: 'failed', error: 'Image URI not found in payload.' } : img));
        }
        es.close();
        setIsGenerating(false);
      });

      // Fix: Specify MessageEvent type and handle error state update directly.
      // Throwing an error in an async callback won't be caught by the outer try-catch block.
      es.addEventListener('error', (e: MessageEvent) => {
        const payload = e.data ? JSON.parse(e.data) : { error: 'Unknown stream error' };
        const error = payload.error || 'An unknown stream error occurred.';
        setImages(prev => prev.map(img => img.id === newItem.id ? { ...img, status: 'failed', error } : img));
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
    <div className="flex flex-col">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateImage()}
            className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
            placeholder="Describe the image you want (e.g., 'a fantasy landscape at sunrise')"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerateImage}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 transition"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </div>

      {images.length === 0 && (
          <div className="text-center text-gray-500 mt-8">Your generated images will appear here.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map(item => (
          <ImageCard key={item.id} image={item} />
        ))}
      </div>
    </div>
  );
};

export default ImageView;