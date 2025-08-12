import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// Helper function to get file info
async function getFileInfo(filePath, fileName, category) {
  try {
    const stats = await stat(filePath);
    const fileExtension = path.extname(fileName).toLowerCase();
    
    // Determine file type
    let fileType = 'unknown';
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(fileExtension)) {
      fileType = 'image';
    } else if (['.pdf', '.doc', '.docx', '.txt'].includes(fileExtension)) {
      fileType = 'document';
    }

    return {
      fileName,
      originalName: fileName.split('-').slice(0, -2).join('-') + fileExtension, // Remove timestamp and random string
      url: `/uploads/${category}/${fileName}`,
      fileSize: stats.size,
      fileType,
      category,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  } catch (error) {
    console.error(`Error getting file info for ${fileName}:`, error);
    return null;
  }
}

// Helper function to scan directory for files
async function scanDirectory(dirPath, category) {
  try {
    const files = await readdir(dirPath);
    const fileInfos = [];

    for (const fileName of files) {
      // Skip .gitkeep and other hidden files; enforce simple name policy
      if (fileName.startsWith('.') || fileName === '.gitkeep' || /[^\w.-]/.test(fileName)) {
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

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const categories = ['images', 'documents', 'avatars'];
    
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

    // Sort files by creation date (newest first)
    allFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate pagination
    const total = allFiles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = allFiles.slice(startIndex, endIndex);

    // Calculate storage statistics
    const totalSize = allFiles.reduce((sum, file) => sum + file.fileSize, 0);
    const categoryStats = categories.reduce((stats, cat) => {
      const categoryFiles = allFiles.filter(file => file.category === cat);
      stats[cat] = {
        count: categoryFiles.length,
        size: categoryFiles.reduce((sum, file) => sum + file.fileSize, 0)
      };
      return stats;
    }, {});

    return NextResponse.json({
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
        categoryStats
      }
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
