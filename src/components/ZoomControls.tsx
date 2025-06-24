import React from 'react';
import { ZoomIn, ZoomOut, Home as ZoomReset } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  className?: string;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center p-1 ${className}`}>
      <button
        onClick={onZoomOut}
        disabled={zoom <= 0.5}
        className={`p-2 rounded-md ${
          zoom <= 0.5
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        } transition-colors`}
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-2">
        {Math.round(zoom * 100)}%
      </span>
      
      <button
        onClick={onZoomIn}
        disabled={zoom >= 2}
        className={`p-2 rounded-md ${
          zoom >= 2
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        } transition-colors`}
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      
      <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
      
      <button
        onClick={onReset}
        className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        aria-label="Reset zoom"
      >
        <ZoomReset className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ZoomControls;