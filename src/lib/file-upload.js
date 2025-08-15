// File upload utility functions

// File type configurations
export const FILE_TYPES = {
  images: {
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
    maxSize: 5 * 1024 * 1024, // 5MB
    directory: 'images'
  },
  documents: {
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    maxSize: 10 * 1024 * 1024, // 10MB
    directory: 'documents'
  },
  'cover-images': {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    directory: 'cover-images'
  }
};

// Helper function to get file type configuration
export function getFileTypeConfig(file) {
  const extension = file.name.slice((file.name.lastIndexOf('.') - 1 >>> 0) + 1).toLowerCase();
  
  for (const [category, config] of Object.entries(FILE_TYPES)) {
    if (config.types.includes(file.type) || config.extensions.includes(extension)) {
      return { category, ...config };
    }
  }
  
  return null;
}

// Helper function to validate file
export function validateFile(file, config) {
  if (!config) {
    return { valid: false, error: 'Unsupported file type' };
  }
  
  if (file.size > config.maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${config.maxSize / (1024 * 1024)}MB` 
    };
  }
  
  return { valid: true };
}

// Helper function to format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file extension
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// Helper function to check if file is an image
export function isImageFile(file) {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  return imageTypes.includes(file.type);
}

// Helper function to check if file is a document
export function isDocumentFile(file) {
  const documentTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain'
  ];
  return documentTypes.includes(file.type);
}

// Client-side file upload function
export async function uploadFile(file, category = 'images', userId = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (userId) {
      formData.append('userId', userId);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Client-side file deletion function
export async function deleteFile(fileUrl, userId = null) {
  try {
    const params = new URLSearchParams({ url: fileUrl });
    if (userId) {
      params.append('userId', userId);
    }

    const response = await fetch(`/api/upload?${params}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

// Admin file upload function
export async function uploadFileAdmin(file, category = 'images', userId = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (userId) {
      formData.append('userId', userId);
    }

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Admin upload error:', error);
    throw error;
  }
}

// Admin file deletion function
export async function deleteFileAdmin(fileUrl, userId = null) {
  try {
    const params = new URLSearchParams({ url: fileUrl });
    if (userId) {
      params.append('userId', userId);
    }

    const response = await fetch(`/api/admin/upload?${params}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Admin delete error:', error);
    throw error;
  }
}

// File preview utilities
export function createFilePreview(file) {
  return new Promise((resolve, reject) => {
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      resolve(null);
    }
  });
}

// Drag and drop utilities
export function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
}

export function handleDragEnter(e) {
  e.preventDefault();
  e.stopPropagation();
}

export function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
}

export function handleDrop(e, onFilesDrop) {
  e.preventDefault();
  e.stopPropagation();
  
  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    onFilesDrop(files);
  }
}
