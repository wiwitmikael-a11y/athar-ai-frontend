import React, { useState } from 'react';
import type { ImageItem } from '../types';
import Spinner from './Spinner';
import { usePuter } from '../App';

interface ImageCardProps {
  image: ImageItem;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const { puter, isLoggedIn } = usePuter();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const dataURLtoBlob = (dataurl: string): Blob | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSaveImage = async () => {
    if (!puter || !isLoggedIn || !image.uri || saveStatus !== 'idle') return;

    setSaveStatus('saving');
    try {
      const blob = dataURLtoBlob(image.uri);
      if (!blob) throw new Error('Could not convert image data.');

      const safePrompt = image.prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `AtharAI-${safePrompt || 'untitled'}-${timestamp}.png`;

      await puter.fs.writeFile(`/Desktop/${filename}`, blob);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error('Failed to save image:', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md">
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className="flex-1 break-words text-sm font-medium text-gray-200">
          <span className="font-bold text-gray-400">Prompt:</span> {image.prompt}
        </p>
        {isLoggedIn && image.status === 'done' && image.uri && (
          <button
            onClick={handleSaveImage}
            disabled={saveStatus !== 'idle'}
            className="flex-shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-500/50"
            aria-label="Save image to Puter"
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save'}
          </button>
        )}
      </div>
      <div className="flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-lg bg-black/20">
        {image.status === 'pending' && (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <Spinner className="h-8 w-8" />
            <span>Generating...</span>
          </div>
        )}
        {image.status === 'failed' && (
          <div className="p-4 text-center text-red-400">
            <p className="font-bold">Generation Failed</p>
            {image.error && <p className="mt-1 text-sm">{image.error}</p>}
          </div>
        )}
        {image.status === 'done' && image.uri && (
          <img src={image.uri} alt={image.prompt} className="h-full w-full object-cover" />
        )}
      </div>
    </div>
  );
};

export default ImageCard;
