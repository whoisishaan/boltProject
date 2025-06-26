import React from 'react';
import { Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarToggleProps {
  onClick: () => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ onClick }) => {
  const { isDark } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`
        fixed top-6 left-6 z-30 p-2 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 group
        ${isDark 
          ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:bg-gray-700/95' 
          : 'bg-white/90 backdrop-blur-xl border-white/20 hover:bg-white/95'
        }
      `}
      title="Open Mindmaps"
    >
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isDark 
          ? 'bg-gradient-to-br from-blue-500/5 to-purple-500/5' 
          : 'bg-gradient-to-br from-blue-500/5 to-purple-500/5'
        }
      `}></div>
      <Menu className={`
        relative w-5 h-5 transition-colors duration-200
        ${isDark 
          ? 'text-gray-300 group-hover:text-gray-100' 
          : 'text-gray-700 group-hover:text-gray-900'
        }
      `} />
    </button>
  );
};

export default SidebarToggle;