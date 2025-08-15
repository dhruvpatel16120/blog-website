'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import FileUpload from '@/components/ui/FileUpload';
import { 
  FolderIcon, 
  PhotoIcon, 
  DocumentIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { formatFileSize } from '@/lib/file-upload';

export default function FilesPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const router = useRouter();
  
  // State management
  const [files, setFiles] = useState([]);
  const [summary, setSummary] = useState({ 
    total: 0, 
    totalSize: 0, 
    images: 0, 
    documents: 0, 
    'cover-images': 0
  });
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFileDetailsModal, setShowFileDetailsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [categoryOperationLoading, setCategoryOperationLoading] = useState(false);
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [session?.user?.type, status, router]);

  // Fetch files from the server
  const fetchFiles = useCallback(async () => {
    try {
      setLoadingFiles(true);
      setErrorMessage(null);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`/api/admin/files?${queryParams}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
        if (data.stats) {
          const processedStats = {
            total: data.stats.totalFiles || 0,
            totalSize: data.stats.totalSize || 0,
            images: data.stats.categoryStats?.images?.count || 0,
            documents: data.stats.categoryStats?.documents?.count || 0,
            'cover-images': data.stats.categoryStats?.['cover-images']?.count || 0,
            unused: data.stats.unused || 0
          };
          setSummary(processedStats);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      if (error.name === 'AbortError') {
        setErrorMessage('Request timed out. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        setErrorMessage('Network error. Please check your connection and try again.');
      } else {
        setErrorMessage(`Failed to fetch files: ${error.message}`);
      }
    } finally {
      setLoadingFiles(false);
    }
  }, [filters, pagination.limit, pagination.page]);

  useEffect(() => {
    if (adminSession) {
      fetchFiles();
    }
  }, [adminSession, fetchFiles]);

  // Filter handling
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      order: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // File operations
  const handleFileUpload = (uploadedFiles, allFiles) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
    setShowUploadModal(false);
    setSuccessMessage(`${uploadedFiles.length} file(s) uploaded successfully`);
    setTimeout(() => setSuccessMessage(null), 5000);
    
    setTimeout(() => {
      fetchFiles();
    }, 1000);
  };

  const handleFileRemove = async (removedFile, remainingFiles) => {
    try {
      const response = await fetch(`/api/admin/upload?url=${encodeURIComponent(removedFile.url)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
    setFiles(prev => prev.filter(f => f.url !== removedFile.url));
        setSuccessMessage('File deleted successfully');
        setTimeout(() => setSuccessMessage(null), 5000);
        
        setTimeout(() => {
          fetchFiles();
        }, 1000);
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setErrorMessage('Failed to delete file. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedFiles.length} files? This action cannot be undone.`)) {
      try {
        const deletePromises = selectedFiles.map(fileUrl =>
          fetch(`/api/admin/upload?url=${encodeURIComponent(fileUrl)}`, {
            method: 'DELETE'
          })
        );

        await Promise.all(deletePromises);
        setFiles(prev => prev.filter(f => !selectedFiles.includes(f.url)));
        setSelectedFiles([]);
        setSuccessMessage(`${selectedFiles.length} file(s) deleted successfully`);
        setTimeout(() => setSuccessMessage(null), 5000);
        
        setTimeout(() => {
          fetchFiles();
        }, 1000);
      } catch (error) {
        console.error('Error deleting files:', error);
        setErrorMessage('Failed to delete some files. Please try again.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    }
  };

  const handleBulkArchive = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      const confirmMessage = `Are you sure you want to archive ${selectedFiles.length} file(s)?\n\nThis action will:\n- Move files to archived category\n- Files will still be accessible but marked as archived\n- Can be restored later if needed`;
      
      if (!confirm(confirmMessage)) {
        return;
      }

      const response = await fetch('/api/admin/files/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'move',
          files: selectedFiles,
          options: { newCategory: 'archived' }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const { successful, failed } = result.summary;
          
          if (successful > 0) {
            setSuccessMessage(`${successful} file(s) archived successfully`);
            if (failed > 0) {
              setSuccessMessage(prev => prev + ` (${failed} failed)`);
            }
          } else {
            setErrorMessage(`Failed to archive files: ${result.message}`);
          }
          
          setSelectedFiles([]);
          setTimeout(() => setSuccessMessage(null), 5000);
          
          setTimeout(() => {
            fetchFiles();
          }, 1000);
        } else {
          throw new Error(result.error || 'Failed to archive files');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error archiving files:', error);
      
      let errorMessage = 'Failed to archive files. Please try again.';
      if (error.message.includes('Source file not found')) {
        errorMessage = 'Some files not found on server. They may have been deleted.';
      } else if (error.message.includes('Permission denied')) {
        errorMessage = 'Permission denied. You may not have access to archive these files.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Handle bulk move operation
  const handleBulkMove = async (newCategory) => {
    if (selectedFiles.length === 0) return;
    
    try {
      if (!['images', 'documents', 'cover-images'].includes(newCategory)) {
        setErrorMessage('Invalid category selected');
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }

      const selectedFileObjects = files.filter(f => selectedFiles.includes(f.url));
      const incompatibleFiles = [];
      
      selectedFileObjects.forEach(file => {
        const isCompatible = validateFileCategoryCompatibility(file.fileType, newCategory, file.originalName);
        if (!isCompatible.isValid) {
          incompatibleFiles.push({
            name: file.originalName,
            reason: isCompatible.reason
          });
        }
      });

      if (incompatibleFiles.length > 0) {
        const errorDetails = incompatibleFiles.map(f => `- ${f.name}: ${f.reason}`).join('\n');
        setErrorMessage(`Cannot move some files to ${newCategory}:\n${errorDetails}`);
        setTimeout(() => setErrorMessage(null), 8000);
        return;
      }

      const confirmMessage = `Are you sure you want to move ${selectedFiles.length} file(s) to ${newCategory}?\n\nThis action will:\n- Move files between server directories\n- Update file URLs\n- Cannot be easily undone`;
      
      if (!confirm(confirmMessage)) {
        return;
      }

      const response = await fetch('/api/admin/files/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'move',
          files: selectedFiles,
          options: { newCategory }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const { successful, failed } = result.summary;
          
          if (successful > 0) {
            setSuccessMessage(`${successful} file(s) moved to ${newCategory} successfully`);
            if (failed > 0) {
              setSuccessMessage(prev => prev + ` (${failed} failed)`);
            }
          } else {
            setErrorMessage(`Failed to move files: ${result.message}`);
          }
          
          setSelectedFiles([]);
          setTimeout(() => setSuccessMessage(null), 5000);
          
          setTimeout(() => {
            fetchFiles();
          }, 1000);
        } else {
          throw new Error(result.error || 'Failed to move files');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error moving files:', error);
      
      let errorMessage = 'Failed to move files. Please try again.';
      if (error.message.includes('Source file not found')) {
        errorMessage = 'Some files not found on server. They may have been deleted.';
      } else if (error.message.includes('Invalid category')) {
        errorMessage = 'Invalid category selected. Please choose a valid category.';
      } else if (error.message.includes('Permission denied')) {
        errorMessage = 'Permission denied. You may not have access to move these files.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // File selection
  const toggleFileSelection = (fileUrl) => {
    setSelectedFiles(prev => 
      prev.includes(fileUrl) 
        ? prev.filter(url => url !== fileUrl)
        : [...prev, fileUrl]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => f.url));
    }
  };

  // File details modal
  const openFileDetails = (file) => {
    setSelectedFile(file);
    setShowFileDetailsModal(true);
  };

  // Handle file category change
  const handleFileCategoryChange = async (fileUrl, newCategory) => {
    try {
      setCategoryOperationLoading(true);
      
      if (!['images', 'documents', 'cover-images'].includes(newCategory)) {
        setErrorMessage('Invalid category selected');
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }

      const currentFile = files.find(f => f.url === fileUrl);
      if (!currentFile) {
        setErrorMessage('File not found');
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }

      if (currentFile.category === newCategory) {
        setErrorMessage('File is already in this category');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      if (currentFile.fileName.startsWith('.') || 
          currentFile.fileName.includes('..') || 
          currentFile.fileName.includes('\\') || 
          currentFile.fileName.includes('/')) {
        setErrorMessage('Cannot move system files or files with special characters');
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }

      const safetyCheck = isFileSafeToMove(currentFile);
      if (!safetyCheck.safe) {
        if (!confirm(`Warning: ${safetyCheck.reason}\n\nDo you still want to proceed with moving this file?`)) {
          return;
        }
      }

      const isCompatible = validateFileCategoryCompatibility(currentFile.fileType, newCategory, currentFile.originalName);
      if (!isCompatible.isValid) {
        setErrorMessage(`Cannot move ${currentFile.fileType} file to ${newCategory} category: ${isCompatible.reason}`);
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }

      if (!confirm(`Are you sure you want to move "${currentFile.originalName}" from ${currentFile.category} to ${newCategory}?`)) {
        return;
      }

      const response = await fetch('/api/admin/files/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'move',
          files: [fileUrl],
          options: { newCategory }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFiles(prev => prev.map(file => 
            file.url === fileUrl 
              ? { ...file, category: newCategory }
              : file
          ));
          
          setSuccessMessage(`File "${currentFile.originalName}" moved to ${newCategory} successfully`);
          setTimeout(() => setSuccessMessage(null), 5000);
          
          setTimeout(() => {
            fetchFiles();
          }, 1000);
        } else {
          throw new Error(result.error || 'Failed to move file');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating file category:', error);
      
      let errorMessage = 'Failed to update file category. Please try again.';
      if (error.message.includes('Source file not found')) {
        errorMessage = 'File not found on server. It may have been deleted.';
      } else if (error.message.includes('Invalid category')) {
        errorMessage = 'Invalid category selected. Please choose a valid category.';
      } else if (error.message.includes('Permission denied')) {
        errorMessage = 'Permission denied. You may not have access to move this file.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setCategoryOperationLoading(false);
    }
  };

  // Enhanced document type detection and validation
  const getDocumentType = (fileName, fileType) => {
    const extension = fileName.toLowerCase().split('.').pop();
    const documentExtensions = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'txt': 'Text File',
      'rtf': 'Rich Text',
      'odt': 'OpenDocument Text',
      'pages': 'Pages Document',
      'md': 'Markdown',
      'csv': 'CSV Spreadsheet',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
      'ods': 'OpenDocument Spreadsheet',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'odp': 'OpenDocument Presentation',
      'key': 'Keynote',
      'zip': 'Archive',
      'rar': 'Archive',
      '7z': 'Archive',
      'tar': 'Archive',
      'gz': 'Archive'
    };
    
    return documentExtensions[extension] || 'Document';
  };

  // Enhanced file type compatibility validation
  const validateFileCategoryCompatibility = (fileType, newCategory, fileName) => {
    const compatibility = {
      images: {
        allowedTypes: ['image'],
        reason: 'Only image files can be moved to images category'
      },
      documents: {
        allowedTypes: ['document', 'text', 'pdf', 'spreadsheet', 'presentation', 'archive'],
        reason: 'Only document files can be moved to documents category'
      },
      'cover-images': {
        allowedTypes: ['image'],
        reason: 'Only image files can be moved to cover-images category'
      }
    };

    const categoryRules = compatibility[newCategory];
    if (!categoryRules) {
      return { isValid: false, reason: 'Invalid category' };
    }

    const isAllowed = categoryRules.allowedTypes.includes(fileType);
    return {
      isValid: isAllowed,
      reason: isAllowed ? null : categoryRules.reason
    };
  };

  // Enhanced file safety validation with document-specific rules
  const isFileSafeToMove = (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.fileSize > maxSize) {
      return { safe: false, reason: `File size ${(file.fileSize / (1024 * 1024)).toFixed(2)}MB exceeds limit ${(maxSize / (1024 * 1024)).toFixed(2)}MB` };
    }

    const fileAge = Math.floor((Date.now() - new Date(file.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (fileAge > 365) {
      return { safe: false, reason: `File is ${fileAge} days old. Consider archiving instead of moving.` };
    }

    // Document-specific validation
    if (file.category === 'documents') {
      const extension = file.originalName.toLowerCase().split('.').pop();
      const sensitiveExtensions = ['exe', 'bat', 'cmd', 'ps1', 'vbs', 'js', 'jar', 'dll', 'sys'];
      if (sensitiveExtensions.includes(extension)) {
        return { safe: false, reason: `Executable files (${extension}) are not allowed in documents category for security reasons` };
      }
    }

    return { safe: true, reason: null };
  };

  // Document organization and categorization
  const organizeDocumentsByType = (files) => {
    const organized = {
      'Word Documents': [],
      'Spreadsheets': [],
      'Presentations': [],
      'PDFs': [],
      'Text Files': [],
      'Archives': [],
      'Other Documents': []
    };

    files.forEach(file => {
      if (file.category === 'documents') {
        const docType = getDocumentType(file.originalName, file.fileType);
        if (docType.includes('Word')) organized['Word Documents'].push(file);
        else if (docType.includes('Spreadsheet') || docType.includes('Excel') || docType.includes('CSV')) organized['Spreadsheets'].push(file);
        else if (docType.includes('PowerPoint') || docType.includes('Presentation') || docType.includes('Keynote')) organized['Presentations'].push(file);
        else if (docType.includes('PDF')) organized['PDFs'].push(file);
        else if (docType.includes('Text') || docType.includes('Markdown')) organized['Text Files'].push(file);
        else if (docType.includes('Archive')) organized['Archives'].push(file);
        else organized['Other Documents'].push(file);
      }
    });

    return organized;
  };

  // Document versioning and backup
  const createDocumentBackup = async (fileUrl) => {
    try {
      const response = await fetch('/api/admin/files/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'copy',
          files: [fileUrl],
          options: { 
            newCategory: 'documents',
            backup: true,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuccessMessage('Document backup created successfully');
          setTimeout(() => setSuccessMessage(null), 5000);
          fetchFiles();
        } else {
          throw new Error(result.error || 'Failed to create backup');
        }
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setErrorMessage('Failed to create document backup. Please try again.');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Storage cleanup utility
  const handleStorageCleanup = async () => {
    try {
      const response = await fetch('/api/admin/files/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'cleanup',
          options: {
            deleteOldFiles: true,
            maxAge: 365,
            deleteLargeFiles: false,
            maxSize: 100 * 1024 * 1024
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuccessMessage(`Storage cleanup completed: ${result.deletedFiles?.length || 0} files removed, ${(result.freedSpace / (1024 * 1024)).toFixed(2)}MB freed`);
          setTimeout(() => setSuccessMessage(null), 5000);
          
          setTimeout(() => {
            fetchFiles();
          }, 1000);
        } else {
          throw new Error(result.error || 'Failed to complete storage cleanup');
        }
      } else {
        throw new Error('Failed to complete storage cleanup');
      }
    } catch (error) {
      console.error('Error during storage cleanup:', error);
      setErrorMessage('Failed to complete storage cleanup. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Duplicate file detection
  const findDuplicateFiles = () => {
    const duplicates = [];
    const fileMap = new Map();
    
    files.forEach(file => {
      const key = `${file.originalName}_${file.fileSize}`;
      if (fileMap.has(key)) {
        duplicates.push([fileMap.get(key), file]);
      } else {
        fileMap.set(key, file);
      }
    });
    
    return duplicates;
  };

  // Handle duplicate file removal
  const handleDuplicateRemoval = async (duplicates) => {
    try {
      const response = await fetch('/api/admin/files/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'delete',
          files: duplicates,
          options: {}
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const { successful, failed } = result.summary;
          if (successful > 0) {
            setSuccessMessage(`${successful} duplicate files removed successfully`);
            if (failed > 0) {
              setSuccessMessage(prev => prev + ` (${failed} failed)`);
            }
          } else {
            setErrorMessage(`Failed to remove duplicates: ${result.message}`);
          }
          
          setTimeout(() => {
            fetchFiles();
          }, 1000);
        } else {
          throw new Error(result.error || 'Failed to remove duplicates');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error removing duplicates:', error);
      setErrorMessage('Failed to remove duplicate files. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Fetch advanced analytics
  const fetchAdvancedAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch('/api/admin/files/analytics?type=overview&includeDuplicates=true');
      
      if (response.ok) {
        const data = await response.json();
        setAdvancedAnalytics(data.analytics);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch analytics when files change
  useEffect(() => {
    if (files.length > 0) {
      fetchAdvancedAnalytics();
    }
  }, [files.length]);

  // Storage optimization suggestions
  const getStorageOptimizationSuggestions = () => {
    const analytics = getFileAnalytics();
    const suggestions = [];
    
    if (analytics.oldFiles > analytics.totalFiles * 0.3) {
      suggestions.push('Consider archiving old files to free up storage');
    }
    
    if (analytics.bySize.large > analytics.totalFiles * 0.1) {
      suggestions.push('Large files detected - consider compression or optimization');
    }
    
    if (analytics.byCategory.documents > analytics.totalFiles * 0.5) {
      suggestions.push('High document ratio - consider document management system');
    }
    
    return suggestions;
  };

  // File analytics
  const getFileAnalytics = () => {
    const analytics = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
      byCategory: {},
      byType: {},
      bySize: {
        small: 0,
        medium: 0,
        large: 0
      },
      recentUploads: 0,
      oldFiles: 0
    };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    files.forEach(file => {
      analytics.byCategory[file.category] = (analytics.byCategory[file.category] || 0) + 1;
      analytics.byType[file.fileType] = (analytics.byType[file.fileType] || 0) + 1;
      
      if (file.fileSize < 1024 * 1024) analytics.bySize.small++;
      else if (file.fileSize < 10 * 1024 * 1024) analytics.bySize.medium++;
      else analytics.bySize.large++;
      
      const fileDate = new Date(file.createdAt);
      if (fileDate > oneWeekAgo) analytics.recentUploads++;
      if (fileDate < oneMonthAgo) analytics.oldFiles++;
    });

    return analytics;
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType === 'image') return PhotoIcon;
    if (fileType === 'document') return DocumentIcon;
    return DocumentIcon;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session?.user?.type !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="File Management" adminSession={adminSession}>
      {/* Deployment Warning Banner */}
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              ⚠️ File Management Limited on Deployment Servers
            </h3>
            <div className="space-y-2 text-sm text-red-700 dark:text-red-300">
              <p>
                <strong>This file management system works locally but has limitations on deployment servers:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Vercel/Netlify:</strong> Read-only filesystem - uploads and deletions won't persist</li>
                <li><strong>Docker containers:</strong> File changes may not persist between restarts</li>
                <li><strong>Serverless functions:</strong> No persistent file storage</li>
              </ul>
              <p className="mt-3">
                <strong>For production use:</strong> Configure external storage services like AWS S3, Cloudinary, or Google Cloud Storage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { 
            label: 'Total Files', 
            value: summary.total, 
            color: 'bg-gray-100 dark:bg-gray-800',
            icon: FolderIcon 
          },
          { 
            label: 'Total Size', 
            value: formatFileSize(summary.totalSize), 
            color: 'bg-blue-100 dark:bg-blue-900/20',
            icon: DocumentIcon 
          },
          { 
            label: 'Images', 
            value: summary.images, 
            color: 'bg-green-100 dark:bg-green-900/20',
            icon: PhotoIcon 
          },
          { 
            label: 'Documents', 
            value: summary.documents, 
            color: 'bg-purple-100 dark:bg-purple-900/20',
            icon: DocumentIcon 
          },
          { 
            label: 'Cover Images', 
            value: summary['cover-images'], 
            color: 'bg-orange-100 dark:bg-orange-900/20',
            icon: PhotoIcon 
          }
        ].map((card, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-lg border ${card.color} border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all`}
            onClick={() => {
              if (card.label === 'Images') handleFilterChange('category', 'images');
              else if (card.label === 'Documents') handleFilterChange('category', 'documents');
              else if (card.label === 'Cover Images') handleFilterChange('category', 'cover-images');
              else if (card.label === 'Total Files') handleFilterChange('category', 'all');
            }}
          >
            <div className="flex items-center space-x-3">
              <card.icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </div>
          </div>
        ))}
        </div>

      {/* Storage Management Actions */}
      <div className="mb-4 p-3 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span><strong>Note:</strong> Storage operations (cleanup, duplicate removal) work locally but may not persist on deployment servers like Vercel.</span>
        </div>
      </div>
      
      <div className="mb-6 flex justify-end space-x-2">
        <Button
          onClick={() => {
            const duplicates = findDuplicateFiles();
            if (duplicates.length > 0) {
              if (confirm(`Found ${duplicates.length} duplicate files. Remove them?`)) {
                const duplicateUrls = duplicates.map(dup => dup[1].url);
                handleDuplicateRemoval(duplicateUrls);
              }
            } else {
              setSuccessMessage('No duplicate files found');
              setTimeout(() => setSuccessMessage(null), 3000);
            }
          }}
          variant="outline"
          className="text-orange-600 hover:text-orange-700"
        >
          <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
          Find Duplicates
        </Button>
        <Button
          onClick={async () => {
            try {
              const response = await fetch('/api/admin/files/operations?operation=cleanup-info');
              if (response.ok) {
                const data = await response.json();
                const info = data.storageInfo;
                const message = `Storage: ${info.totalSizeGB}GB (${info.fileCount} files)\nOld files: ${info.oldFiles}\nLarge files: ${info.largeFiles}`;
                
                if (confirm(`Storage Information:\n${message}\n\nProceed with cleanup?`)) {
                  handleStorageCleanup();
                }
              } else {
                handleStorageCleanup();
              }
            } catch (error) {
              handleStorageCleanup();
            }
          }}
          variant="outline"
          className="text-blue-600 hover:text-blue-700"
        >
          <ArchiveBoxIcon className="h-4 w-4 mr-2" />
          Storage Cleanup
        </Button>
        <Button
          onClick={() => {
            const documentStats = organizeDocumentsByType(files);
            const totalDocs = Object.values(documentStats).reduce((sum, docs) => sum + docs.length, 0);
            if (totalDocs > 0) {
              const message = `Document Analysis:\n\n` +
                `Word Documents: ${documentStats['Word Documents'].length}\n` +
                `Spreadsheets: ${documentStats['Spreadsheets'].length}\n` +
                `Presentations: ${documentStats['Presentations'].length}\n` +
                `PDFs: ${documentStats['PDFs'].length}\n` +
                `Text Files: ${documentStats['Text Files'].length}\n` +
                `Archives: ${documentStats['Archives'].length}\n` +
                `Other: ${documentStats['Other Documents'].length}\n\n` +
                `Total Documents: ${totalDocs}`;
              alert(message);
            } else {
              setSuccessMessage('No documents found to analyze');
              setTimeout(() => setSuccessMessage(null), 3000);
            }
          }}
          variant="outline"
          className="text-green-600 hover:text-green-700"
        >
          <DocumentIcon className="h-4 w-4 mr-2" />
          Document Analysis
        </Button>
                </div>

      {/* Analytics Dashboard */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Storage Analytics</CardTitle>
            <Button
              onClick={fetchAdvancedAnalytics}
              variant="outline"
              size="sm"
              disabled={loadingAnalytics}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loadingAnalytics ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
              </div>
        </CardHeader>
        <CardContent>
          {loadingAnalytics ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : advancedAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Storage Overview */}
              <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Storage Overview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Total Files:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">{advancedAnalytics.overview?.totalFiles || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Total Size:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">{formatFileSize(advancedAnalytics.overview?.totalSize || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Average Size:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">{formatFileSize(advancedAnalytics.overview?.averageFileSize || 0)}</span>
                  </div>
                </div>
              </div>

              {/* File Categories */}
              <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">File Categories</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(advancedAnalytics.byCategory || {}).map(([category, data]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300 capitalize">{category.replace('-', ' ')}:</span>
                      <span className="font-medium text-green-900 dark:text-green-100">{data.count}</span>
            </div>
          ))}
                </div>
        </div>

              {/* Storage Health */}
              <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">Storage Health</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Large Files (&gt;10MB):</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">{(advancedAnalytics.bySize?.large || 0) + (advancedAnalytics.bySize?.huge || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Duplicate Files:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">{advancedAnalytics.storageEfficiency?.duplicateFiles || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Old Files (&gt;1yr):</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">{advancedAnalytics.byAge?.old || 0}</span>
                  </div>
                </div>
              </div>

              {/* Document Management */}
              <div className="p-4 rounded-lg border bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-3">Document Management</h4>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const docStats = organizeDocumentsByType(files);
                    return Object.entries(docStats).map(([type, docs]) => 
                      docs.length > 0 ? (
                        <div key={type} className="flex justify-between">
                          <span className="text-indigo-700 dark:text-indigo-300">{type}:</span>
                          <span className="font-medium text-indigo-900 dark:text-indigo-100">{docs.length}</span>
                        </div>
                      ) : null
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
            </div>
          )}
          
          {/* Optimization Suggestions */}
          <div className="mt-6 space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Optimization Suggestions:</h4>
            {advancedAnalytics?.recommendations?.length > 0 ? (
              advancedAnalytics.recommendations.map((suggestion, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <InformationCircleIcon className="h-4 w-4" />
                  <span>{suggestion}</span>
                </div>
              ))
            ) : (
              getStorageOptimizationSuggestions().map((suggestion, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <InformationCircleIcon className="h-4 w-4" />
                  <span>{suggestion}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
                <option value="cover-images">Cover Images</option>
              </select>
              {filters.category === 'documents' && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Document Type
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value !== 'all') {
                        const docType = e.target.value;
                        const filteredDocs = files.filter(f => 
                          f.category === 'documents' && 
                          getDocumentType(f.originalName, f.fileType).includes(docType)
                        );
                        setFiles(filteredDocs);
                      } else {
                        fetchFiles();
                      }
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Document Types</option>
                    <option value="Word">Word Documents</option>
                    <option value="Spreadsheet">Spreadsheets</option>
                    <option value="Presentation">Presentations</option>
                    <option value="PDF">PDFs</option>
                    <option value="Text">Text Files</option>
                    <option value="Archive">Archives</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
            <input
              type="text"
                  placeholder="Search files by name, type, or category..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
              {filters.search && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Found {files.filter(f => 
                    f.originalName.toLowerCase().includes(filters.search.toLowerCase()) ||
                    f.category.toLowerCase().includes(filters.search.toLowerCase()) ||
                    f.fileType.toLowerCase().includes(filters.search.toLowerCase())
                  ).length} matching files
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort</label>
              <div className="grid grid-cols-2 gap-2">
            <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="createdAt">Created</option>
                  <option value="fileName">Name</option>
                  <option value="fileSize">Size</option>
                  <option value="category">Category</option>
                </select>
                <select
                  value={filters.order}
                  onChange={(e) => handleFilterChange('order', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
            </select>
          </div>
        </div>

            <div className="flex items-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              {selectedFiles.length} file(s) selected
            </span>
            <Button
              onClick={() => setSelectedFiles([])}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-700"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear Selection
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
            
            <Button
              onClick={handleBulkArchive}
              variant="outline"
              size="sm"
              className="text-orange-600 hover:text-orange-700"
            >
              <ArchiveBoxIcon className="h-4 w-4 mr-1" />
              Archive Selected
            </Button>
            
            <div className="relative">
              <Button
                onClick={() => document.getElementById('bulkMoveDropdown').classList.toggle('hidden')}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <FolderIcon className="h-4 w-4 mr-1" />
                Move To
              </Button>
              <div id="bulkMoveDropdown" className="hidden absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                <button
                  onClick={() => {
                    handleBulkMove('images');
                    document.getElementById('bulkMoveDropdown').classList.add('hidden');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Images
                </button>
                <button
                  onClick={() => {
                    handleBulkMove('documents');
                    document.getElementById('bulkMoveDropdown').classList.add('hidden');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Documents
                </button>
                <button
                  onClick={() => {
                    handleBulkMove('cover-images');
                    document.getElementById('bulkMoveDropdown').classList.add('hidden');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cover Images
            </button>
              </div>
            </div>
          </div>
          </div>
        )}

      {/* Files List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Files ({pagination.total} total)</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Total storage: {formatFileSize(summary.totalSize)}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={fetchFiles}
                variant="outline"
                disabled={loadingFiles}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
        {loadingFiles ? (
            <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          ) : files.length > 0 ? (
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                  checked={selectedFiles.length === files.length && files.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Select All</span>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.map((file, index) => {
                  const FileTypeIcon = getFileTypeIcon(file.fileType);
                  
                  return (
                <div
                  key={index}
                  className={`relative group border rounded-lg p-3 bg-white dark:bg-gray-800 transition-colors ${
                    selectedFiles.includes(file.url)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.url)}
                    onChange={() => toggleFileSelection(file.url)}
                    className="absolute top-2 left-2 z-10 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  {/* File Preview */}
                  <div className="aspect-square mb-2 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {file.fileType === 'image' ? (
                          <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                            <FileTypeIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.fileSize)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {file.category}
                    </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(file.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={() => openFileDetails(file)}
                          className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(file.url);
                            setSuccessMessage('File URL copied to clipboard');
                            setTimeout(() => setSuccessMessage(null), 2000);
                          }}
                          className="p-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40"
                          title="Copy URL"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                    <button
                      onClick={() => handleFileRemove(file, files.filter(f => f.url !== file.url))}
                      className="p-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40"
                          title="Delete File"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                  );
                })}
            </div>
          </div>
          ) : (
            <div className="text-center py-8">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No files found matching your criteria
              </p>
          </div>
        )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
      </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4 p-4 rounded-lg border-2 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-red-800 dark:text-red-200 mb-2">
                    🚨 Deployment Server Limitation
                  </h3>
                  <div className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <p>
                      <strong>File operations are limited on deployment servers:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Vercel/Netlify:</strong> Read-only filesystem - uploads and deletions won't persist</li>
                      <li><strong>Docker containers:</strong> File changes may not persist between restarts</li>
                      <li><strong>Serverless functions:</strong> No persistent file storage</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Current behavior:</strong> Works on localhost, but file changes will be lost on deployment servers.
                    </p>
                    <p className="mt-2">
                      <strong>Production solution:</strong> Configure external storage services like AWS S3, Cloudinary, or Google Cloud Storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>

                         <FileUpload
               onFileUpload={handleFileUpload}
               onFileRemove={handleFileRemove}
               category="images"
               multiple={true}
               maxFiles={10}
               userId={adminSession?.id}
              showCategorySelect={true}
              showProgress={true}
              autoUpload={true}
              onCategoryChange={(newCategory) => {
                console.log('Category changed to:', newCategory);
              }}
             />
          </div>
        </div>
      )}

      {/* File Details Modal */}
      {showFileDetailsModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">File Details</h2>
              <button
                onClick={() => setShowFileDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* File Preview */}
              <div className="flex justify-center">
                {selectedFile.fileType === 'image' ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.originalName}
                    className="max-w-full max-h-64 rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <DocumentIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">File Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Name:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedFile.originalName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Size:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formatFileSize(selectedFile.fileSize)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Type:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedFile.category === 'documents' 
                          ? getDocumentType(selectedFile.originalName, selectedFile.fileType)
                          : selectedFile.fileType
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <div className="flex items-center space-x-2">
                        <span className="ml-2 text-gray-900 dark:text-white capitalize">{selectedFile.category}</span>
                        <select
                          value={selectedFile.category}
                          onChange={(e) => handleFileCategoryChange(selectedFile.url, e.target.value)}
                          disabled={categoryOperationLoading}
                          className={`px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            categoryOperationLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="images">Images</option>
                          <option value="documents">Documents</option>
                          <option value="cover-images">Cover Images</option>
                        </select>
                        {categoryOperationLoading && (
                          <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Timestamps</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formatDate(selectedFile.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Modified:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formatDate(selectedFile.modifiedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* File URL */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">File URL</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={selectedFile.url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <Button
                    onClick={() => navigator.clipboard.writeText(selectedFile.url)}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setShowFileDetailsModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
                {selectedFile.category === 'documents' && (
                  <Button
                    onClick={() => createDocumentBackup(selectedFile.url)}
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                )}
                <Button
                  onClick={() => handleFileRemove(selectedFile, files.filter(f => f.url !== selectedFile.url))}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete File
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}