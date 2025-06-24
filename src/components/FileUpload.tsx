import React, { useState, useRef, ChangeEvent, useCallback, useEffect } from 'react';
import { Upload, FileText, X, File, FileTextIcon, FileType2, UploadCloud, Check } from 'lucide-react';
import { uploadFile } from '../services/api';
import { handleApiError } from '../services/api';

interface FileUploadProps {
  onUploadSuccess?: (fileId: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  compact?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onError,
  accept = '.txt,.pdf',
  maxSizeMB = 5,
  compact = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout>();

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const validateFile = useCallback((fileToValidate: File): { valid: boolean; error?: string } => {
    // Check file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(fileToValidate.type) && !fileToValidate.name.match(/\.(pdf|txt)$/i)) {
      return { valid: false, error: 'Only PDF and text files are allowed' };
    }

    // Check file size (default 5MB)
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (fileToValidate.size > maxSize) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    return { valid: true };
  }, [maxSizeMB]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validation = validateFile(selectedFile);
      
      if (validation.valid) {
        setFile(selectedFile);
        if (compact) {
          handleUpload(selectedFile);
        }
      } else if (onError) {
        onError(validation.error || 'Invalid file');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validation = validateFile(droppedFile);
      
      if (validation.valid) {
        setFile(droppedFile);
        if (compact) {
          handleUpload(droppedFile);
        }
      } else if (onError) {
        onError(validation.error || 'Invalid file');
      }
    }
  };

  const handleUpload = async (fileToUpload?: File) => {
    const uploadFileObj = fileToUpload || file;
    if (!uploadFileObj) return;

    setIsUploading(true);
    setUploadSuccess(false);
    
    try {
      const result = await uploadFile(uploadFileObj);
      setUploadSuccess(true);
      
      if (onUploadSuccess) {
        onUploadSuccess(result.fileId);
      }
      
      // Reset success state and clear file after animation completes
      successTimeoutRef.current = setTimeout(() => {
        setFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      if (onError) {
        onError(errorMessage);
      }
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            p-2 rounded-md cursor-pointer transition-colors duration-200
            ${isUploading 
              ? 'text-gray-400 cursor-wait' 
              : uploadSuccess 
                ? 'text-green-500' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          title="Upload file"
        >
          {isUploading ? (
            <div className="animate-spin">
              <UploadCloud className="w-4 h-4" />
            </div>
          ) : uploadSuccess ? (
            <div className="relative">
              <Check className="w-4 h-4" />
              <span className="absolute inset-0 bg-green-500 rounded-full opacity-0 animate-ping"></span>
            </div>
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'}
          ${uploadSuccess ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center">
          <div className="flex justify-center mb-2">
            {uploadSuccess ? (
              <div className="relative">
                <Check className="w-12 h-12 text-green-500" />
                <span className="absolute inset-0 bg-green-500 rounded-full opacity-0 animate-ping"></span>
              </div>
            ) : isUploading ? (
              <div className="animate-spin">
                <UploadCloud className="w-12 h-12 text-blue-500" />
              </div>
            ) : (
              <UploadCloud className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          {uploadSuccess ? (
            <>
              <h3 className="text-lg font-medium text-green-700 dark:text-green-400 mb-1">Upload Successful!</h3>
              <p className="text-sm text-green-600 dark:text-green-300">Your file has been uploaded successfully.</p>
            </>
          ) : isUploading ? (
            <>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">Uploading...</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we process your file.</p>
            </>
          ) : file ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">Drag and drop files here</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse files</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Supported formats: PDF, TXT (Max {maxSizeMB}MB)</p>
            </>
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default FileUpload;