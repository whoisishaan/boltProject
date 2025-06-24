import { MindMapNode, TopLevelConnection } from '../types/mindmap';

export const flattenNodes = (nodes: MindMapNode[]): MindMapNode[] => {
  const result: MindMapNode[] = [];
  
  const traverse = (nodeList: MindMapNode[]) => {
    nodeList.forEach(node => {
      result.push(node);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  
  traverse(nodes);
  return result;
};

export const getVisibleNodes = (nodes: MindMapNode[], zoom: number, focusedNode?: string): MindMapNode[] => {
  const flatNodes = flattenNodes(nodes);
  
  if (focusedNode) {
    const focused = flatNodes.find(n => n.id === focusedNode);
    if (focused) {
      // When focused on a node, show it and its children
      const result = [focused];
      if (focused.children) {
        result.push(...focused.children);
      }
      return result;
    }
  }
  
  // Calculate the maximum level to show based on zoom
  // 0-70%: level 0 only
  // 70-80%: level 0-1
  // 80-90%: level 0-2
  // and so on...
  
  // If zoom is less than or equal to 70%, only show level 0
  if (zoom <= 0.7) {
    return flatNodes.filter(node => node.level === 0);
  }
  
  // For zoom levels above 70%, calculate how many levels to show
  const maxLevel = Math.min(
    Math.floor((zoom - 0.7) * 10) + 1, // 0.7 -> 1, 0.8 -> 2, etc.
    9 // Cap at level 9
  );
  
  return flatNodes.filter(node => node.level <= maxLevel);
};

export const getNodeConnections = (nodes: MindMapNode[]): Array<{from: MindMapNode, to: MindMapNode, label?: string}> => {
  const flatNodes = flattenNodes(nodes);
  const connections: Array<{from: MindMapNode, to: MindMapNode, label?: string}> = [];
  
  flatNodes.forEach(node => {
    if (node.parent) {
      const parentNode = flatNodes.find(n => n.id === node.parent);
      if (parentNode) {
        connections.push({ 
          from: parentNode, 
          to: node,
          label: node.relationshipLabel
        });
      }
    }
  });
  
  return connections;
};

export const getTopLevelConnections = (
  nodes: MindMapNode[], 
  topLevelConnections: TopLevelConnection[]
): Array<{from: MindMapNode, to: MindMapNode, label: string}> => {
  const flatNodes = flattenNodes(nodes);
  const connections: Array<{from: MindMapNode, to: MindMapNode, label: string}> = [];
  
  topLevelConnections.forEach(conn => {
    const fromNode = flatNodes.find(n => n.id === conn.from);
    const toNode = flatNodes.find(n => n.id === conn.to);
    
    if (fromNode && toNode) {
      connections.push({
        from: fromNode,
        to: toNode,
        label: conn.label
      });
    }
  });
  
  return connections;
};

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};