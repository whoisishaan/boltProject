import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, FileText, ChevronRight, X, Sparkles, AlertCircle, Loader2, Upload, AlertTriangle, Check } from 'lucide-react';
import { MindMapConfig } from '../types/mindmap';
import { useTheme } from '../contexts/ThemeContext';
import { mindmapApi, MindmapListItem, handleApiError, uploadFile } from '../services/api';
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
  const [inputText, setInputText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout>();

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

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

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|txt)$/i)) {
      setError('Only PDF and text files are allowed');
      return;
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use the existing uploadFile function from the API service
      const result = await uploadFile(file);
      
      // Show success message
      alert(`File "${file.name}" uploaded successfully!`);
      
      // Refresh the mindmap list
      fetchMindmapsList();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(handleApiError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      // Reset the input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleProcessClick = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: inputText,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.error || 'Text upload failed');
      }

      const result = await response.json();
      
      // Show success state
      setUploadSuccess(true);
      
      // Clear the input
      setInputText('');
      
      // Reset success state after 2 seconds
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error processing text:', err);
      setError(handleApiError(err));
    } finally {
      setIsProcessing(false);
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
      <div className="fixed top-6 left-6 bottom-6 w-60 z-50 flex flex-col space-y-4 pointer-events-none">
        {/* Header Section */}
        <div className={`
          rounded-2xl border shadow-2xl p-2 pointer-events-auto transition-all duration-300 mb-3
          ${isDark 
            ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-xl border-white/20'
          }
        `}>
          <div className="flex items-center justify-between">
            <h2 className={`
              text-sm font-medium px-2 py-1
              ${isDark ? 'text-gray-200' : 'text-gray-800'}
            `}>
              Mindmaps
            </h2>
            <button
              onClick={() => setShowFileUpload(true)}
              className={`
                p-1.5 rounded-lg text-xs font-medium
                ${isDark
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              <Upload size={14} className="w-3.5 h-3.5" />
            </button>
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
          rounded-2xl border shadow-2xl p-2 pointer-events-auto transition-all duration-300
          ${isDark 
            ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-xl border-white/20'
          }
        `}>
          <div className="relative">
            <div className={`
              relative backdrop-blur-md rounded-xl border transition-colors duration-300 flex items-center
              ${isDark 
                ? 'bg-gray-700/60 border-gray-600/30' 
                : 'bg-white/60 border-white/30'
              }
            `}>
              <Search className={`
                ml-3 w-4 h-4 flex-shrink-0
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`
                  w-full px-3 py-2 bg-transparent outline-none text-sm transition-colors duration-300
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
          scrollbar-thin ${isDark 
            ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800/50' 
            : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100/50'
          } scrollbar-thumb-rounded-full
        `}>
          <div className="h-full overflow-y-auto p-2">
            <div className="space-y-1">
              {listLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className={`
                    w-5 h-5 animate-spin
                    ${isDark ? 'text-blue-400' : 'text-blue-600'}
                  `} />
                </div>
              ) : filteredMindmaps.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className={`
                    w-6 h-6 mx-auto mb-1
                    ${isDark ? 'text-gray-500' : 'text-gray-400'}
                  `} />
                  <p className={`
                    text-xs transition-colors duration-300
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    {availableMindmaps.length === 0 ? 'No mindmaps' : 'No results'}
                  </p>
                </div>
              ) : (
                filteredMindmaps.map((mindmap) => (
                  <div
                    key={mindmap.id}
                    onClick={() => loadMindmap(mindmap)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer
                    ${currentMindmap === mindmap.id
                      ? isDark
                        ? 'bg-blue-900/50 text-white'
                        : 'bg-blue-100 text-blue-800'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700/60'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${loading === mindmap.id ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{mindmap.title}</span>
                      {loading === mindmap.id && (
                        <Loader2 className="w-3.5 h-3.5 ml-2 animate-spin flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Input Field Card */}
        <div 
          ref={dropAreaRef}
          className={`
            rounded-2xl border-2 shadow-2xl p-2 pointer-events-auto transition-all duration-300 mt-3
            ${isDark 
              ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-xl border-white/20'
            }
            ${isDragging ? (isDark ? 'border-blue-500/70 bg-gray-700/80' : 'border-blue-500/70 bg-gray-100/90') : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your text or drop a file here..."
                className={`
                  w-full px-2.5 py-1 text-xs rounded-lg border bg-transparent outline-none
                  resize-none min-h-[50px] focus:ring-1 focus:ring-offset-1
                  ${isDragging ? 'border-dashed' : ''}
                  ${isDark 
                    ? 'border-gray-600/50 text-gray-200 placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/30' 
                    : 'border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500/70 focus:ring-blue-500/20'
                  }
                `}
                rows={2}
              />
              <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    p-0.5 rounded transition-colors text-xs
                    ${isDark 
                      ? 'text-gray-400 hover:bg-gray-700/60 hover:text-gray-200' 
                      : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-700'
                    }
                  `}
                  title="Upload file"
                >
                  <Upload size={12} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf"
                  onChange={handleFileInputChange}
                />
                <button
                  type="button"
                  onClick={handleProcessClick}
                  disabled={!inputText.trim() || isProcessing}
                  className={`
                    px-1.5 py-0.5 text-xs rounded font-medium transition-colors flex items-center justify-center min-w-[60px]
                    ${!inputText.trim() || isProcessing
                      ? isDark 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : uploadSuccess
                      ? 'bg-green-500 text-white'
                      : isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    }
                  `}
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin h-3 w-3" />
                  ) : uploadSuccess ? (
                    <Check className="h-3 w-3" />
                  ) : 'Process'}
                </button>
              </div>
            </div>
            {isDragging && (
              <p className={`text-[10px] text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Drop file to upload
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;