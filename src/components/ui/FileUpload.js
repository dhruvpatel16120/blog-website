'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  CloudArrowUpIcon, 
  XMarkIcon, 
  DocumentIcon,
  PhotoIcon,
  TrashIcon 
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
  userId = null
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
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

    setUploading(true);
    setErrors([]);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        // Create preview for images
        const preview = showPreview && isImageFile(file) ? await createFilePreview(file) : null;
        
        // Upload file
        const result = await uploadFile(file, category, userId);
        
        return {
          ...result,
          preview,
          originalFile: file
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
    }
  }, [files, maxFiles, category, userId, onFileUpload, acceptedTypes, showPreview]);

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
    
    // Delete file from server if it has a URL
    if (fileToRemove.url) {
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
            {category === 'avatars' && 'PNG, JPG, WebP up to 2MB'}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Uploading files...</span>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800"
              >
                {/* File Preview */}
                {showPreview && file.preview && (
                  <div className="aspect-square mb-2 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={file.preview}
                      alt={file.originalName}
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
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.fileSize)}
                  </p>
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
