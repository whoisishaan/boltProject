import { MindMapNode, TopLevelConnection } from '../types/mindmap';

export const mindmapData: MindMapNode[] = [
  {
    id: 'ml',
    title: 'Machine Learning',
    level: 0,
    position: { x: 0, y: 0 },
    color: '#3B82F6',
    children: [
      {
        id: 'ml-regression',
        title: 'Regression',
        level: 1,
        position: { x: -200, y: -100 },
        parent: 'ml',
        color: '#60A5FA',
        relationshipLabel: 'includes',
        children: [
          {
            id: 'ml-regression-linear',
            title: 'Linear Regression',
            level: 2,
            position: { x: -400, y: -250 }, // Increased distance significantly
            parent: 'ml-regression',
            color: '#93C5FD',
            relationshipLabel: 'type of'
          },
          {
            id: 'ml-regression-poly',
            title: 'Polynomial Regression',
            level: 2,
            position: { x: 0, y: -250 }, // Increased distance significantly
            parent: 'ml-regression',
            color: '#93C5FD',
            relationshipLabel: 'type of'
          }
        ]
      },
      {
        id: 'ml-classification',
        title: 'Classification',
        level: 1,
        position: { x: 200, y: -100 },
        parent: 'ml',
        color: '#60A5FA',
        relationshipLabel: 'includes',
        children: [
          {
            id: 'ml-classification-svm',
            title: 'Support Vector Machine',
            level: 2,
            position: { x: 0, y: -250 }, // Increased distance significantly
            parent: 'ml-classification',
            color: '#93C5FD',
            relationshipLabel: 'algorithm'
          },
          {
            id: 'ml-classification-tree',
            title: 'Decision Trees',
            level: 2,
            position: { x: 400, y: -250 }, // Increased distance significantly
            parent: 'ml-classification',
            color: '#93C5FD',
            relationshipLabel: 'algorithm'
          }
        ]
      },
      {
        id: 'ml-metrics',
        title: 'Evaluation Metrics',
        level: 1,
        position: { x: 0, y: 150 },
        parent: 'ml',
        color: '#60A5FA',
        relationshipLabel: 'uses',
        children: [
          {
            id: 'ml-metrics-confusion',
            title: 'Confusion Matrix',
            level: 2,
            position: { x: -200, y: 350 }, // Increased distance significantly
            parent: 'ml-metrics',
            color: '#93C5FD',
            relationshipLabel: 'method'
          },
          {
            id: 'ml-metrics-roc',
            title: 'ROC Curve',
            level: 2,
            position: { x: 200, y: 350 }, // Increased distance significantly
            parent: 'ml-metrics',
            color: '#93C5FD',
            relationshipLabel: 'method'
          }
        ]
      }
    ]
  },
  {
    id: 'genai',
    title: 'Generative AI',
    level: 0,
    position: { x: 400, y: 300 },
    color: '#10B981',
    children: [
      {
        id: 'genai-llm',
        title: 'Large Language Models',
        level: 1,
        position: { x: 500, y: 150 },
        parent: 'genai',
        color: '#34D399',
        relationshipLabel: 'powered by',
        children: [
          {
            id: 'genai-llm-transformer',
            title: 'Transformers',
            level: 2,
            position: { x: 200, y: 500 }, // Increased distance significantly
            parent: 'genai-llm',
            color: '#6EE7B7',
            relationshipLabel: 'based on'
          },
          {
            id: 'genai-llm-attention',
            title: 'Attention Mechanism',
            level: 2,
            position: { x: 800, y: -50 }, // Increased distance significantly
            parent: 'genai-llm',
            color: '#6EE7B7',
            relationshipLabel: 'uses'
          }
        ]
      },
      {
        id: 'genai-diffusion',
        title: 'Diffusion Models',
        level: 1,
        position: { x: 300, y: 400 },
        parent: 'genai',
        color: '#34D399',
        relationshipLabel: 'includes',
        children: [
          {
            id: 'genai-diffusion-stable',
            title: 'Stable Diffusion',
            level: 2,
            position: { x: 500, y: 600 }, // Increased distance significantly
            parent: 'genai-diffusion',
            color: '#6EE7B7',
            relationshipLabel: 'example'
          },
          {
            id: 'genai-diffusion-dalle',
            title: 'DALL-E',
            level: 2,
            position: { x: 100, y: 600 }, // Increased distance significantly
            parent: 'genai-diffusion',
            color: '#6EE7B7',
            relationshipLabel: 'example'
          }
        ]
      }
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science',
    level: 0,
    position: { x: -400, y: 300 },
    color: '#F59E0B',
    children: [
      {
        id: 'ds-analysis',
        title: 'Data Analysis',
        level: 1,
        position: { x: -500, y: 200 },
        parent: 'data-science',
        color: '#FBBF24',
        relationshipLabel: 'involves',
        children: [
          {
            id: 'ds-analysis-pandas',
            title: 'Pandas',
            level: 2,
            position: { x: -750, y: 0 }, // Increased distance significantly
            parent: 'ds-analysis',
            color: '#FCD34D',
            relationshipLabel: 'tool'
          },
          {
            id: 'ds-analysis-numpy',
            title: 'NumPy',
            level: 2,
            position: { x: -250, y: 0 }, // Increased distance significantly
            parent: 'ds-analysis',
            color: '#FCD34D',
            relationshipLabel: 'tool'
          }
        ]
      },
      {
        id: 'ds-viz',
        title: 'Data Visualization',
        level: 1,
        position: { x: -300, y: 400 },
        parent: 'data-science',
        color: '#FBBF24',
        relationshipLabel: 'includes',
        children: [
          {
            id: 'ds-viz-matplotlib',
            title: 'Matplotlib',
            level: 2,
            position: { x: -550, y: 650 }, // Increased distance significantly
            parent: 'ds-viz',
            color: '#FCD34D',
            relationshipLabel: 'library'
          },
          {
            id: 'ds-viz-seaborn',
            title: 'Seaborn',
            level: 2,
            position: { x: -50, y: 650 }, // Increased distance significantly
            parent: 'ds-viz',
            color: '#FCD34D',
            relationshipLabel: 'library'
          }
        ]
      }
    ]
  }
];

// Define connections between top-level nodes
export const topLevelConnections: TopLevelConnection[] = [
  {
    from: 'ml',
    to: 'genai',
    label: 'evolves into'
  },
  {
    from: 'data-science',
    to: 'ml',
    label: 'enables'
  },
  {
    from: 'data-science',
    to: 'genai',
    label: 'supports'
  }
];