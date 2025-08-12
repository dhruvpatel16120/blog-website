'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import FileUpload from '@/components/ui/FileUpload';
import { 
  FolderIcon, 
  PhotoIcon, 
  DocumentIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatFileSize } from '@/lib/file-upload';

export default function FilesPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch files from the server
  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      // This would be implemented to fetch files from the server
      // For now, we'll use a placeholder
      const response = await fetch('/api/admin/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (adminSession) {
      fetchFiles();
    }
  }, [adminSession]);

  // Filter files based on search and category
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle file upload
  const handleFileUpload = (uploadedFiles, allFiles) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
    setShowUploadModal(false);
  };

  // Handle file removal
  const handleFileRemove = (removedFile, remainingFiles) => {
    setFiles(prev => prev.filter(f => f.url !== removedFile.url));
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) {
      try {
        const deletePromises = selectedFiles.map(fileUrl =>
          fetch(`/api/admin/upload?url=${encodeURIComponent(fileUrl)}`, {
            method: 'DELETE'
          })
        );

        await Promise.all(deletePromises);
        setFiles(prev => prev.filter(f => !selectedFiles.includes(f.url)));
        setSelectedFiles([]);
      } catch (error) {
        console.error('Error deleting files:', error);
      }
    }
  };

  // Handle file selection
  const toggleFileSelection = (fileUrl) => {
    setSelectedFiles(prev => 
      prev.includes(fileUrl) 
        ? prev.filter(url => url !== fileUrl)
        : [...prev, fileUrl]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.url));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (session?.user?.type !== 'admin') {
    return <div>Access denied</div>;
  }

  const categories = [
    { id: 'all', name: 'All Files', icon: FolderIcon, count: files.length },
    { id: 'images', name: 'Images', icon: PhotoIcon, count: files.filter(f => f.category === 'images').length },
    { id: 'documents', name: 'Documents', icon: DocumentIcon, count: files.filter(f => f.category === 'documents').length },
    { id: 'avatars', name: 'Avatars', icon: PhotoIcon, count: files.filter(f => f.category === 'avatars').length }
  ];

  return (
    <AdminLayout adminSession={adminSession}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">File Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage uploaded files and media</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Files
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {categories.map(category => (
            <div
              key={category.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-center space-x-3">
                <category.icon className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{category.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              {selectedFiles.length} file(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}

        {/* Files Grid */}
        {loadingFiles ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by uploading some files'
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
              <span className="text-sm text-gray-700 dark:text-gray-300">Select All</span>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file, index) => (
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
                    {file.category === 'images' ? (
                      <Image
                        src={file.url}
                        alt={file.originalName}
                        width={512}
                        height={512}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <DocumentIcon className="h-12 w-12 text-gray-400" />
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
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleFileRemove(file, files.filter(f => f.url !== file.url))}
                      className="p-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
                         <FileUpload
               onFileUpload={handleFileUpload}
               onFileRemove={handleFileRemove}
               category="images"
               multiple={true}
               maxFiles={10}
               userId={adminSession?.id}
             />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
