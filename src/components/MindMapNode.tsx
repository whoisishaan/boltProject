import React, { useRef, useEffect, useState } from 'react';
import { MindMapNode as NodeType } from '../types/mindmap';

interface MindMapNodeProps {
  node: NodeType;
  onClick: (node: NodeType) => void;
  onDrag: (nodeId: string, newPosition: { x: number; y: number }) => void;
  scale: number;
  isDragging: boolean;
  onDragStart: (nodeId: string) => void;
  onDragEnd: () => void;
  snapToGrid: boolean;
  gridSize: number;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({ 
  node, 
  onClick, 
  onDrag,
  scale, 
  isDragging,
  onDragStart,
  onDragEnd,
  snapToGrid,
  gridSize
}) => {
  const textRef = useRef<SVGTextElement>(null);
  const [textDimensions, setTextDimensions] = useState({ width: 120, height: 40 });
  const [isNodeDragging, setIsNodeDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  
  const fontSize = Math.max(12, 16 - (node.level * 2));
  const DRAG_THRESHOLD = 5; // Minimum pixels to move before considering it a drag
  
  useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      // Add padding around text with more generous spacing
      const width = Math.max(120, bbox.width + 50);
      const height = Math.max(40, bbox.height + 36);
      setTextDimensions({ width, height });
    }
  }, [node.title, fontSize]);

  // Calculate ellipse radii based on text dimensions
  const rx = textDimensions.width / 2;
  const ry = textDimensions.height / 2;

  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if it's a left click
    if (e.button !== 0) return;
    
    setIsNodeDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPosition({ x: node.position.x, y: node.position.y });
    setHasMoved(false);
    
    // Prevent text selection
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isNodeDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only start actual dragging if we've moved beyond the threshold
    if (distance > DRAG_THRESHOLD && !hasMoved) {
      setHasMoved(true);
      onDragStart(node.id);
    }
    
    // Only update position if we're actually dragging
    if (hasMoved) {
      const scaledDeltaX = deltaX / scale;
      const scaledDeltaY = deltaY / scale;
      
      const newPosition = {
        x: initialPosition.x + scaledDeltaX,
        y: initialPosition.y + scaledDeltaY
      };
      
      const snappedPosition = snapToGridPosition(newPosition.x, newPosition.y);
      onDrag(node.id, snappedPosition);
    }
  };

  const handleMouseUp = () => {
    if (isNodeDragging) {
      setIsNodeDragging(false);
      
      // Only call onDragEnd if we actually dragged
      if (hasMoved) {
        onDragEnd();
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only trigger click if we didn't drag (didn't move beyond threshold)
    if (!hasMoved) {
      onClick(node);
    }
  };

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isNodeDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isNodeDragging, dragStart, initialPosition, scale, snapToGrid, gridSize, hasMoved]);
  
  return (
    <g
      className={`mindmap-node cursor-pointer group ${isNodeDragging && hasMoved ? 'cursor-grabbing' : 'cursor-grab'} transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}
      transform={`translate(${node.position.x}, ${node.position.y})`}
      style={{
        willChange: 'transform, opacity',
        transformOrigin: 'center',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'subpixel-antialiased',
        transformStyle: 'preserve-3d',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Node shadow */}
      <ellipse
        rx={rx + 3}
        ry={ry + 3}
        fill="rgba(0,0,0,0.1)"
        transform="translate(2, 2)"
      />
      
      {/* Main node */}
      <ellipse
        rx={rx}
        ry={ry}
        fill={node.color || '#3B82F6'}
        stroke="white"
        strokeWidth="3"
        className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isNodeDragging && hasMoved ? 'drop-shadow-2xl scale-105' : ''}`}
        style={{
          filter: `brightness(${isNodeDragging && hasMoved ? '1.1' : '1'}) ${isNodeDragging && hasMoved ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : ''}`,
          transform: isNodeDragging && hasMoved ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, filter, box-shadow, stroke-width'
        }}
      />
      
      {/* Drag indicator ring when actively dragging */}
      {isNodeDragging && hasMoved && (
        <ellipse
          rx={rx + 12}
          ry={ry + 12}
          fill="none"
          stroke={node.color || '#3B82F6'}
          strokeWidth="2"
          strokeDasharray="8,4"
          opacity="0.6"
          className="animate-pulse"
        />
      )}
      
      {/* Hidden text for measurement */}
      <text
        ref={textRef}
        textAnchor="middle"
        dy="0.35em"
        fill="white"
        fontSize={`${fontSize}px`}
        fontWeight="600"
        className="pointer-events-none select-none"
        opacity="0"
        aria-hidden="true"
      >
        {node.title}
      </text>
      
      {/* Visible node text */}
      <text
        textAnchor="middle"
        dy="0.35em"
        fill="white"
        fontSize={`${fontSize}px`}
        fontWeight="600"
        className="pointer-events-none select-none"
      >
        {node.title}
      </text>
      
      {/* Hover ring */}
      <ellipse
        rx={rx + 8}
        ry={ry + 8}
        fill="none"
        stroke={node.color || '#3B82F6'}
        strokeWidth="2"
        opacity="0"
        className={`transition-opacity duration-300 ${!(isNodeDragging && hasMoved) ? 'group-hover:opacity-30' : ''}`}
      />
    </g>
  );
};

export default MindMapNode;