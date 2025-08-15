'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  CloudArrowUpIcon, 
  XMarkIcon, 
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  uploadFile, 
  deleteFile, 
  validateFile, 
  getFileTypeConfig, 
  formatFileSize, 
  isImageFile,
  createFilePreview,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDrop
} from '@/lib/file-upload';

export default function FileUpload({
  onFileUpload,
  onFileRemove,
  category = 'images',
  multiple = false,
  maxFiles = 5,
  className = '',
  disabled = false,
  showPreview = true,
  acceptedTypes = null,
  userId = null,
  showProgress = true,
  autoUpload = true,
  showCategorySelect = true,
  onCategoryChange = null
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(category);
  const fileInputRef = useRef(null);

  const validateAndUpload = useCallback(async (fileList) => {
    const newFiles = Array.from(fileList);
    const validFiles = [];
    const newErrors = [];

    // Check file count limit
    if (files.length + newFiles.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      setErrors(newErrors);
      return;
    }

    for (const file of newFiles) {
      // Get file type configuration
      const fileConfig = getFileTypeConfig(file);
      
      // Validate file
      const validation = validateFile(file, fileConfig);
      if (!validation.valid) {
        newErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Check accepted types if specified
      if (acceptedTypes && !acceptedTypes.includes(file.type)) {
        newErrors.push(`${file.name}: File type not accepted`);
        continue;
      }

      validFiles.push(file);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    if (validFiles.length === 0) return;

    if (autoUpload) {
      await uploadFiles(validFiles);
    } else {
      // Just add to files array without uploading
      const fileObjects = validFiles.map(file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: null,
        status: 'pending'
      }));
      setFiles(prev => [...prev, ...fileObjects]);
    }
  }, [files, maxFiles, acceptedTypes, autoUpload]);

  const uploadFiles = async (filesToUpload) => {
    setUploading(true);
    setErrors([]);

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        // Create preview for images
        const preview = showPreview && isImageFile(file) ? await createFilePreview(file) : null;
        
        // Update progress
        if (showProgress) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        }
        
        // Upload file
        const result = await uploadFile(file, selectedCategory, userId);
        
        // Update progress to 100%
        if (showProgress) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        }
        
        return {
          ...result,
          preview,
          originalFile: file,
          status: 'uploaded'
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      const updatedFiles = [...files, ...uploadedFiles];
      setFiles(updatedFiles);
      
      // Call parent callback
      if (onFileUpload) {
        onFileUpload(uploadedFiles, updatedFiles);
      }
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleFileSelect = useCallback((e) => {
    const fileList = e.target.files;
    if (fileList.length > 0) {
      validateAndUpload(fileList);
    }
  }, [validateAndUpload]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDropEvent = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files);
    }
  }, [validateAndUpload]);

  const removeFile = useCallback(async (index) => {
    const fileToRemove = files[index];
    const updatedFiles = files.filter((_, i) => i !== index);
    
    setFiles(updatedFiles);
    
    // Call parent callback
    if (onFileRemove) {
      onFileRemove(fileToRemove, updatedFiles);
    }
    
    // Delete file from server if it has a URL and was uploaded
    if (fileToRemove.url && fileToRemove.status === 'uploaded') {
      try {
        await deleteFile(fileToRemove.url, userId);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }, [files, onFileRemove, userId]);

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const clearErrors = () => {
    setErrors([]);
  };

  const retryUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length > 0) {
      await uploadFiles(pendingFiles.map(f => f.originalFile));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        accept={acceptedTypes?.join(',')}
        disabled={disabled || uploading}
      />

      {/* Category Selection */}
      {showCategorySelect && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (onCategoryChange) {
                onCategoryChange(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={disabled || uploading}
          >
            <option value="images">Images (PNG, JPG, GIF, WebP, SVG)</option>
            <option value="documents">Documents (PDF, DOC, DOCX, TXT)</option>
                            <option value="cover-images">Cover Images (PNG, JPG, WebP)</option>
          </select>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDropEvent}
        onClick={openFileDialog}
      >
        <div className="space-y-2">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
              Click to upload
            </span>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {category === 'images' && 'PNG, JPG, GIF, WebP, SVG up to 5MB'}
            {category === 'documents' && 'PDF, DOC, DOCX, TXT up to 10MB'}
                            {category === 'cover-images' && 'PNG, JPG, WebP up to 2MB'}
          </p>
          {!autoUpload && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Files will be uploaded when you submit the form
            </p>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && showProgress && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Upload errors occurred</span>
            </div>
            <button
              onClick={clearErrors}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear
            </button>
          </div>
          {errors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          ))}
          {!autoUpload && (
            <button
              onClick={retryUpload}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Retry Upload
            </button>
          )}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Files ({files.length}/{maxFiles})
            </h4>
            {!autoUpload && (
              <button
                onClick={() => uploadFiles(files.filter(f => f.status === 'pending').map(f => f.originalFile))}
                disabled={uploading || !files.some(f => f.status === 'pending')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50"
              >
                Upload All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className={`relative group border rounded-lg p-3 bg-white dark:bg-gray-800 ${
                  file.status === 'uploaded' ? 'border-green-200 dark:border-green-800' : 'border-yellow-200 dark:border-yellow-800'
                }`}
              >
                {/* Status Indicator */}
                <div className="absolute top-1 left-1">
                  {file.status === 'uploaded' ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ClockIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>

                {/* File Preview */}
                {showPreview && file.preview && (
                  <div className="aspect-square mb-2 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={file.preview}
                      alt={file.originalName || file.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* File Icon */}
                {(!showPreview || !file.preview) && (
                  <div className="flex items-center justify-center aspect-square mb-2 rounded bg-gray-100 dark:bg-gray-700">
                    {isImageFile(file) ? (
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    ) : (
                      <DocumentIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {file.originalName || file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.fileSize || file.size)}
                  </p>
                  {file.status && (
                    <p className={`text-xs ${
                      file.status === 'uploaded' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {file.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 dark:hover:bg-red-900/40"
                  disabled={disabled || uploading}
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
