import React, { useState, useEffect } from 'react';
import { Search, FileText, ChevronRight, X, Sparkles, AlertCircle, Loader2, Upload } from 'lucide-react';
import { MindMapConfig } from '../types/mindmap';
import { useTheme } from '../contexts/ThemeContext';
import { mindmapApi, MindmapListItem, handleApiError } from '../services/api';
import FileUpload from './FileUpload';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onMindmapSelect: (config: MindMapConfig) => void;
  currentMindmap?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onMindmapSelect, currentMindmap }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [availableMindmaps, setAvailableMindmaps] = useState<MindmapListItem[]>([]);
  const [filteredMindmaps, setFilteredMindmaps] = useState<MindmapListItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Fetch mindmaps list on component mount
  useEffect(() => {
    fetchMindmapsList();
  }, []);

  // Filter mindmaps based on search term
  useEffect(() => {
    const filtered = availableMindmaps.filter(mindmap => {
      const searchLower = searchTerm.toLowerCase();
      return (
        mindmap.title?.toLowerCase().includes(searchLower) ||
        mindmap.description?.toLowerCase().includes(searchLower) ||
        (mindmap.category?.toLowerCase() || '').includes(searchLower)
      );
    });
    setFilteredMindmaps(filtered);
  }, [searchTerm, availableMindmaps]);

  const fetchMindmapsList = async () => {
    setListLoading(true);
    setError(null);
    
    try {
      const mindmaps = await mindmapApi.getAllMindmaps();
      setAvailableMindmaps(mindmaps);
      console.log(`✅ Loaded ${mindmaps.length} mindmaps from database`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('❌ Failed to fetch mindmaps:', errorMessage);
    } finally {
      setListLoading(false);
    }
  };

  const loadMindmap = async (mindmap: MindmapListItem) => {
    setLoading(mindmap.id);
    setError(null);
    
    try {
      console.log(`🔄 Loading mindmap: ${mindmap.title} (ID: ${mindmap.id})`);
      const config: MindMapConfig = await mindmapApi.getMindmapById(mindmap.id);
      
      console.log(`✅ Successfully loaded: ${config.metadata.title}`);
      onMindmapSelect(config);
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(`Failed to load ${mindmap.title}: ${errorMessage}`);
      console.error('❌ Failed to load mindmap:', errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const getCategoryGradient = (category: string) => {
    const gradients = {
      'Programming': 'from-blue-500/10 to-cyan-500/10',
      'Computer Science': 'from-purple-500/10 to-pink-500/10',
      'Database': 'from-green-500/10 to-emerald-500/10',
      'Network': 'from-red-500/10 to-orange-500/10',
      'System': 'from-orange-500/10 to-yellow-500/10',
      'General': 'from-gray-500/10 to-slate-500/10'
    };
    return gradients[category as keyof typeof gradients] || gradients.General;
  };

  const getCategoryAccent = (category: string) => {
    const accents = {
      'Programming': isDark ? 'text-blue-400' : 'text-blue-600',
      'Computer Science': isDark ? 'text-purple-400' : 'text-purple-600',
      'Database': isDark ? 'text-green-400' : 'text-green-600',
      'Network': isDark ? 'text-red-400' : 'text-red-600',
      'System': isDark ? 'text-orange-400' : 'text-orange-600',
      'General': isDark ? 'text-gray-400' : 'text-gray-600'
    };
    return accents[category as keyof typeof accents] || accents.General;
  };

  const handleUploadSuccess = async (fileId: string) => {
    try {
      // Let the success animation complete before refreshing the list
      setTimeout(async () => {
        // Refresh the mindmaps list to show the newly uploaded file
        await fetchMindmapsList();
        
        // Optional: Automatically load the newly uploaded mindmap
        const newMindmap = availableMindmaps.find(m => m.id === fileId);
        if (newMindmap) {
          const config = await mindmapApi.getMindmapById(fileId);
          onMindmapSelect(config);
        }
        
        // Hide the upload section after everything is done
        setShowFileUpload(false);
      }, 2000); // Wait for the success animation to complete
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(`Failed to process uploaded file: ${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm z-40 transition-all duration-300 ${
          isDark ? 'bg-black/40' : 'bg-black/20'
        }`}
        onClick={onClose}
      />
      
      {/* Floating Sidebar Content */}
      <div className="fixed top-6 left-6 bottom-6 w-80 z-50 flex flex-col space-y-4 pointer-events-none">
        {/* Header Card with Upload Button */}
        <div className={`
          rounded-2xl border shadow-2xl p-6 pointer-events-auto transition-all duration-300
          ${isDark 
            ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-xl border-white/20'
          }
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                p-2 rounded-xl transition-colors duration-300
                ${isDark 
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
                  : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                }
              `}>
                <Sparkles className={`
                  w-5 h-5 transition-colors duration-300
                  ${isDark ? 'text-blue-400' : 'text-blue-600'}
                `} />
              </div>
              <h2 className={`
                text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300
                ${isDark 
                  ? 'from-gray-100 to-gray-300' 
                  : 'from-gray-800 to-gray-600'
                }
              `}>
                Mindmaps
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFileUpload(!showFileUpload);
                }}
                className={`p-1.5 rounded-md transition-colors ${
                  showFileUpload 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="Upload file"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-xl transition-all duration-200 group
                  ${isDark 
                    ? 'hover:bg-gray-700/50' 
                    : 'hover:bg-gray-100/50'
                  }
                `}
              >
                <X className={`
                  w-5 h-5 transition-colors duration-200
                  ${isDark 
                    ? 'text-gray-400 group-hover:text-gray-200' 
                    : 'text-gray-600 group-hover:text-gray-800'
                  }
                `} />
              </button>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        {showFileUpload && (
          <div className={`
            rounded-2xl border shadow-2xl p-4 pointer-events-auto transition-all duration-300
            ${isDark 
              ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-xl border-white/20'
            }
          `}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`
                text-sm font-medium transition-colors duration-300
                ${isDark ? 'text-gray-200' : 'text-gray-700'}
              `}>
                Upload Document
              </h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onError={setError}
              accept=".txt,.pdf"
              maxSizeMB={5}
            />
          </div>
        )}

        {/* Search Card */}
        <div className={`
          rounded-2xl border shadow-2xl p-4 pointer-events-auto transition-all duration-300
          ${isDark 
            ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-xl border-white/20'
          }
        `}>
          <div className="relative group">
            <div className={`
              absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              ${isDark 
                ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5' 
                : 'bg-gradient-to-r from-blue-500/5 to-purple-500/5'
              }
            `}></div>
            <div className={`
              relative backdrop-blur-md rounded-xl border transition-colors duration-300
              ${isDark 
                ? 'bg-gray-700/60 border-gray-600/30' 
                : 'bg-white/60 border-white/30'
              }
            `}>
              <Search className={`
                absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `} />
              <input
                type="text"
                placeholder="Search mindmaps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`
                  w-full pl-12 pr-4 py-3 bg-transparent outline-none font-medium transition-colors duration-300
                  ${isDark 
                    ? 'placeholder-gray-400 text-gray-200' 
                    : 'placeholder-gray-500 text-gray-800'
                  }
                `}
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`
            rounded-2xl border shadow-2xl p-4 pointer-events-auto transition-all duration-300
            ${isDark 
              ? 'bg-red-900/20 backdrop-blur-xl border-red-700/50' 
              : 'bg-red-50/90 backdrop-blur-xl border-red-200/50'
            }
          `}>
            <div className="flex items-center space-x-3">
              <AlertCircle className={`
                w-5 h-5 flex-shrink-0
                ${isDark ? 'text-red-400' : 'text-red-600'}
              `} />
              <div>
                <p className={`
                  text-sm font-medium
                  ${isDark ? 'text-red-300' : 'text-red-800'}
                `}>
                  Connection Error
                </p>
                <p className={`
                  text-xs mt-1
                  ${isDark ? 'text-red-400' : 'text-red-600'}
                `}>
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={fetchMindmapsList}
              className={`
                mt-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${isDark 
                  ? 'bg-red-800/50 text-red-200 hover:bg-red-700/50' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                }
              `}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Mindmap List Card */}
        <div className={`
          rounded-2xl border shadow-2xl flex-1 min-h-0 pointer-events-auto transition-all duration-300
          ${isDark 
            ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-xl border-white/20'
          }
        `}>
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-3">
              {listLoading ? (
                <div className="text-center py-12">
                  <div className={`
                    p-4 rounded-2xl inline-block mb-4 transition-colors duration-300
                    ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'}
                  `}>
                    <Loader2 className={`
                      w-12 h-12 animate-spin
                      ${isDark ? 'text-blue-400' : 'text-blue-600'}
                    `} />
                  </div>
                  <p className={`
                    font-medium transition-colors duration-300
                    ${isDark ? 'text-gray-300' : 'text-gray-600'}
                  `}>Loading mindmaps...</p>
                  <p className={`
                    text-sm mt-1 transition-colors duration-300
                    ${isDark ? 'text-gray-500' : 'text-gray-500'}
                  `}>Connecting to database</p>
                </div>
              ) : filteredMindmaps.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`
                    p-4 rounded-2xl inline-block mb-4 transition-colors duration-300
                    ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'}
                  `}>
                    <FileText className={`
                      w-12 h-12
                      ${isDark ? 'text-gray-500' : 'text-gray-400'}
                    `} />
                  </div>
                  <p className={`
                    font-medium transition-colors duration-300
                    ${isDark ? 'text-gray-300' : 'text-gray-600'}
                  `}>
                    {availableMindmaps.length === 0 ? 'No mindmaps available' : 'No mindmaps found'}
                  </p>
                  <p className={`
                    text-sm mt-1 transition-colors duration-300
                    ${isDark ? 'text-gray-500' : 'text-gray-500'}
                  `}>
                    {availableMindmaps.length === 0 ? 'Check your database connection' : 'Try adjusting your search'}
                  </p>
                </div>
              ) : (
                filteredMindmaps.map((mindmap) => (
                  <div
                    key={mindmap.id}
                    onClick={() => loadMindmap(mindmap)}
                    onMouseEnter={() => setHoveredItem(mindmap.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      group cursor-pointer relative overflow-hidden rounded-xl transition-all duration-300 transform
                      ${currentMindmap === mindmap.id 
                        ? 'scale-[1.02] shadow-lg' 
                        : 'hover:scale-[1.01] hover:shadow-md'
                      }
                      ${loading === mindmap.id ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {/* Dynamic Background */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-br ${getCategoryGradient(mindmap.category)}
                      ${hoveredItem === mindmap.id ? 'opacity-100' : 'opacity-60'}
                      transition-opacity duration-300
                    `}></div>
                    
                    {/* Card Content */}
                    <div className={`
                      relative p-4 backdrop-blur-sm border transition-all duration-300
                      ${currentMindmap === mindmap.id 
                        ? `${isDark ? 'border-gray-600/40 bg-gray-700/70' : 'border-white/40 bg-white/70'}` 
                        : `${isDark ? 'border-gray-600/20 hover:border-gray-600/30 hover:bg-gray-700/65' : 'border-white/20 hover:border-white/30 hover:bg-white/65'}`
                      }
                    `}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`
                              p-1.5 rounded-lg border transition-colors duration-300
                              ${isDark 
                                ? 'bg-gray-600/50 border-gray-500/30' 
                                : 'bg-white/50 border-white/30'
                              }
                            `}>
                              <FileText className={`
                                w-3.5 h-3.5
                                ${isDark ? 'text-gray-300' : 'text-gray-600'}
                              `} />
                            </div>
                            <h3 className={`
                              font-bold text-sm truncate transition-colors duration-300
                              ${isDark ? 'text-gray-200' : 'text-gray-800'}
                            `}>
                              {mindmap.title}
                            </h3>
                          </div>
                          
                          <p className={`
                            text-xs mb-2 line-clamp-2 leading-relaxed transition-colors duration-300
                            ${isDark ? 'text-gray-400' : 'text-gray-700'}
                          `}>
                            {mindmap.description}
                          </p>
                          
                          <div className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border transition-colors duration-300
                            ${isDark 
                              ? 'bg-gray-600/50 border-gray-500/30' 
                              : 'bg-white/50 border-white/30'
                            }
                            ${getCategoryAccent(mindmap.category)}
                          `}>
                            {mindmap.category}
                          </div>
                        </div>
                        
                        <div className="ml-3 flex-shrink-0">
                          {loading === mindmap.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full" />
                          ) : (
                            <div className={`
                              p-1.5 rounded-lg border group-hover:translate-x-0.5 transition-all duration-200
                              ${isDark 
                                ? 'bg-gray-600/30 border-gray-500/20' 
                                : 'bg-white/30 border-white/20'
                              }
                            `}>
                              <ChevronRight className={`
                                w-3.5 h-3.5
                                ${isDark ? 'text-gray-300' : 'text-gray-600'}
                              `} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Card */}
        <div className={`
          rounded-2xl border shadow-2xl p-4 pointer-events-auto transition-all duration-300
          ${isDark 
            ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-xl border-white/20'
          }
        `}>
          <div className="text-center">
            <p className={`
              text-xs font-medium transition-colors duration-300
              ${isDark ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {listLoading ? 'Loading...' : `${filteredMindmaps.length} mindmap${filteredMindmaps.length !== 1 ? 's' : ''} available`}
            </p>
            {!listLoading && availableMindmaps.length > 0 && (
              <p className={`
                text-xs mt-1 transition-colors duration-300
                ${isDark ? 'text-gray-500' : 'text-gray-500'}
              `}>
                Loaded from database
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;