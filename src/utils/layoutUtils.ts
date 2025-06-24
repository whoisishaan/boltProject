import { MindMapNode } from '../types/mindmap';

export interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getNodeBounds = (node: MindMapNode): CollisionBox => {
  // Calculate node dimensions based on title length
  const baseWidth = Math.max(120, node.title.length * 8 + 40);
  const baseHeight = Math.max(40, 32 + 16);
  
  // Add padding for collision detection
  const padding = 20;
  
  return {
    x: node.position.x - baseWidth / 2 - padding,
    y: node.position.y - baseHeight / 2 - padding,
    width: baseWidth + padding * 2,
    height: baseHeight + padding * 2
  };
};

export const checkCollision = (box1: CollisionBox, box2: CollisionBox): boolean => {
  return !(
    box1.x + box1.width < box2.x ||
    box2.x + box2.width < box1.x ||
    box1.y + box1.height < box2.y ||
    box2.y + box2.height < box1.y
  );
};

export const resolveCollisions = (nodes: MindMapNode[]): MindMapNode[] => {
  const resolvedNodes = [...nodes];
  const maxIterations = 10;
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let hasCollisions = false;
    
    // Group nodes by level for collision detection
    const nodesByLevel = resolvedNodes.reduce((acc, node) => {
      if (!acc[node.level]) acc[node.level] = [];
      acc[node.level].push(node);
      return acc;
    }, {} as Record<number, MindMapNode[]>);
    
    // Check collisions within each level
    Object.values(nodesByLevel).forEach(levelNodes => {
      for (let i = 0; i < levelNodes.length; i++) {
        for (let j = i + 1; j < levelNodes.length; j++) {
          const node1 = levelNodes[i];
          const node2 = levelNodes[j];
          
          const bounds1 = getNodeBounds(node1);
          const bounds2 = getNodeBounds(node2);
          
          if (checkCollision(bounds1, bounds2)) {
            hasCollisions = true;
            
            // Calculate separation vector
            const dx = node2.position.x - node1.position.x;
            const dy = node2.position.y - node1.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 1) {
              // If nodes are at the same position, separate them randomly
              const angle = Math.random() * Math.PI * 2;
              const separationDistance = 100;
              node2.position.x = node1.position.x + Math.cos(angle) * separationDistance;
              node2.position.y = node1.position.y + Math.sin(angle) * separationDistance;
            } else {
              // Calculate minimum separation distance
              const minSeparation = (bounds1.width + bounds2.width) / 2;
              const separationNeeded = minSeparation - distance + 20; // Extra padding
              
              if (separationNeeded > 0) {
                const unitX = dx / distance;
                const unitY = dy / distance;
                
                // Move both nodes apart
                const moveDistance = separationNeeded / 2;
                node1.position.x -= unitX * moveDistance;
                node1.position.y -= unitY * moveDistance;
                node2.position.x += unitX * moveDistance;
                node2.position.y += unitY * moveDistance;
              }
            }
          }
        }
      }
    });
    
    if (!hasCollisions) break;
  }
  
  return resolvedNodes;
};

export const optimizeLayout = (nodes: MindMapNode[]): MindMapNode[] => {
  // First resolve collisions
  let optimizedNodes = resolveCollisions(nodes);
  
  // Then apply force-based positioning for better distribution
  optimizedNodes = applyForceBasedLayout(optimizedNodes);
  
  return optimizedNodes;
};

const applyForceBasedLayout = (nodes: MindMapNode[]): MindMapNode[] => {
  const result = [...nodes];
  const iterations = 5;
  const repulsionStrength = 1000;
  const dampening = 0.8;
  
  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { x: number; y: number }>();
    
    // Initialize forces
    result.forEach(node => {
      forces.set(node.id, { x: 0, y: 0 });
    });
    
    // Calculate repulsion forces between nodes of the same level
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const node1 = result[i];
        const node2 = result[j];
        
        // Only apply repulsion between nodes of the same level
        if (node1.level === node2.level) {
          const dx = node2.position.x - node1.position.x;
          const dy = node2.position.y - node1.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0 && distance < 300) { // Only apply force if nodes are close
            const force = repulsionStrength / (distance * distance);
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            const force1 = forces.get(node1.id)!;
            const force2 = forces.get(node2.id)!;
            
            force1.x -= unitX * force;
            force1.y -= unitY * force;
            force2.x += unitX * force;
            force2.y += unitY * force;
          }
        }
      }
    }
    
    // Apply forces with dampening
    result.forEach(node => {
      const force = forces.get(node.id)!;
      node.position.x += force.x * dampening;
      node.position.y += force.y * dampening;
    });
  }
  
  return result;
};