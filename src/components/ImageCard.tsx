import React from 'react';
import type { ImageItem } from '../types';
import Spinner from './Spinner';

interface ImageCardProps {
  image: ImageItem;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md">
      <p className="mb-3 break-words text-sm font-medium text-gray-200">
        <span className="font-bold text-gray-400">Prompt:</span> {image.prompt}
      </p>
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-black/20">
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
