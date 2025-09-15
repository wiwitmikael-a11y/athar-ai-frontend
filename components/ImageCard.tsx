import React from 'react';
import type { ImageItem } from '../types';
import Spinner from './Spinner';

interface ImageCardProps {
  image: ImageItem;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col h-full">
      <p className="text-sm text-gray-700 mb-3 font-medium break-words">
        <span className="font-bold text-gray-500">Prompt:</span> {image.prompt}
      </p>
      <div className="flex-1 flex items-center justify-center aspect-square bg-gray-100 rounded-md overflow-hidden">
        {image.status === 'pending' && (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Spinner className="w-8 h-8" />
            <span>Generating...</span>
          </div>
        )}
        {image.status === 'failed' && (
          <div className="text-red-500 p-4 text-center">
            <p className="font-bold">Generation Failed</p>
            {image.error && <p className="text-sm mt-1">{image.error}</p>}
          </div>
        )}
        {image.status === 'done' && image.uri && (
          <img src={image.uri} alt={image.prompt} className="w-full h-full object-cover" />
        )}
      </div>
    </div>
  );
};

export default ImageCard;
