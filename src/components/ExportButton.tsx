import React from 'react';
import { Download } from 'lucide-react';
import { MindMapConfig } from '../types/mindmap';

interface ExportButtonProps {
  config: MindMapConfig;
}

const ExportButton: React.FC<ExportButtonProps> = ({ config }) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.metadata.title.replace(/\s+/g, '_').toLowerCase()}_mindmap.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      <Download className="w-5 h-5" />
      <span className="font-medium">Export JSON</span>
    </button>
  );
};

export default ExportButton;