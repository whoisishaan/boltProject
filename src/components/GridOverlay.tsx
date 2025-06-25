import React from 'react';
import { ViewportState } from '../types/mindmap';

interface GridOverlayProps {
  gridSize: number;
  viewport: ViewportState;
  containerWidth: number;
  containerHeight: number;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ 
  gridSize, 
  viewport, 
  containerWidth, 
  containerHeight 
}) => {
  // Calculate grid bounds based on viewport
  const centerX = containerWidth / 2 + viewport.x;
  const centerY = containerHeight / 2 + viewport.y;
  
  // Calculate visible area in world coordinates
  const worldLeft = (-centerX) / viewport.zoom - gridSize;  // Add extra grid cell to the left
  const worldRight = (containerWidth - centerX) / viewport.zoom + gridSize;  // Add extra grid cell to the right
  const worldTop = (-centerY) / viewport.zoom - gridSize;  // Add extra grid cell to the top
  const worldBottom = (containerHeight - centerY) / viewport.zoom + gridSize;  // Add extra grid cell to the bottom
  
  // Calculate grid positions
  const startX = Math.floor(worldLeft / gridSize) * gridSize;
  const endX = Math.ceil(worldRight / gridSize) * gridSize;
  const startY = Math.floor(worldTop / gridSize) * gridSize;
  const endY = Math.ceil(worldBottom / gridSize) * gridSize;
  
  const gridDots = [];
  
  // Generate grid dots at intersections
  for (let x = startX; x <= endX; x += gridSize) {
    for (let y = startY; y <= endY; y += gridSize) {
      const isOrigin = x === 0 && y === 0;
      gridDots.push(
        <circle
          key={`dot-${x}-${y}`}
          cx={x}
          cy={y}
          r={isOrigin ? 1.5 : 1} // Slightly larger dot at origin
          fill="rgba(148, 163, 184, 0.7)"
          opacity={isOrigin ? 0.8 : 0.4}
        />
      );
    }
  }
  
  return (
    <g className="grid-overlay pointer-events-none">
      {gridDots}
      
      {/* Origin point indicator */}
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="rgba(148, 163, 184, 0.9)"
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
};

export default GridOverlay;