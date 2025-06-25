import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TopicHeaderProps {
  title: string;
  description?: string;
}

const TopicHeader: React.FC<TopicHeaderProps> = ({ title, description }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
      <div className={`
        rounded-lg border px-3 py-1 pointer-events-auto transition-all duration-300
        ${isDark 
          ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
          : 'bg-white/90 backdrop-blur-xl border-white/20'
        }
        shadow-2xl
      `}>
        <div className="flex items-center justify-center space-x-3">
          {/* Title */}
          <div className="text-center">
            <h1 className={`
              text-sm font-bold bg-clip-text text-transparent transition-all duration-300
              ${isDark 
                ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' 
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
              }
            `}>
              {title}
            </h1>
          </div>
          
          {/* Subtle Bottom Glow */}
          <div className={`
            absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-px
            ${isDark 
              ? 'bg-gradient-to-r from-transparent via-blue-400/20 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-blue-500/20 to-transparent'
            }
          `}></div>
        </div>
      </div>
    </div>
  );
};

export default TopicHeader;