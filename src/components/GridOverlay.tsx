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
  const worldLeft = (-centerX) / viewport.zoom;
  const worldRight = (containerWidth - centerX) / viewport.zoom;
  const worldTop = (-centerY) / viewport.zoom;
  const worldBottom = (containerHeight - centerY) / viewport.zoom;
  
  // Calculate grid line positions
  const startX = Math.floor(worldLeft / gridSize) * gridSize;
  const endX = Math.ceil(worldRight / gridSize) * gridSize;
  const startY = Math.floor(worldTop / gridSize) * gridSize;
  const endY = Math.ceil(worldBottom / gridSize) * gridSize;
  
  const verticalLines = [];
  const horizontalLines = [];
  
  // Generate vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    verticalLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={worldTop - 100}
        x2={x}
        y2={worldBottom + 100}
        stroke="rgba(148, 163, 184, 0.3)"
        strokeWidth={x === 0 ? 2 : 1}
        opacity={x === 0 ? 0.6 : 0.4}
      />
    );
  }
  
  // Generate horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    horizontalLines.push(
      <line
        key={`h-${y}`}
        x1={worldLeft - 100}
        y1={y}
        x2={worldRight + 100}
        y2={y}
        stroke="rgba(148, 163, 184, 0.3)"
        strokeWidth={y === 0 ? 2 : 1}
        opacity={y === 0 ? 0.6 : 0.4}
      />
    );
  }
  
  return (
    <g className="grid-overlay pointer-events-none">
      {verticalLines}
      {horizontalLines}
      
      {/* Origin point indicator */}
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="rgba(148, 163, 184, 0.6)"
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
};

export default GridOverlay;