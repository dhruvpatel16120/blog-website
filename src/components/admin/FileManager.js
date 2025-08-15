'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FolderIcon, 
  PhotoIcon, 
  DocumentIcon, 
  TrashIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { formatFileSize } from '@/lib/file-upload';

const FILE_ACTIONS = [
  { id: 'delete', label: 'Delete', icon: TrashIcon, color: 'text-red-600 hover:text-red-700', variant: 'outline' },
  { id: 'archive', label: 'Archive', icon: ArchiveBoxIcon, color: 'text-blue-600 hover:text-blue-700', variant: 'outline' },
  { id: 'move', label: 'Move', icon: FolderIcon, color: 'text-green-600 hover:text-green-700', variant: 'outline' },
  { id: 'copy', label: 'Copy', icon: DocumentIcon, color: 'text-purple-600 hover:text-purple-700', variant: 'outline' }
];

export default function FileManager({ 
  files, 
  onFileAction, 
  onRefresh, 
  loading = false,
  showStats = true,
  showActions = true,
  showFilters = true,
  maxSelection = 100
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      if (filterCategory !== 'all' && file.category !== filterCategory) return false;
      if (searchTerm && !file.originalName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName);
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // File selection
  const toggleFileSelection = (fileUrl) => {
    setSelectedFiles(prev => 
      prev.includes(fileUrl) 
        ? prev.filter(url => url !== fileUrl)
        : prev.length < maxSelection 
          ? [...prev, fileUrl]
          : prev
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.slice(0, maxSelection).map(f => f.url));
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  // File actions
  const handleFileAction = (action, fileUrls = selectedFiles) => {
    if (onFileAction) {
      onFileAction(action, fileUrls);
    }
    if (action === 'delete' || action === 'archive') {
      setSelectedFiles([]);
    }
  };

  // Statistics
  const stats = {
    total: files.length,
    totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
    categories: files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {}),
    selected: selectedFiles.length,
    selectedSize: files
      .filter(file => selectedFiles.includes(file.url))
      .reduce((sum, file) => sum + file.fileSize, 0)
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType === 'image') return PhotoIcon;
    if (fileType === 'document') return DocumentIcon;
    return DocumentIcon;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Files', value: stats.total, icon: FolderIcon, color: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Total Size', value: formatFileSize(stats.totalSize), icon: DocumentIcon, color: 'bg-blue-100 dark:bg-blue-900/20' },
            { label: 'Selected', value: `${stats.selected} files`, icon: CheckCircleIcon, color: 'bg-green-100 dark:bg-green-900/20' },
            { label: 'Selected Size', value: formatFileSize(stats.selectedSize), icon: ArchiveBoxIcon, color: 'bg-purple-100 dark:bg-purple-900/20' }
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${stat.color} border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center space-x-3">
                <stat.icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              List
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="createdAt">Created Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="category">Category</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <ArrowPathIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          
          {selectedFiles.length > 0 && (
            <Button
              onClick={clearSelection}
              variant="outline"
              size="sm"
            >
              Clear Selection
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
                            <option value="cover-images">Cover Images</option>
          </select>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && showActions && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                {selectedFiles.length} file(s) selected ({formatFileSize(stats.selectedSize)})
              </span>
            </div>
            <div className="flex space-x-2">
              {FILE_ACTIONS.map(action => (
                <Button
                  key={action.id}
                  onClick={() => handleFileAction(action.id)}
                  variant={action.variant}
                  size="sm"
                  className={action.color}
                >
                  <action.icon className="h-4 w-4 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">No files found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No files available'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Select All ({filteredFiles.length} files)
            </span>
          </div>

          {/* Files Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file, index) => {
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
                        <Image
                          src={file.url}
                          alt={file.originalName}
                          fill
                          sizes="(max-width: 768px) 50vw, 200px"
                          className="object-cover"
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
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file, index) => {
                const FileTypeIcon = getFileTypeIcon(file.fileType);
                
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-3 border rounded-lg bg-white dark:bg-gray-800 transition-colors ${
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* File Icon */}
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      {file.fileType === 'image' ? (
                        <Image
                          src={file.url}
                          alt={file.originalName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileTypeIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {file.category} • {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
                      </p>
                    </div>

                    {/* File Type Badge */}
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full capitalize">
                      {file.fileType}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selection Limit Warning */}
      {selectedFiles.length >= maxSelection && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Maximum selection limit reached ({maxSelection} files). Clear selection to select more files.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
