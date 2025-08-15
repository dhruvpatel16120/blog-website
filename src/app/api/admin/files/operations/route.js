import { NextResponse } from 'next/server';
import { readdir, stat, unlink, copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// Move file between categories
async function moveFileOperation(fileUrl, newCategory) {
  try {
    const urlParts = fileUrl.split('/');
    const oldCategory = urlParts[urlParts.length - 2];
    const fileName = urlParts[urlParts.length - 1];
    
         if (!['images', 'documents', 'cover-images'].includes(oldCategory) || 
         !['images', 'documents', 'cover-images'].includes(newCategory)) {
       throw new Error('Invalid category');
     }

    const oldPath = path.join(process.cwd(), 'public', 'uploads', oldCategory, fileName);
    const newPath = path.join(process.cwd(), 'public', 'uploads', newCategory, fileName);
    
    // Check if source file exists
    try {
      await stat(oldPath);
    } catch {
      throw new Error('Source file not found');
    }

    // Ensure destination directory exists
    await mkdir(path.dirname(newPath), { recursive: true });

    // Copy file to new location
    await copyFile(oldPath, newPath);
    
    // Delete original file
    await unlink(oldPath);

    return {
      success: true,
      message: 'File moved successfully',
      oldPath: `/uploads/${oldCategory}/${fileName}`,
      newPath: `/uploads/${newCategory}/${fileName}`,
      oldCategory,
      newCategory
    };

  } catch (error) {
    throw new Error(`Failed to move file: ${error.message}`);
  }
}

  // Copy file to different location
  async function copyFileOperation(fileUrl, targetPath) {
    try {
      const urlParts = fileUrl.split('/');
      const category = urlParts[urlParts.length - 2];
      const fileName = urlParts[urlParts.length - 1];
      
      if (!['images', 'documents', 'cover-images'].includes(category)) {
        throw new Error('Invalid category');
      }

    const sourcePath = path.join(process.cwd(), 'public', 'uploads', category, fileName);
    const destinationPath = path.join(process.cwd(), 'public', targetPath);
    
    // Check if source file exists
    try {
      await stat(sourcePath);
    } catch {
      throw new Error('Source file not found');
    }

    // Ensure destination directory exists
    await mkdir(path.dirname(destinationPath), { recursive: true });

    // Copy file
    await copyFile(sourcePath, destinationPath);

    return {
      success: true,
      message: 'File copied successfully',
      sourcePath: `/uploads/${category}/${fileName}`,
      destinationPath: targetPath
    };

  } catch (error) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

// Bulk file operations
async function bulkFileOperation(files, operation, options = {}) {
  try {
    const results = [];
    const { newCategory, targetPath, operationType } = options;

    for (const fileUrl of files) {
      try {
        let result;
        
        switch (operation) {
          case 'move':
            result = await moveFileOperation(fileUrl, newCategory);
            break;
          case 'copy':
            result = await copyFileOperation(fileUrl, targetPath);
            break;
          case 'delete':
            result = await deleteFileOperation(fileUrl);
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
        
        results.push({
          url: fileUrl,
          success: true,
          result
        });
        
      } catch (error) {
        results.push({
          url: fileUrl,
          success: false,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      message: `Bulk ${operation} completed: ${successful} successful, ${failed} failed`,
      results,
      summary: { successful, failed, total: files.length }
    };

  } catch (error) {
    throw new Error(`Bulk operation failed: ${error.message}`);
  }
}

  // Delete file operation
  async function deleteFileOperation(fileUrl) {
    try {
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

  // Storage cleanup operations
  async function storageCleanupOperation(options = {}) {
    try {
      const { 
        deleteOldFiles = false, 
        maxAge = 365, 
        deleteLargeFiles = false, 
        maxSize = 100 * 1024 * 1024, // 100MB
        deleteUnusedFiles = false 
      } = options;

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const categories = ['images', 'documents', 'cover-images'];
    let allFiles = [];
    let cleanupResults = {
      deletedFiles: [],
      freedSpace: 0,
      recommendations: []
    };

    // Scan all files
    for (const category of categories) {
      const categoryDir = path.join(uploadsDir, category);
      try {
        const files = await readdir(categoryDir);
        for (const fileName of files) {
          if (fileName.startsWith('.') || fileName === '.gitkeep') continue;
          
          const filePath = path.join(categoryDir, fileName);
          const stats = await stat(filePath);
          const fileAge = Math.floor((Date.now() - stats.birthtime.getTime()) / (1000 * 60 * 60 * 24));
          
          allFiles.push({
            path: filePath,
            url: `/uploads/${category}/${fileName}`,
            size: stats.size,
            age: fileAge,
            category,
            fileName
          });
        }
      } catch (error) {
        console.error(`Error scanning category ${category}:`, error);
      }
    }

    // Apply cleanup rules
    for (const file of allFiles) {
      let shouldDelete = false;
      let reason = '';

      if (deleteOldFiles && file.age > maxAge) {
        shouldDelete = true;
        reason = `File is ${file.age} days old (max: ${maxAge})`;
      }

      if (deleteLargeFiles && file.size > maxSize) {
        shouldDelete = true;
        reason = `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds limit ${(maxSize / (1024 * 1024)).toFixed(2)}MB`;
      }

      if (shouldDelete) {
        try {
          await unlink(file.path);
          cleanupResults.deletedFiles.push({
            ...file,
            reason,
            deletedAt: new Date().toISOString()
          });
          cleanupResults.freedSpace += file.size;
        } catch (error) {
          console.error(`Failed to delete file ${file.path}:`, error);
        }
      }
    }

    // Generate recommendations
    const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
    const averageAge = allFiles.reduce((sum, f) => sum + f.age, 0) / allFiles.length;
    
    if (averageAge > 180) {
      cleanupResults.recommendations.push('Consider archiving files older than 6 months');
    }
    
    if (totalSize > 1024 * 1024 * 1024 * 1024) { // > 1TB
      cleanupResults.recommendations.push('Storage usage is high - consider implementing compression');
    }

    return {
      success: true,
      message: 'Storage cleanup completed',
      ...cleanupResults
    };

  } catch (error) {
    throw new Error(`Storage cleanup failed: ${error.message}`);
  }
}

// Export file list to CSV
async function exportFileListOperation(files, format = 'csv') {
  try {
    let content;
    let filename;
    let mimeType;

    if (format === 'csv') {
      const csvContent = [
        ['File Name', 'Category', 'Size (bytes)', 'Size (MB)', 'Type', 'Created Date', 'Modified Date', 'URL'],
        ...files.map(file => [
          file.originalName || file.fileName,
          file.category,
          file.fileSize,
          (file.fileSize / (1024 * 1024)).toFixed(2),
          file.fileType,
          file.createdAt,
          file.modifiedAt,
          file.url
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      content = csvContent;
      filename = `files-export-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(files, null, 2);
      filename = `files-export-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    return {
      success: true,
      message: 'File list exported successfully',
      content,
      filename,
      mimeType,
      fileCount: files.length
    };

  } catch (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
}

// POST endpoint for file operations
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { operation, files, options = {} } = body;

    if (!operation) {
      return NextResponse.json({ error: 'Operation is required' }, { status: 400 });
    }

    let result;

    switch (operation) {
      case 'move':
        if (!files || !Array.isArray(files) || files.length === 0) {
          return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
        }
        if (!options.newCategory) {
          return NextResponse.json({ error: 'New category is required for move operation' }, { status: 400 });
        }
        result = await bulkFileOperation(files, 'move', options);
        break;

      case 'copy':
        if (!files || !Array.isArray(files) || files.length === 0) {
          return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
        }
        if (!options.targetPath) {
          return NextResponse.json({ error: 'Target path is required for copy operation' }, { status: 400 });
        }
        result = await bulkFileOperation(files, 'copy', options);
        break;

      case 'delete':
        if (!files || !Array.isArray(files) || files.length === 0) {
          return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
        }
        result = await bulkFileOperation(files, 'delete', options);
        break;

      case 'cleanup':
        result = await storageCleanupOperation(options);
        break;

      case 'export':
        if (!files || !Array.isArray(files) || files.length === 0) {
          return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
        }
        result = await exportFileListOperation(files, options.format || 'csv');
        break;

      default:
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in file operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform file operation', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for operation status and info
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');

    if (operation === 'cleanup-info') {
      // Return storage cleanup recommendations
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const categories = ['images', 'documents', 'cover-images'];
      let totalSize = 0;
      let fileCount = 0;
      let oldFiles = 0;
      let largeFiles = 0;

      for (const category of categories) {
        const categoryDir = path.join(uploadsDir, category);
        try {
          const files = await readdir(categoryDir);
          for (const fileName of files) {
            if (fileName.startsWith('.') || fileName === '.gitkeep') continue;
            
            const filePath = path.join(categoryDir, fileName);
            const stats = await stat(filePath);
            const fileAge = Math.floor((Date.now() - stats.birthtime.getTime()) / (1000 * 60 * 60 * 24));
            
            totalSize += stats.size;
            fileCount++;
            
            if (fileAge > 365) oldFiles++;
            if (stats.size > 100 * 1024 * 1024) largeFiles++; // > 100MB
          }
        } catch (error) {
          console.error(`Error scanning category ${category}:`, error);
        }
      }

      return NextResponse.json({
        storageInfo: {
          totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
          totalSizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
          fileCount,
          oldFiles,
          largeFiles
        },
        recommendations: [
          oldFiles > 0 ? `Consider archiving ${oldFiles} files older than 1 year` : null,
          largeFiles > 0 ? `Consider compressing ${largeFiles} large files` : null,
          totalSize > 1024 * 1024 * 1024 * 1024 ? 'Storage usage is high - consider cleanup' : null
        ].filter(Boolean)
      });
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    console.error('Error getting operation info:', error);
    return NextResponse.json(
      { error: 'Failed to get operation info', details: error.message },
      { status: 500 }
    );
  }
}
