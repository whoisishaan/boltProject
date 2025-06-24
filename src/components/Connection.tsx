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
  
  // Calculate control points for smooth curves
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const adjustedDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const curvature = Math.min(adjustedDistance * 0.25, 80);
  
  const controlX1 = midX + (y2 - y1) * curvature / adjustedDistance;
  const controlY1 = midY - (x2 - x1) * curvature / adjustedDistance;
  
  const pathData = `M ${x1} ${y1} Q ${controlX1} ${controlY1} ${x2} ${y2}`;
  
  // Calculate label position - offset perpendicular to the line to avoid overlap
  const labelX = (x1 + controlX1 + x2) / 3;
  const labelY = (y1 + controlY1 + y2) / 3;
  
  // Calculate perpendicular offset to position text above/beside the line
  const perpX = -(y2 - y1) / adjustedDistance;
  const perpY = (x2 - x1) / adjustedDistance;
  const offsetDistance = 18; // Increased distance from the line
  
  const finalLabelX = labelX + perpX * offsetDistance;
  const finalLabelY = labelY + perpY * offsetDistance;
  
  // Calculate angle for label rotation
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const normalizedAngle = angle > 90 || angle < -90 ? angle + 180 : angle;
  
  // Theme-aware colors
  const shadowColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)';
  const lineColor = isDark ? '#64748B' : '#94A3B8';
  const hoverColor = isDark ? '#475569' : '#64748B';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  
  return (
    <g className="connection">
      {/* Connection shadow */}
      <path
        d={pathData}
        stroke={shadowColor}
        strokeWidth="4"
        fill="none"
        transform="translate(2, 2)"
      />
      
      {/* Main connection */}
      <path
        d={pathData}
        stroke={lineColor}
        strokeWidth="2"
        fill="none"
        className="transition-all duration-300 hover:stroke-3"
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
      
      {/* Connection label - Positioned offset from the line to prevent overlap */}
      {label && (
        <text
          x={finalLabelX}
          y={finalLabelY}
          textAnchor="middle"
          dy="0.35em"
          fill={textColor}
          fontSize="10px"
          fontWeight="500"
          className="pointer-events-none select-none drop-shadow-sm"
          transform={`rotate(${normalizedAngle} ${finalLabelX} ${finalLabelY})`}
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default Connection;