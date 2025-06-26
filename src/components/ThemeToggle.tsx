import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed top-6 right-20 z-50 p-2 rounded-xl border transition-all duration-300 group
        ${isDark 
          ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:bg-gray-700/90' 
          : 'bg-white/90 backdrop-blur-xl border-white/20 hover:bg-white/95'
        }
        shadow-lg hover:shadow-xl active:scale-95
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isDark 
          ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10' 
          : 'bg-gradient-to-br from-orange-500/5 to-yellow-500/5'
        }
      `}></div>
      
      <div className="relative">
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
        )}
      </div>
      
      {/* Subtle glow effect */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300
        ${isDark 
          ? 'shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
          : 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
        }
      `}></div>
    </button>
  );
};

export default ThemeToggle;