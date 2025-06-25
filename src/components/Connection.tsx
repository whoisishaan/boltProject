import React from 'react';
import { MindMapNode } from '../types/mindmap';
import { useTheme } from '../contexts/ThemeContext';

interface ConnectionProps {
  from: MindMapNode;
  to: MindMapNode;
  label?: string;
}

const Connection: React.FC<ConnectionProps> = ({ from, to, label }) => {
  const { isDark } = useTheme();
  
  // Calculate node radii more accurately for proper arrow positioning
  const getNodeRadius = (node: MindMapNode) => {
    const baseWidth = Math.max(120, node.title.length * 8 + 40);
    const baseHeight = Math.max(40, 32 + 16);
    // Use the larger dimension to ensure arrow doesn't overlap with node
    return Math.max(baseWidth, baseHeight) / 2 + 5; // Extra 5px padding
  };
  
  const fromRadius = getNodeRadius(from);
  const toRadius = getNodeRadius(to);
  
  // Calculate direction vector
  const dx = to.position.x - from.position.x;
  const dy = to.position.y - from.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Normalize direction vector
  const unitX = dx / distance;
  const unitY = dy / distance;
  
  // Calculate start and end points with proper spacing from node edges
  const x1 = from.position.x + unitX * fromRadius;
  const y1 = from.position.y + unitY * fromRadius;
  const x2 = to.position.x - unitX * toRadius;
  const y2 = to.position.y - unitY * toRadius;
  
  // Theme-aware colors
  const shadowColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)';
  const lineColor = isDark ? '#64748B' : '#94A3B8';
  const hoverColor = isDark ? '#475569' : '#64748B';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  
  // Calculate midpoint for label
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  return (
    <g className="connection">
      {/* Connection shadow */}
      <line
        x1={x1 + 2}
        y1={y1 + 2}
        x2={x2 + 2}
        y2={y2 + 2}
        stroke={shadowColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Main connection */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-colors duration-300"
        style={{
          '--hover-color': hoverColor
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          e.currentTarget.style.stroke = hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.stroke = lineColor;
        }}
        markerEnd="url(#arrowhead)"
      />
      
      {/* Connection label */}
      {label && (
        <text
          x={midX}
          y={midY - 8} // Position slightly above the line
          textAnchor="middle"
          fill={textColor}
          fontSize="10px"
          fontWeight="500"
          className="pointer-events-none select-none drop-shadow-sm"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default Connection;