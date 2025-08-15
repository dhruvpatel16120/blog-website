import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// Enhanced analytics calculation
function calculateAdvancedAnalytics(files) {
  const analytics = {
    overview: {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
      averageFileSize: files.length > 0 ? files.reduce((sum, file) => sum + file.fileSize, 0) / files.length : 0,
      uniqueFileTypes: new Set(files.map(f => f.fileType)).size,
      uniqueMimeTypes: new Set(files.map(f => f.mimeType)).size
    },
    
    byCategory: {},
    byType: {},
    bySize: {
      tiny: 0,      // < 100KB
      small: 0,     // 100KB - 1MB
      medium: 0,    // 1MB - 10MB
      large: 0,     // 10MB - 100MB
      huge: 0       // > 100MB
    },
    
    byAge: {
      today: 0,     // < 1 day
      week: 0,      // 1-7 days
      month: 0,     // 8-30 days
      quarter: 0,   // 31-90 days
      year: 0,      // 91-365 days
      old: 0        // > 1 year
    },
    
    storageEfficiency: {
      imageCompression: 0,
      duplicateFiles: 0,
      unusedFiles: 0,
      optimizationPotential: 0
    },
    
    trends: {
      uploadsByDay: {},
      uploadsByWeek: {},
      uploadsByMonth: {}
    },
    
    recommendations: []
  };

  if (files.length === 0) return analytics;

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  files.forEach(file => {
    // Category breakdown
    if (!analytics.byCategory[file.category]) {
      analytics.byCategory[file.category] = { count: 0, size: 0, types: {} };
    }
    analytics.byCategory[file.category].count++;
    analytics.byCategory[file.category].size += file.fileSize;
    
    if (!analytics.byCategory[file.category].types[file.fileType]) {
      analytics.byCategory[file.category].types[file.fileType] = 0;
    }
    analytics.byCategory[file.category].types[file.fileType]++;

    // Type breakdown
    if (!analytics.byType[file.fileType]) {
      analytics.byType[file.fileType] = { count: 0, size: 0, categories: {} };
    }
    analytics.byType[file.fileType].count++;
    analytics.byType[file.fileType].size += file.fileSize;
    
    if (!analytics.byType[file.fileType].categories[file.category]) {
      analytics.byType[file.fileType].categories[file.category] = 0;
    }
    analytics.byType[file.fileType].categories[file.category]++;

    // Size breakdown
    if (file.fileSize < 100 * 1024) analytics.bySize.tiny++;
    else if (file.fileSize < 1024 * 1024) analytics.bySize.small++;
    else if (file.fileSize < 10 * 1024 * 1024) analytics.bySize.medium++;
    else if (file.fileSize < 100 * 1024 * 1024) analytics.bySize.large++;
    else analytics.bySize.huge++;

    // Age breakdown
    const fileDate = new Date(file.createdAt);
    if (fileDate > oneDayAgo) analytics.byAge.today++;
    else if (fileDate > oneWeekAgo) analytics.byAge.week++;
    else if (fileDate > oneMonthAgo) analytics.byAge.month++;
    else if (fileDate > threeMonthsAgo) analytics.byAge.quarter++;
    else if (fileDate > oneYearAgo) analytics.byAge.year++;
    else analytics.byAge.old++;

    // Trends
    const dayKey = fileDate.toISOString().split('T')[0];
    const weekKey = `${fileDate.getFullYear()}-W${Math.ceil((fileDate.getDate() + new Date(fileDate.getFullYear(), fileDate.getMonth(), 1).getDay()) / 7)}`;
    const monthKey = `${fileDate.getFullYear()}-${String(fileDate.getMonth() + 1).padStart(2, '0')}`;
    
    analytics.trends.uploadsByDay[dayKey] = (analytics.trends.uploadsByDay[dayKey] || 0) + 1;
    analytics.trends.uploadsByWeek[weekKey] = (analytics.trends.uploadsByWeek[weekKey] || 0) + 1;
    analytics.trends.uploadsByMonth[monthKey] = (analytics.trends.uploadsByMonth[monthKey] || 0) + 1;
  });

  // Calculate storage efficiency metrics
  const imageFiles = files.filter(f => f.fileType === 'image');
  const largeImages = imageFiles.filter(f => f.fileSize > 1024 * 1024); // > 1MB
  analytics.storageEfficiency.imageCompression = largeImages.length;
  
  // Find potential duplicates
  const fileMap = new Map();
  let duplicates = 0;
  files.forEach(file => {
    const key = `${file.originalName}_${file.fileSize}`;
    if (fileMap.has(key)) {
      duplicates++;
    } else {
      fileMap.set(key, file);
    }
  });
  analytics.storageEfficiency.duplicateFiles = duplicates;

  // Generate recommendations
  if (analytics.overview.totalSize > 100 * 1024 * 1024 * 1024) { // > 100GB
    analytics.recommendations.push('Consider implementing file compression for large files');
  }
  
  if (analytics.storageEfficiency.imageCompression > analytics.overview.totalFiles * 0.1) {
    analytics.recommendations.push('Many large images detected - consider image optimization');
  }
  
  if (analytics.byAge.old > analytics.overview.totalFiles * 0.3) {
    analytics.recommendations.push('High number of old files - consider archiving strategy');
  }
  
  if (duplicates > 0) {
    analytics.recommendations.push(`${duplicates} duplicate files found - consider cleanup`);
  }

  return analytics;
}

// Find duplicate files with detailed analysis
function findDetailedDuplicates(files) {
  const duplicates = [];
  const fileMap = new Map();
  const potentialDuplicates = new Map();
  
  files.forEach(file => {
    const key = `${file.originalName}_${file.fileSize}`;
    const nameKey = file.originalName.toLowerCase();
    const sizeKey = Math.floor(file.fileSize / (1024 * 1024)); // Group by MB
    
    if (fileMap.has(key)) {
      // Exact duplicate
      duplicates.push({
        type: 'exact',
        files: [fileMap.get(key), file],
        reason: 'Same name and size',
        savings: file.fileSize
      });
    } else {
      fileMap.set(key, file);
    }
    
    // Potential duplicates by name
    if (potentialDuplicates.has(nameKey)) {
      potentialDuplicates.get(nameKey).push(file);
    } else {
      potentialDuplicates.set(nameKey, [file]);
    }
  });
  
  // Find potential duplicates
  potentialDuplicates.forEach((filesWithSameName, name) => {
    if (filesWithSameName.length > 1) {
      const uniqueSizes = new Set(filesWithSameName.map(f => f.fileSize));
      if (uniqueSizes.size > 1) {
        duplicates.push({
          type: 'potential',
          files: filesWithSameName,
          reason: 'Same name, different sizes',
          savings: Math.max(...filesWithSameName.map(f => f.fileSize))
        });
      }
    }
  });
  
  return duplicates;
}

// GET endpoint for analytics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const category = searchParams.get('category') || 'all';
    const includeDuplicates = searchParams.get('duplicates') === 'true';
    const includeTrends = searchParams.get('trends') === 'true';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const categories = ['images', 'documents', 'cover-images'];
    
    let allFiles = [];

    // Scan all categories or specific category
    if (category === 'all') {
      for (const cat of categories) {
        const categoryDir = path.join(uploadsDir, cat);
        try {
          const categoryFiles = await scanDirectory(categoryDir, cat);
          allFiles = [...allFiles, ...categoryFiles];
        } catch (error) {
          console.error(`Error scanning category ${cat}:`, error);
        }
      }
    } else if (categories.includes(category)) {
      const categoryDir = path.join(uploadsDir, category);
      allFiles = await scanDirectory(categoryDir, category);
    }

    // Calculate analytics based on type
    let response = {};
    
    switch (type) {
      case 'overview':
        response.analytics = calculateAdvancedAnalytics(allFiles);
        break;
        
      case 'duplicates':
        response.duplicates = findDetailedDuplicates(allFiles);
        response.summary = {
          totalDuplicates: response.duplicates.length,
          potentialSavings: response.duplicates.reduce((sum, dup) => sum + dup.savings, 0)
        };
        break;
        
      case 'trends':
        const analytics = calculateAdvancedAnalytics(allFiles);
        response.trends = analytics.trends;
        response.byAge = analytics.byAge;
        break;
        
      case 'storage':
        const storageAnalytics = calculateAdvancedAnalytics(allFiles);
        response.storage = {
          efficiency: storageAnalytics.storageEfficiency,
          recommendations: storageAnalytics.recommendations,
          bySize: storageAnalytics.bySize
        };
        break;
        
      default:
        response.analytics = calculateAdvancedAnalytics(allFiles);
    }

    // Add duplicates if requested
    if (includeDuplicates && type !== 'duplicates') {
      response.duplicates = findDetailedDuplicates(allFiles);
    }

    // Add trends if requested
    if (includeTrends && type !== 'trends') {
      const analytics = calculateAdvancedAnalytics(allFiles);
      response.trends = analytics.trends;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to scan directory for files
async function scanDirectory(dirPath, category) {
  try {
    const files = await readdir(dirPath);
    const fileInfos = [];

    for (const fileName of files) {
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

// Helper function to get file info
async function getFileInfo(filePath, fileName, category) {
  try {
    const stats = await stat(filePath);
    const fileExtension = path.extname(fileName).toLowerCase();
    
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

    const originalName = fileName.split('-').slice(0, -2).join('-') + fileExtension;
    const now = new Date();
    const fileAge = Math.floor((now - stats.birthtime) / (1000 * 60 * 60 * 24));

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
      fileAge
    };
  } catch (error) {
    console.error(`Error getting file info for ${fileName}:`, error);
    return null;
  }
}
