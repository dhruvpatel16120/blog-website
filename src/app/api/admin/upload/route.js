import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
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
  avatars: {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    directory: 'avatars'
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
    const category = formData.get('category') || 'images'; // Default to images
    const userId = formData.get('userId'); // Optional user ID for tracking
    
    console.log('Upload request received:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      category
    });
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get file type configuration
    const fileConfig = getFileTypeConfig(file);
    console.log('File config result:', fileConfig);
    
    if (!fileConfig) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Allowed types: images (jpg, png, webp, gif, svg), documents (pdf, doc, docx, txt)' 
      }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file, fileConfig);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Determine upload directory based on category or file type
    const uploadCategory = category === 'avatar' ? 'avatars' : fileConfig.directory;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', uploadCategory);
    
    // Create directory if it doesn't exist
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileName = generateUniqueFilename(file.name, uploadCategory);
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${uploadCategory}/${fileName}`;

    // activity removed

    return NextResponse.json({ 
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      category: uploadCategory,
      message: 'File uploaded successfully' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
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


