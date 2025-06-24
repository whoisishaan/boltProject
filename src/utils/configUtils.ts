import { MindMapNode, MindMapConfig, TopLevelConnection } from '../types/mindmap';

export const createMindMapConfig = (
  nodes: MindMapNode[],
  topLevelConnections: TopLevelConnection[],
  title: string = 'Untitled Mindmap'
): MindMapConfig => {
  const now = new Date().toISOString();
  
  return {
    metadata: {
      title,
      description: `Interactive mindmap with ${nodes.length} nodes`,
      version: '1.0.0',
      created: now,
      lastModified: now
    },
    nodes,
    topLevelConnections,
    settings: {
      defaultColors: {
        level0: '#3B82F6',
        level1: '#60A5FA',
        level2: '#93C5FD',
        level3: '#DBEAFE'
      },
      layout: {
        nodeSpacing: 200,
        levelSpacing: 150
      }
    }
  };
};

// Generate a gradient of colors for each level
const getColorForLevel = (level: number): string => {
  const colors = [
    '#3B82F6', // level 0 - blue
    '#60A5FA', // level 1 - light blue
    '#93C5FD', // level 2 - lighter blue
    '#BFDBFE', // level 3 - very light blue
    '#93C5FD', // level 4 - lighter blue (repeating pattern)
    '#60A5FA', // level 5 - light blue (repeating pattern)
    '#3B82F6', // level 6 - blue (repeating pattern)
    '#2563EB', // level 7 - dark blue
    '#1D4ED8'  // level 8 - darker blue
  ];
  return colors[level % colors.length];
};

// Generate a unique ID for nodes
const generateId = (prefix: string, level: number, index: number): string => {
  return `${prefix}-l${level}-${index}`;
};

// Generate nodes for a given level
const generateLevelNodes = (
  parentId: string | null, 
  level: number, 
  maxLevels: number,
  xOffset: number = 0, 
  yOffset: number = 0,
  index: number = 0
): MindMapNode[] => {
  if (level >= maxLevels) return [];
  
  const nodeCount = 3; // Number of nodes per level
  const nodes: MindMapNode[] = [];
  const levelSpacing = 200;
  const nodeSpacing = 300;
  
  for (let i = 0; i < nodeCount; i++) {
    const nodeId = parentId 
      ? generateId(`${parentId}-${i}`, level, i)
      : generateId('root', level, i);
      
    const x = xOffset + (i - (nodeCount - 1) / 2) * nodeSpacing;
    const y = yOffset + level * levelSpacing;
    
    const node: MindMapNode = {
      id: nodeId,
      title: `Level ${level} Node ${i + 1}`,
      level,
      position: { x, y },
      color: getColorForLevel(level),
      relationshipLabel: level > 0 ? 'child' : undefined,
      parent: parentId || undefined
    };
    
    // Recursively generate children
    const children = generateLevelNodes(
      nodeId, 
      level + 1, 
      maxLevels, 
      x, 
      y + levelSpacing,
      i
    );
    
    if (children.length > 0) {
      node.children = children;
    }
    
    nodes.push(node);
  }
  
  return nodes;
};

export const generateSampleConfig = (maxLevels: number = 9): MindMapConfig => {
  // Generate nodes up to the specified maxLevels
  const nodes = generateLevelNodes(null, 0, maxLevels, 0, 0);
  
  // Flatten nodes to generate connections
  const flatNodes: MindMapNode[] = [];
  const flatten = (node: MindMapNode) => {
    flatNodes.push(node);
    if (node.children) {
      node.children.forEach(flatten);
    }
  };
  nodes.forEach(flatten);
  
  // Generate top-level connections (between root nodes)
  const topLevelConnections: TopLevelConnection[] = [];
  if (nodes.length > 1) {
    for (let i = 0; i < nodes.length - 1; i++) {
      topLevelConnections.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        label: 'related to'
      });
    }
  }
  
  return {
    metadata: {
      title: `Dynamic Mindmap (${maxLevels} levels)`,
      description: `A dynamically generated mindmap with up to ${maxLevels} levels`,
      version: "1.0.0",
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    },
    nodes,
    topLevelConnections,
    settings: {
      defaultColors: {
        level0: '#3B82F6',
        level1: '#60A5FA',
        level2: '#93C5FD',
        level3: '#BFDBFE',
        level4: '#93C5FD',
        level5: '#60A5FA',
        level6: '#3B82F6',
        level7: '#2563EB',
        level8: '#1D4ED8'
      },
      layout: {
        nodeSpacing: 200,
        levelSpacing: 150
      }
    }
  };
};