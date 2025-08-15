import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile, mkdir, unlink, access, stat } from 'fs/promises';
import path from 'path';
// activity/audit removed

// File type configurations
const FILE_TYPES = {
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
function getFileTypeConfig(file) {
  const extension = path.extname(file.name).toLowerCase();
  
  for (const [category, config] of Object.entries(FILE_TYPES)) {
    if (config.types.includes(file.type) || config.extensions.includes(extension)) {
      return { category, ...config };
    }
  }
  
  return null;
}

// Helper function to generate unique filename
function generateUniqueFilename(originalName, category) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = path.extname(originalName);
  const baseName = path.basename(originalName, fileExtension);
  
  // Sanitize base name
  const sanitizedName = baseName
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${sanitizedName}-${timestamp}-${randomString}${fileExtension}`;
}

// Helper function to validate file
function validateFile(file, config) {
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

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const requestedCategory = (formData.get('category') || 'images').toString(); 
    const userId = formData.get('userId'); // Optional user ID for tracking
    
    console.log('Upload request received:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      requestedCategory
    });
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get file type configuration (base on actual mime/extension)
    const detectedConfig = getFileTypeConfig(file);
    console.log('File config result:', detectedConfig, 'requested:', requestedCategory);
    
    if (!detectedConfig) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Allowed types: images (jpg, png, webp, gif, svg), documents (pdf, doc, docx, txt)' 
      }, { status: 400 });
    }

    // Determine target category/config: honor requestedCategory if valid for the file, otherwise fallback to detected
    let targetCategory = detectedConfig.directory;
    let targetConfig = detectedConfig;
    
    // If requestedCategory is valid and matches the file type, use it
    if (requestedCategory && FILE_TYPES[requestedCategory]) {
      const requestedConfig = { category: requestedCategory, ...FILE_TYPES[requestedCategory] };
      // Check if the file type is compatible with the requested category
      if (requestedConfig.types.includes(file.type) || requestedConfig.extensions.includes(path.extname(file.name).toLowerCase())) {
        const validationForRequested = validateFile(file, requestedConfig);
        if (!validationForRequested.valid) {
          return NextResponse.json({ error: validationForRequested.error }, { status: 400 });
        }
        targetCategory = requestedConfig.directory;
        targetConfig = requestedConfig;
      }
    }
    
    // Validate against the final target config
    const validation = validateFile(file, targetConfig);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Determine upload directory
    const uploadCategory = targetCategory;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', uploadCategory);
    
    // Create directory if it doesn't exist
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileName = generateUniqueFilename(file.name, uploadCategory);
    const filePath = path.join(uploadsDir, fileName);
    
    console.log('Upload details:', {
      uploadCategory,
      uploadsDir,
      fileName,
      filePath
    });

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Build URLs using NEXTAUTH_URL as base
    const publicUrl = `/uploads/${uploadCategory}/${fileName}`;
    const baseUrl = process.env.NEXTAUTH_URL || '';
    let absoluteUrl = publicUrl;
    try {
      if (baseUrl) {
        absoluteUrl = new URL(publicUrl, baseUrl).toString();
      }
    } catch (_e) {
      // fallback to path-only if env is invalid
      absoluteUrl = publicUrl;
    }
    
    console.log('Upload completed successfully:', {
      originalName: file.name,
      fileName: fileName,
      uploadCategory: uploadCategory,
      publicUrl: publicUrl,
      absoluteUrl: absoluteUrl,
      filePath: filePath,
      fileSize: file.size,
      fileType: file.type
    });

    // activity removed

    return NextResponse.json({ 
      url: absoluteUrl,
      path: publicUrl,
      fileName: fileName,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      category: uploadCategory,
      message: 'File uploaded successfully' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    if (error.code === 'ENOSPC') {
      return NextResponse.json({ error: 'Disk space full' }, { status: 500 });
    }
    if (error.code === 'EACCES') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 500 });
    }
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Directory not found' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}

// DELETE endpoint to remove uploaded files
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    const userId = searchParams.get('userId');

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Extract file path from URL
    const filePath = path.join(process.cwd(), 'public', fileUrl);
    
    // Security check: ensure the file is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Delete the file
    await unlink(filePath);

    // activity removed

    return NextResponse.json({ 
      message: 'File deleted successfully' 
    });

  } catch (error) {
    console.error('Delete error:', error);
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

// GET endpoint to test file accessibility
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }
    
    // Security check: ensure the file is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    
    // Check if file exists
    try {
      await access(fullPath);
      const stats = await stat(fullPath);
      return NextResponse.json({ 
        exists: true,
        size: stats.size,
        path: filePath,
        fullPath: fullPath
      });
    } catch (error) {
      return NextResponse.json({ 
        exists: false,
        error: error.message,
        path: filePath,
        fullPath: fullPath
      });
    }
    
  } catch (error) {
    console.error('File check error:', error);
    return NextResponse.json({ error: 'File check failed' }, { status: 500 });
  }
}


