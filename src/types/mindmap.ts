export interface MindMapNode {
  id: string;
  title: string;
  level: number;
  position: { x: number; y: number };
  children?: MindMapNode[];
  parent?: string;
  color?: string;
  relationshipLabel?: string;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface MindMapData {
  nodes: MindMapNode[];
  connections: Connection[];
}

export interface Connection {
  from: string;
  to: string;
  level: number;
  label?: string;
}

export interface TopLevelConnection {
  from: string;
  to: string;
  label: string;
}

// Complete mindmap configuration schema
export interface MindMapConfig {
  metadata: {
    title: string;
    description?: string;
    version: string;
    created: string;
    lastModified: string;
  };
  nodes: MindMapNode[];
  topLevelConnections: TopLevelConnection[];
  settings?: {
    defaultColors?: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
    };
    layout?: {
      nodeSpacing: number;
      levelSpacing: number;
    };
  };
}