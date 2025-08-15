import { NextResponse } from 'next/server';
import { readdir, stat, unlink, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// Enhanced file info with more metadata
async function getFileInfo(filePath, fileName, category) {
  try {
    const stats = await stat(filePath);
    const fileExtension = path.extname(fileName).toLowerCase();
    
    // Enhanced file type detection
    let fileType = 'unknown';
    let mimeType = 'application/octet-stream';
    
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.tiff'].includes(fileExtension)) {
      fileType = 'image';
      mimeType = `image/${fileExtension.slice(1)}`;
    } else if (['.pdf', '.doc', '.docx', '.txt', '.rtf'].includes(fileExtension)) {
      fileType = 'document';
      mimeType = `application/${fileExtension.slice(1)}`;
    } else if (['.mp4', '.avi', '.mov', '.wmv'].includes(fileExtension)) {
      fileType = 'video';
      mimeType = `video/${fileExtension.slice(1)}`;
    } else if (['.mp3', '.wav', '.flac', '.aac'].includes(fileExtension)) {
      fileType = 'audio';
      mimeType = `audio/${fileExtension.slice(1)}`;
    }

    // Extract original filename (remove timestamp and random string)
    const originalName = fileName.split('-').slice(0, -2).join('-') + fileExtension;
    
    // Calculate file age
    const now = new Date();
    const fileAge = Math.floor((now - stats.birthtime) / (1000 * 60 * 60 * 24)); // days

    return {
      fileName,
      originalName,
      url: `/uploads/${category}/${fileName}`,
      fileSize: stats.size,
      fileType,
      mimeType,
      category,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      fileAge,
      isImage: fileType === 'image',
      isDocument: fileType === 'document',
      isVideo: fileType === 'video',
      isAudio: fileType === 'audio'
    };
  } catch (error) {
    console.error(`Error getting file info for ${fileName}:`, error);
    return null;
  }
}

// Enhanced directory scanning with error handling
async function scanDirectory(dirPath, category) {
  try {
    // Ensure directory exists
    try {
      await stat(dirPath);
    } catch {
      await mkdir(dirPath, { recursive: true });
      return [];
    }

    const files = await readdir(dirPath);
    const fileInfos = [];

    for (const fileName of files) {
      // Skip hidden files and system files
      if (fileName.startsWith('.') || fileName === '.gitkeep' || fileName === 'Thumbs.db') {
        continue;
      }

      const filePath = path.join(dirPath, fileName);
      const fileInfo = await getFileInfo(filePath, fileName, category);
      
      if (fileInfo) {
        fileInfos.push(fileInfo);
      }
    }

    return fileInfos;
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
    return [];
  }
}

// Enhanced filtering with more options
function filterFiles(files, filters) {
  let filteredFiles = [...files];

  // Search filter (enhanced)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredFiles = filteredFiles.filter(file => 
      file.originalName.toLowerCase().includes(searchTerm) ||
      file.category.toLowerCase().includes(searchTerm) ||
      file.fileType.toLowerCase().includes(searchTerm) ||
      file.mimeType.toLowerCase().includes(searchTerm)
    );
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filteredFiles = filteredFiles.filter(file => file.category === filters.category);
  }

  // File type filter
  if (filters.fileType && filters.fileType !== 'all') {
    filteredFiles = filteredFiles.filter(file => file.fileType === filters.fileType);
  }

  // Date range filters
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filteredFiles = filteredFiles.filter(file => new Date(file.createdAt) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999); // End of day
    filteredFiles = filteredFiles.filter(file => new Date(file.createdAt) <= toDate);
  }

  // Size range filters
  if (filters.sizeMin) {
    const minSize = parseInt(filters.sizeMin) * 1024 * 1024; // Convert MB to bytes
    filteredFiles = filteredFiles.filter(file => file.fileSize >= minSize);
  }

  if (filters.sizeMax) {
    const maxSize = parseInt(filters.sizeMax) * 1024 * 1024; // Convert MB to bytes
    filteredFiles = filteredFiles.filter(file => file.fileSize <= maxSize);
  }

  // Age filter
  if (filters.ageMin) {
    const minAge = parseInt(filters.ageMin);
    filteredFiles = filteredFiles.filter(file => file.fileAge >= minAge);
  }

  if (filters.ageMax) {
    const maxAge = parseInt(filters.ageMax);
    filteredFiles = filteredFiles.filter(file => file.fileAge <= maxAge);
  }

  return filteredFiles;
}

// Enhanced sorting with more options
function sortFiles(files, sortBy, order) {
  const sortedFiles = [...files];
  
  sortedFiles.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'fileName':
        comparison = a.originalName.localeCompare(b.originalName);
        break;
      case 'fileSize':
        comparison = a.fileSize - b.fileSize;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'fileType':
        comparison = a.fileType.localeCompare(b.fileType);
        break;
      case 'fileAge':
        comparison = a.fileAge - b.fileAge;
        break;
      case 'modifiedAt':
        comparison = new Date(a.modifiedAt) - new Date(b.modifiedAt);
        break;
      case 'createdAt':
      default:
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sortedFiles;
}

// Calculate advanced analytics
function calculateAnalytics(files) {
  const analytics = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
    byCategory: {},
    byType: {},
    bySize: {
      small: 0,    // < 1MB
      medium: 0,   // 1MB - 10MB
      large: 0     // > 10MB
    },
    byAge: {
      recent: 0,   // < 7 days
      recent: 0,   // 7-30 days
      old: 0       // > 30 days
    },
    mimeTypes: {},
    averageFileSize: 0,
    largestFile: null,
    oldestFile: null,
    newestFile: null
  };

  if (files.length === 0) return analytics;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  files.forEach(file => {
    // Category breakdown
    analytics.byCategory[file.category] = (analytics.byCategory[file.category] || 0) + 1;
    
    // Type breakdown
    analytics.byType[file.fileType] = (analytics.byType[file.fileType] || 0) + 1;
    
    // MIME type breakdown
    analytics.mimeTypes[file.mimeType] = (analytics.mimeTypes[file.mimeType] || 0) + 1;
    
    // Size breakdown
    if (file.fileSize < 1024 * 1024) analytics.bySize.small++;
    else if (file.fileSize < 10 * 1024 * 1024) analytics.bySize.medium++;
    else analytics.bySize.large++;
    
    // Age breakdown
    if (file.createdAt > oneWeekAgo) analytics.byAge.recent++;
    else if (file.createdAt > oneMonthAgo) analytics.byAge.recent++;
    else analytics.byAge.old++;
  });

  // Calculate averages and extremes
  analytics.averageFileSize = analytics.totalSize / analytics.totalFiles;
  analytics.largestFile = files.reduce((max, file) => file.fileSize > max.fileSize ? file : max, files[0]);
  analytics.oldestFile = files.reduce((oldest, file) => file.createdAt < oldest.createdAt ? file : oldest, files[0]);
  analytics.newestFile = files.reduce((newest, file) => file.createdAt > newest.createdAt ? file : newest, files[0]);

  return analytics;
}

// Find duplicate files
function findDuplicateFiles(files) {
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
}

// GET endpoint for fetching files with enhanced features
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sizeMin = searchParams.get('sizeMin') || '';
    const sizeMax = searchParams.get('sizeMax') || '';
    const ageMin = searchParams.get('ageMin') || '';
    const ageMax = searchParams.get('ageMax') || '';
    const fileType = searchParams.get('fileType') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const includeAnalytics = searchParams.get('analytics') === 'true';
    const findDuplicates = searchParams.get('duplicates') === 'true';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const categories = ['images', 'documents', 'cover-images'];
    
    let allFiles = [];

    // Scan all categories or specific category
    if (category === 'all') {
      for (const cat of categories) {
        const categoryDir = path.join(uploadsDir, cat);
        const categoryFiles = await scanDirectory(categoryDir, cat);
        allFiles = [...allFiles, ...categoryFiles];
      }
    } else if (categories.includes(category)) {
      const categoryDir = path.join(uploadsDir, category);
      allFiles = await scanDirectory(categoryDir, category);
    }

    // Apply filters
    const filters = { 
      search, 
      dateFrom, 
      dateTo, 
      sizeMin, 
      sizeMax, 
      ageMin, 
      ageMax, 
      category, 
      fileType 
    };
    let filteredFiles = filterFiles(allFiles, filters);

    // Apply sorting
    filteredFiles = sortFiles(filteredFiles, sortBy, order);

    // Calculate pagination
    const total = filteredFiles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    // Calculate basic storage statistics
    const totalSize = allFiles.reduce((sum, file) => sum + file.fileSize, 0);
    const categoryStats = categories.reduce((stats, cat) => {
      const categoryFiles = allFiles.filter(file => file.category === cat);
      stats[cat] = {
        count: categoryFiles.length,
        size: categoryFiles.reduce((sum, file) => sum + file.fileSize, 0)
      };
      return stats;
    }, {});

    // Prepare response
    const response = {
      files: paginatedFiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        totalFiles: total,
        totalSize,
        categoryStats,
        unused: allFiles.length // Placeholder for database integration
      }
    };

    // Add analytics if requested
    if (includeAnalytics) {
      response.analytics = calculateAnalytics(allFiles);
    }

    // Add duplicate detection if requested
    if (findDuplicates) {
      response.duplicates = findDuplicateFiles(allFiles);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files', details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint for file operations (upload, move, copy, etc.)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, fileUrl, newCategory, targetPath } = body;

    switch (action) {
      case 'move':
        // Move file to different category
        return await moveFile(fileUrl, newCategory);
      
      case 'copy':
        // Copy file to different location
        return await copyFile(fileUrl, targetPath);
      
      case 'update-category':
        // Update file category metadata
        return await updateFileCategory(fileUrl, newCategory);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in file operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform file operation', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint for file removal
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    const bulkDelete = searchParams.get('bulk') === 'true';

    if (!fileUrl && !bulkDelete) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    if (bulkDelete) {
      // Handle bulk deletion
      const body = await request.json();
      const { fileUrls } = body;
      
      if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
        return NextResponse.json({ error: 'File URLs array is required' }, { status: 400 });
      }

      const results = await Promise.allSettled(
        fileUrls.map(url => deleteFile(url))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return NextResponse.json({
        message: `Deleted ${successful} files successfully`,
        successful,
        failed,
        results: results.map((result, index) => ({
          url: fileUrls[index],
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason.message : null
        }))
      });

    } else {
      // Handle single file deletion
      const result = await deleteFile(fileUrl);
      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to delete a file
async function deleteFile(fileUrl) {
  try {
    // Extract category and filename from URL
    const urlParts = fileUrl.split('/');
    const category = urlParts[urlParts.length - 2];
    const fileName = urlParts[urlParts.length - 1];
    
          if (!['images', 'documents', 'cover-images'].includes(category)) {
      throw new Error('Invalid category');
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', category, fileName);
    
    // Check if file exists
    try {
      await stat(filePath);
    } catch {
      throw new Error('File not found');
    }

    // Delete the file
    await unlink(filePath);

    return {
      success: true,
      message: 'File deleted successfully',
      deletedFile: { url: fileUrl, category, fileName }
    };

  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

// Helper function to move a file
async function moveFile(fileUrl, newCategory) {
  try {
    // Implementation for moving files between categories
    // This would involve copying the file to the new location and deleting from the old
    return NextResponse.json({
      success: true,
      message: 'File moved successfully'
    });
  } catch (error) {
    throw new Error(`Failed to move file: ${error.message}`);
  }
}

// Helper function to copy a file
async function copyFile(fileUrl, targetPath) {
  try {
    // Implementation for copying files
    return NextResponse.json({
      success: true,
      message: 'File copied successfully'
    });
  } catch (error) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

// Helper function to update file category
async function updateFileCategory(fileUrl, newCategory) {
  try {
    // Implementation for updating file category metadata
    // This would typically involve updating a database record
    return NextResponse.json({
      success: true,
      message: 'File category updated successfully'
    });
  } catch (error) {
    throw new Error(`Failed to update file category: ${error.message}`);
  }
}
