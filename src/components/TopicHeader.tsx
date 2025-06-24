import React from 'react';
import { Sparkles } from 'lucide-react';
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
        rounded-2xl border px-8 py-4 pointer-events-auto transition-all duration-300
        ${isDark 
          ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
          : 'bg-white/90 backdrop-blur-xl border-white/20'
        }
        shadow-2xl
      `}>
        <div className="flex items-center justify-center space-x-3">
          {/* Animated Icon */}
          <div className="relative">
            <div className={`
              absolute inset-0 rounded-xl animate-pulse
              ${isDark 
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
                : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
              }
            `}></div>
            <div className={`
              relative p-2 rounded-xl border transition-colors duration-300
              ${isDark 
                ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-gray-600/30' 
                : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/30'
              }
            `}>
              <Sparkles className={`
                w-5 h-5 transition-colors duration-300
                ${isDark ? 'text-blue-400' : 'text-blue-600'}
              `} />
            </div>
          </div>
          
          {/* Title and Description */}
          <div className="text-center">
            <h1 className={`
              text-xl font-bold bg-clip-text text-transparent transition-all duration-300
              ${isDark 
                ? 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300' 
                : 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600'
              }
            `}>
              {title}
            </h1>
            {description && (
              <p className={`
                text-sm mt-1 font-medium opacity-80 transition-colors duration-300
                ${isDark ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {description}
              </p>
            )}
          </div>
          
          {/* Decorative Element */}
          <div className={`
            w-2 h-8 rounded-full transition-all duration-300
            ${isDark 
              ? 'bg-gradient-to-b from-blue-400/30 via-purple-400/30 to-pink-400/30' 
              : 'bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-pink-500/30'
            }
          `}></div>
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
  );
};

export default TopicHeader;