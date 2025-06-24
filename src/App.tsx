import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import MindMapCanvas from './components/MindMapCanvas';
import Sidebar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';
import { MindMapConfig } from './types/mindmap';
import { mindmapApi, handleApiError } from './services/api';

function App() {
  const [currentConfig, setCurrentConfig] = useState<MindMapConfig | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMindmapId, setCurrentMindmapId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial mindmap on app start
  useEffect(() => {
    loadInitialMindmap();
  }, []);

  const loadInitialMindmap = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load the first available mindmap
      const mindmaps = await mindmapApi.getAllMindmaps();
      
      if (mindmaps.length > 0) {
        const firstMindmap = mindmaps[0];
        const config = await mindmapApi.getMindmapById(firstMindmap.id);
        setCurrentConfig(config);
        setCurrentMindmapId(firstMindmap.id);
        console.log(`✅ Loaded initial mindmap: ${config.metadata.title}`);
      } else {
        // No mindmaps available - show empty state
        setError('No mindmaps available in database');
        console.log('⚠️ No mindmaps found in database');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('❌ Failed to load initial mindmap:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMindmapSelect = (config: MindMapConfig) => {
    setCurrentConfig(config);
    setCurrentMindmapId(config.metadata.title.toLowerCase().replace(/\s+/g, '-'));
    setSidebarOpen(false); // Close sidebar on mobile after selection
    setError(null); // Clear any previous errors
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Loading state
  if (loading) {
    return (
      <ThemeProvider>
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Loading Mindmaps
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connecting to database...
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Error state
  if (error && !currentConfig) {
    return (
      <ThemeProvider>
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              <p>Make sure your backend server is running:</p>
              <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                cd server && npm run dev
              </code>
            </div>
            <button
              onClick={loadInitialMindmap}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Main Content - Full Screen Mindmap Canvas */}
        {currentConfig && (
          <MindMapCanvas 
            data={currentConfig.nodes} 
            topLevelConnections={currentConfig.topLevelConnections}
            title={currentConfig.metadata.title}
            description={currentConfig.metadata.description}
          />
        )}
        
        {/* Floating Sidebar Toggle */}
        <SidebarToggle onClick={toggleSidebar} />
        
        {/* Floating Sidebar Content */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onMindmapSelect={handleMindmapSelect}
          currentMindmap={currentMindmapId}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;