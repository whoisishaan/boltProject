import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MindMapNode as NodeType, ViewportState, TopLevelConnection } from '../types/mindmap';
import { getVisibleNodes, getNodeConnections, getTopLevelConnections } from '../utils/mindmapUtils';
import { optimizeLayout } from '../utils/layoutUtils';
import { useTheme } from '../contexts/ThemeContext';
import MindMapNode from './MindMapNode';
import Connection from './Connection';
import ZoomControls from './ZoomControls';
import TopicHeader from './TopicHeader';
import ThemeToggle from './ThemeToggle';
import GridOverlay from './GridOverlay';
import FileUpload from './FileUpload';

interface MindMapCanvasProps {
  data: NodeType[];
  topLevelConnections: TopLevelConnection[];
  title?: string;
  description?: string;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ 
  data, 
  topLevelConnections, 
  title = "Interactive Mindmap",
  description 
}) => {
  const { isDark } = useTheme();
  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    zoom: 0.7
  });
  const [focusedNode, setFocusedNode] = useState<string | undefined>();
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [mindmapData, setMindmapData] = useState<NodeType[]>(data);
  
  // Grid settings - now enabled by default with customizable options
  const snapToGrid = true;
  const showGrid = true; // Changed from false to true to show the grid
  const gridSize = 50; // You can adjust this value (25, 50, 100, etc.)
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Utility to get bounding box center of all nodes
  function getMindmapCenter(nodes: NodeType[]) {
    if (!nodes.length) return { x: 0, y: 0 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y);
    });
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    };
  }

  // Update mindmap data when props change
  useEffect(() => {
    setMindmapData(data);
  }, [data]);

  // Center viewport on mindmap content at initial load
  useEffect(() => {
    const center = getMindmapCenter(mindmapData);
    setViewport(prev => ({
      ...prev,
      x: -center.x - 200, // shift more to the left
      y: -center.y
    }));
  }, [mindmapData.length]);

  // Optimize layout to prevent overlapping
  const optimizedData = optimizeLayout(mindmapData);
  
  const visibleNodes = getVisibleNodes(optimizedData, viewport.zoom, focusedNode);
  const hierarchicalConnections = getNodeConnections(optimizedData).filter(conn => 
    visibleNodes.includes(conn.from) && visibleNodes.includes(conn.to)
  );
  
  // Get top-level connections only when showing top-level nodes
  const topLevelConnectionsVisible = getTopLevelConnections(optimizedData, topLevelConnections).filter(conn =>
    visibleNodes.includes(conn.from) && visibleNodes.includes(conn.to) && 
    conn.from.level === 0 && conn.to.level === 0
  );

  const allConnections = [...hierarchicalConnections, ...topLevelConnectionsVisible];

  const updateNodePosition = (nodeId: string, newPosition: { x: number; y: number }) => {
    const updateNodeInTree = (nodes: NodeType[]): NodeType[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, position: newPosition };
        }
        if (node.children) {
          return { ...node, children: updateNodeInTree(node.children) };
        }
        return node;
      });
    };
    
    setMindmapData(updateNodeInTree(mindmapData));
  };

  const handleNodeClick = useCallback((node: NodeType) => {
    if (node.children && node.children.length > 0) {
      setFocusedNode(node.id);
      // Smooth transition to node
      setViewport(prev => ({
        x: -node.position.x,
        y: -node.position.y,
        zoom: Math.min(prev.zoom * 1.5, 3)
      }));
    }
  }, []);

  const handleNodeDrag = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    updateNodePosition(nodeId, newPosition);
  }, [mindmapData]);

  const handleNodeDragStart = useCallback((nodeId: string) => {
    setDraggedNodeId(nodeId);
  }, []);

  const handleNodeDragEnd = useCallback(() => {
    setDraggedNodeId(null);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start panning if we're not dragging a node
    if (e.button === 0 && !draggedNodeId) { // Left mouse button
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [draggedNodeId]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && !draggedNodeId) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setViewport(prev => ({
        ...prev,
        x: prev.x + deltaX / prev.zoom,
        y: prev.y + deltaY / prev.zoom
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint, draggedNodeId]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, viewport.zoom * delta));
    
    setViewport(prev => ({
      ...prev,
      zoom: newZoom
    }));
    
    if (newZoom < 1) {
      setFocusedNode(undefined);
    }
  }, [viewport.zoom]);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 3)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(viewport.zoom * 0.8, 0.3);
    setViewport(prev => ({
      ...prev,
      zoom: newZoom
    }));
    
    if (newZoom < 1) {
      setFocusedNode(undefined);
    }
  }, [viewport.zoom]);

  const handleResetView = useCallback(() => {
    const center = getMindmapCenter(mindmapData);
    setViewport({
      x: -center.x - 200, // shift more to the left
      y: -center.y,
      zoom: 0.7 // Set default zoom to 70%
    });
    setFocusedNode(undefined);
  }, [mindmapData]);

  // Global mouse event listeners for panning
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning && !draggedNodeId) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;
        
        setViewport(prev => ({
          ...prev,
          x: prev.x + deltaX / prev.zoom,
          y: prev.y + deltaY / prev.zoom
        }));
        
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsPanning(false);
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isPanning, lastPanPoint, draggedNodeId]);

  return (
    <div className={`
      relative w-full h-full overflow-hidden transition-colors duration-500
      ${isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }
    `}>
      {/* Topic Header */}
      <TopicHeader title={title} description={description} />
      
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3">
        <FileUpload 
          compact
          onUploadSuccess={(fileId) => {
            console.log('File uploaded successfully:', fileId);
            // You can add any additional handling here
          }}
          onError={(error) => {
            console.error('Upload error:', error);
            // Handle error (show toast/notification)
          }}
        />
        <ZoomControls 
          zoom={viewport.zoom} 
          onZoomIn={handleZoomIn} 
          onZoomOut={handleZoomOut} 
          onReset={handleResetView} 
        />
      </div>

      <div
        ref={containerRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="w-full h-full select-none"
          style={{ minHeight: '100vh', cursor: isPanning ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Grid remains still */}
          {showGrid && (
            <GridOverlay
              gridSize={gridSize}
              viewport={viewport}
              containerWidth={window.innerWidth}
              containerHeight={window.innerHeight}
            />
          )}
          {/* Mindmap content moves/zooms */}
          <g
            className="smooth-zoom"
            style={{
              transform: `translate(${window.innerWidth / 2 + viewport.x}px, ${window.innerHeight / 2 + viewport.y}px) scale(${viewport.zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Render connections first */}
            {allConnections.map((conn, index) => (
              <Connection
                key={`${conn.from.id}-${conn.to.id}-${index}`}
                from={conn.from}
                to={conn.to}
                label={conn.label}
              />
            ))}
            
            {/* Render nodes */}
            {visibleNodes.map((node) => (
              <MindMapNode
                key={node.id}
                node={node}
                onClick={handleNodeClick}
                onDrag={handleNodeDrag}
                onDragStart={handleNodeDragStart}
                onDragEnd={handleNodeDragEnd}
                scale={viewport.zoom}
                isDragging={draggedNodeId === node.id}
                snapToGrid={snapToGrid}
                gridSize={gridSize}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default MindMapCanvas;