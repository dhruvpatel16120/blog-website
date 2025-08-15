"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Button, Input, Badge, Card, Modal, Toast } from '@/components/ui';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ClockIcon,
  PhotoIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  SparklesIcon,
  GlobeAltIcon,
  TagIcon,
  FolderIcon,
  CogIcon,
  CheckIcon,
  PlusIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Editor = dynamic(() => import('@tinymce/tinymce-react').then(m => m.Editor), { ssr: false });

export default function PostEditor({ mode = 'create', postId }) {
  const { data: session, status: sessionStatus } = useSession();
  // ... existing state variables ...
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoImage, setSeoImage] = useState('');
  const [loading, setLoading] = useState(mode === 'edit');
  const [editorMode, setEditorMode] = useState('rich');
  const [markdownContent, setMarkdownContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [uploading, setUploading] = useState(false);
  const [contentType, setContentType] = useState('html'); // 'html', 'markdown', 'normal'
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // New advanced features
  const [showImageManager, setShowImageManager] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [readingTime, setReadingTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageSearch, setImageSearch] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const showToastMessageRef = useRef((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  });
  const autoSaveRef = useRef(null);
  const fetchPostRef = useRef(null);
  const fetchCategoriesAndTagsRef = useRef(null);
  const fetchUsersRef = useRef(null);
  // Cover image picker from files
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [pickerFiles, setPickerFiles] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerCategory, setPickerCategory] = useState('cover-images'); // 'cover-images' | 'images'
  const [pickerSearch, setPickerSearch] = useState('');

  // Fetch post data for edit mode
  useEffect(() => {
    if (mode === 'edit' && postId) {
      fetchPostRef.current && fetchPostRef.current();
    }
  }, [mode, postId]);

  // Fetch categories and tags
  useEffect(() => {
    (async () => {
      try {
        if (fetchCategoriesAndTagsRef.current) {
          await fetchCategoriesAndTagsRef.current();
        }
      } catch (_) {}
    })();
  }, []);

  // Fetch users for author selector
  useEffect(() => {
    (async () => {
      try {
        if (fetchUsersRef.current) {
          await fetchUsersRef.current();
        }
      } catch (_) {}
    })();
  }, []);

  // Set default author when creating new post
  useEffect(() => {
    if (mode === 'create' && allUsers.length > 0 && !selectedAuthor) {
      // Find the current admin user and set them as default author
      const currentAdmin = allUsers.find(user => 
        user.email === session?.user?.email || user.username === session?.user?.username
      );
      if (currentAdmin) {
        setSelectedAuthor(currentAdmin.id);
      }
    }
  }, [mode, allUsers, selectedAuthor, session]);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const submitRef = useRef(null);
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        submitRef.current && submitRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitRef.current && submitRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowPreviewModal(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, postId, hasUnsavedChanges]);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        const post = data.data;
        
        if (!post) {
          showToastMessageRef.current('Post not found', 'error');
          setLoading(false);
          return;
        }

        setTitle(post.title || '');
        setExcerpt(post.excerpt || '');
        setContent(post.content || '');
        setMarkdownContent(post.content || '');
        setPublished(post.published || false);
        setFeatured(post.featured || false);
        setCoverImage(post.coverImage || '');
        setCategories(post.categories?.map(c => c.id) || []);
        setTags(post.tags?.map(t => t.id) || []);
        setSeoTitle(post.seoTitle || '');
        setSeoDescription(post.seoDescription || '');
        setSeoImage(post.seoImage || '');
        setCustomSlug(post.slug || '');
        setMetaKeywords(post.metaKeywords || '');
        setReadingTime(post.readingTime || 0);
        setWordCount(post.wordCount || 0);
        setCharCount(post.charCount || 0);
        setContentType(post.contentType || 'html');
        setSelectedAuthor(post.authorId || '');
        
        // Set editor mode based on content type
        if (post.contentType === 'markdown') {
          setEditorMode('markdown');
        } else if (post.contentType === 'html') {
          setEditorMode('rich');
        } else {
          setEditorMode('normal');
        }
        
        // Calculate stats from content
        if (post.content) {
          calculateStats(post.content);
        }
        
        setHasUnsavedChanges(false);
        setLoading(false);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToastMessageRef.current(errorData.error || 'Failed to fetch post', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToastMessageRef.current('Network error: Failed to fetch post', 'error');
      setLoading(false);
    }
  }, [postId]);

  // Keep refs in sync for lint-satisfying, side-effect-free calls
  useEffect(() => {
    fetchPostRef.current = fetchPost;
  }, [fetchPost]);

  const fetchCategoriesAndTags = useCallback(async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/tags')
      ]);
      
      if (categoriesRes.ok && tagsRes.ok) {
        const categoriesData = await categoriesRes.json();
        const tagsData = await tagsRes.json();
        setAllCategories(categoriesData.data || []);
        setAllTags(tagsData.data || []);
      } else {
        if (!categoriesRes.ok) {
          console.error('Failed to fetch categories:', categoriesRes.status);
        }
        if (!tagsRes.ok) {
          console.error('Failed to fetch tags:', tagsRes.status);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToastMessageRef.current('Failed to fetch categories and tags', 'error');
    }
  }, []);

  useEffect(() => {
    fetchCategoriesAndTagsRef.current = fetchCategoriesAndTags;
  }, [fetchCategoriesAndTags]);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.data || []);
      } else {
        console.error('Failed to fetch users:', res.status);
        showToastMessageRef.current('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      showToastMessageRef.current('Failed to fetch users', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  }, [fetchUsers]);

  // New advanced functions
  const calculateStats = (text) => {
    if (!text || typeof text !== 'string') {
      setWordCount(0);
      setCharCount(0);
      setReadingTime(0);
      return;
    }
    
    const cleanText = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = cleanText.length;
    const time = Math.max(1, Math.ceil(words / 200)); // Minimum 1 minute reading time
    
    setWordCount(words);
    setCharCount(chars);
    setReadingTime(time);
  };



  const autoSaveContent = async (content) => {
    if (!postId || !hasUnsavedChanges || !autoSave) return;
    
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, autoSave: true })
      });
      
      if (res.ok) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        // Don't show toast for auto-save to avoid spam
      } else {
        console.error('Auto-save failed:', res.status);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const showToastMessage = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // Keep a stable ref for early/late uses
  useEffect(() => {
    showToastMessageRef.current = showToastMessage;
  }, [showToastMessage]);

  const handleImageUpload = async (file, targetCategory = 'images') => {
    try {
      // Validate file
      if (!file) return null;
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showToastMessage('File size must be less than 10MB', 'error');
        return null;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToastMessage('Only JPEG, PNG, GIF, and WebP images are allowed', 'error');
        return null;
      }
      
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      form.append('category', targetCategory);
      
      const res = await fetch('/api/admin/upload', { 
        method: 'POST', 
        body: form 
      });
      
      if (res.ok) {
        const data = await res.json();
        const imageData = { 
          url: data.url, 
          name: file.name, 
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        setUploadedImages(prev => [...prev, imageData]);
        return data.url;
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToastMessage(error.message || 'Image upload failed', 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleBulkImageUpload = async (files) => {
    const uploadPromises = Array.from(files).map(file => handleImageUpload(file, 'images'));
    const results = await Promise.all(uploadPromises);
    const successful = results.filter(url => url);
    showToastMessage(`${successful.length} images uploaded successfully`);
  };

  const handleCoverImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = await handleImageUpload(file, 'cover-images');
        if (url) {
          setCoverImage(url);
          showToastMessage('Cover image uploaded successfully');
        }
      }
    };
    input.click();
  };

  // Fetch files for cover image picker
  const fetchPickerFiles = useCallback(async () => {
    try {
      setPickerLoading(true);
      const params = new URLSearchParams({
        category: pickerCategory,
        limit: '50',
      });
      if (pickerSearch) params.set('search', pickerSearch);
      const res = await fetch(`/api/admin/files?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load files');
      }
      const data = await res.json();
      setPickerFiles(Array.isArray(data.files) ? data.files : []);
    } catch (e) {
      console.error('Failed to fetch files for picker', e);
      setPickerFiles([]);
    } finally {
      setPickerLoading(false);
    }
  }, [pickerCategory, pickerSearch]);

  useEffect(() => {
    if (showCoverPicker) {
      fetchPickerFiles();
    }
  }, [showCoverPicker, pickerCategory, pickerSearch, fetchPickerFiles]);

  const handleSeoImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = await handleImageUpload(file, 'images');
        if (url) {
          setSeoImage(url);
          showToastMessage('SEO image uploaded successfully');
        }
      }
    };
    input.click();
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    if (!customSlug) {
      setCustomSlug(generateSlug(newTitle));
    }
    setHasUnsavedChanges(true);
  };

  const handleExcerptChange = (newExcerpt) => {
    setExcerpt(newExcerpt);
    setHasUnsavedChanges(true);
  };

  const handleCoverImageChange = (newImage) => {
    setCoverImage(newImage);
    setHasUnsavedChanges(true);
  };

  const handleCategoriesChange = (newCategories) => {
    setCategories(newCategories);
    setHasUnsavedChanges(true);
  };

  const handleTagsChange = (newTags) => {
    setTags(newTags);
    setHasUnsavedChanges(true);
  };

  const handleSeoChange = (field, value) => {
    switch (field) {
      case 'title':
        setSeoTitle(value);
        break;
      case 'description':
        setSeoDescription(value);
        break;
      case 'image':
        setSeoImage(value);
        break;
      case 'keywords':
        setMetaKeywords(value);
        break;
    }
    setHasUnsavedChanges(true);
  };

  const generateSeoFields = () => {
    if (!title) return;
    setSeoTitle(seoTitle || title);
    setSeoDescription(seoDescription || excerpt || title.substring(0, 160));
    setMetaKeywords(metaKeywords || title.split(' ').slice(0, 5).join(', '));
  };

  const validateForm = useCallback(() => {
    const errors = [];
    
    // Required fields
    if (!title.trim()) errors.push('Title is required');
    if (!content.trim()) errors.push('Content is required');
    if (categories.length === 0) errors.push('At least one category is required');
    if (tags.length === 0) errors.push('At least one tag is required');
    
    // Length validations
    if (title.trim().length < 5) errors.push('Title must be at least 5 characters');
    if (title.trim().length > 200) errors.push('Title must be less than 200 characters');
    if (excerpt.trim().length > 500) errors.push('Excerpt must be less than 500 characters');
    if (content.trim().length < 50) errors.push('Content must be at least 50 characters');
    
    // SEO validations
    if (seoTitle && seoTitle.length > 60) errors.push('SEO title should be under 60 characters');
    if (seoDescription && seoDescription.length > 160) errors.push('SEO description should be under 160 characters');
    
    // URL validations
    if (coverImage && !isValidUrl(coverImage)) errors.push('Cover image must be a valid URL');
    if (seoImage && !isValidUrl(seoImage)) errors.push('SEO image must be a valid URL');
    
    if (errors.length > 0) {
      showToastMessage(errors.join(', '), 'error');
      return false;
    }
    return true;
  }, [title, content, categories, tags, excerpt, seoTitle, seoDescription, coverImage, seoImage, showToastMessage]);

  const isValidUrl = (value) => {
    if (!value || typeof value !== 'string') return false;
    const v = value.trim();
    // Allow relative paths and data URLs used by our uploader/editor
    if (v.startsWith('/') || v.startsWith('data:')) return true;
    // Allow protocol-relative URLs (e.g., //cdn.example.com/img.png)
    if (v.startsWith('//')) return true;
    // Allow http/https absolute URLs
    if (/^https?:\/\//i.test(v)) return true;
    return false;
  };

  const submit = useCallback(async () => {
    if (!title || !content) {
      showToastMessage('Title and content are required', 'error');
      return;
    }

    // If no author selected, backend will ensure an author mapping for admin

    if (!validateForm()) return;
    
    const payload = {
      title: title.trim(),
      content: contentType === 'markdown' ? markdownContent : content,
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim(),
      published,
      featured,
      categories,
      tags,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      seoImage: seoImage.trim(),
      customSlug: customSlug.trim() || generateSlug(title),
      metaKeywords: metaKeywords.trim(),
      readingTime,
      wordCount,
      charCount,
      contentType, // Add content type to payload
      authorId: selectedAuthor || undefined, // Add author ID to payload
    };

    if (scheduledDate && scheduledTime && !published) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        showToastMessage('Scheduled date must be in the future', 'error');
        return;
      }
      payload.publishedAt = scheduledDateTime.toISOString();
    }

    const endpoint = mode === 'edit' ? `/api/admin/posts/${postId}` : '/api/admin/posts';
    const method = mode === 'edit' ? 'PATCH' : 'POST';
    
    try {
      setLoading(true);
      const res = await fetch(endpoint, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      if (res.ok) {
        const result = await res.json();
        showToastMessage(`Post ${mode === 'edit' ? 'updated' : 'created'} successfully`);
        setHasUnsavedChanges(false);
        
        // Redirect after a short delay
        setTimeout(() => {
          if (mode === 'edit') {
            window.location.href = '/admin/posts';
          } else {
            window.location.href = `/admin/posts/${result.data?.id || ''}/edit`;
          }
        }, 1500);
      } else {
        const error = await res.json().catch(() => ({}));
        showToastMessage(error.error || `Failed to ${mode === 'edit' ? 'update' : 'create'} post`, 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToastMessage('Network error: Failed to save post', 'error');
    } finally {
      setLoading(false);
    }
  }, [mode, postId, title, content, markdownContent, excerpt, coverImage, published, featured, categories, tags, seoTitle, seoDescription, seoImage, customSlug, metaKeywords, readingTime, wordCount, charCount, scheduledDate, scheduledTime, contentType, selectedAuthor, showToastMessage, validateForm]);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  const schedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      showToastMessage('Please set both date and time for scheduling', 'error');
      return;
    }
    
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      showToastMessage('Scheduled date must be in the future', 'error');
      return;
    }

    const payload = {
      id: postId,
      publishedAt: scheduledDateTime.toISOString(),
      published: false
    };

    try {
      setLoading(true);
      const res = await fetch('/api/admin/posts/schedule', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        showToastMessage('Post scheduled successfully');
        setScheduledDate('');
        setScheduledTime('');
        setPublished(false);
      } else {
        const error = await res.json().catch(() => ({}));
        showToastMessage(error.error || 'Failed to schedule post', 'error');
      }
    } catch (error) {
      console.error('Schedule error:', error);
      showToastMessage('Network error: Failed to schedule post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdownPreview = () => {
    if (!markdownContent.trim()) {
      return (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          No content to preview
        </div>
      );
    }
    
    // Enhanced markdown preview with more features
    let preview = markdownContent
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')
      // Line breaks
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, '<br>');
    
    // Wrap in paragraphs
    preview = `<p class="mb-4">${preview}</p>`;
    
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div 
          className="markdown-preview"
          dangerouslySetInnerHTML={{ __html: preview }} 
        />
      </div>
    );
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
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {mode === 'edit' ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-blue-100 mt-2">
              Advanced content editor with professional features
            </p>
            {mode === 'edit' && (
              <div className="space-y-2 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200 text-sm">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {published ? 'Published' : 'Draft'}
                  </span>
                  {featured && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-xs text-blue-200">
                  URL: yourdomain.com/blog/{customSlug || generateSlug(title)}
                </div>
              </div>
            )}
            <div className="flex items-center space-x-4 mt-3 text-xs text-blue-200">
              <span>⌘+S to save</span>
              <span>⌘+Enter to publish</span>
              <span>⌘+Shift+P to preview</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{wordCount}</div>
              <div className="text-blue-200">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{readingTime}</div>
              <div className="text-blue-200">Min Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{charCount}</div>
              <div className="text-blue-200">Characters</div>
            </div>
            {mode === 'edit' && postId && (
              <div className="text-center">
                <div className="text-2xl font-bold">#{postId}</div>
                <div className="text-blue-200">Post ID</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-save Status and Post Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lastSaved && (
          <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-6 w-6 text-green-600" />
              <div>
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Auto-save is enabled
                </div>
              </div>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded border-green-300"
              />
              <span className="text-sm text-green-700 dark:text-green-300">Auto-save</span>
            </label>
          </div>
        )}
        
        {/* Post Statistics */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-800 dark:text-blue-200 text-sm font-semibold">Post Statistics</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              hasUnsavedChanges 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' 
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {hasUnsavedChanges ? 'Modified' : 'Saved'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-700 dark:text-blue-300 text-lg">{wordCount}</div>
              <div className="text-blue-600 dark:text-blue-400">Words</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-700 dark:text-blue-300 text-lg">{readingTime}</div>
              <div className="text-blue-600 dark:text-blue-400">Min Read</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-700 dark:text-blue-300 text-lg">{charCount}</div>
              <div className="text-blue-600 dark:text-blue-400">Characters</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Excerpt */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Post Title *
                </label>
                <Input 
                  placeholder="Enter your post title..." 
                  value={title} 
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-xl font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  placeholder="Brief description of your post..."
                  value={excerpt}
                  onChange={(e) => handleExcerptChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-20"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {excerpt.length}/500 characters
                </div>
              </div>
            </div>
          </Card>

          {/* Content Editor */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Content Editor
                </h3>
                <div className="flex items-center space-x-2">
                  {/* Content Type Selector */}
                  <div className="flex items-center space-x-2 mr-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                    <select
                      value={contentType}
                      onChange={(e) => {
                        setContentType(e.target.value);
                        if (e.target.value === 'markdown') {
                          setEditorMode('markdown');
                        } else if (e.target.value === 'html') {
                          setEditorMode('rich');
                        } else {
                          setEditorMode('normal');
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="html">HTML (Rich Text)</option>
                      <option value="markdown">Markdown</option>
                      <option value="normal">Normal Text</option>
                    </select>
                  </div>
                  
                  <Button
                    variant={editorMode === 'rich' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setEditorMode('rich');
                      setShowPreview(false);
                    }}
                    type="button"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Rich Text
                  </Button>
                  <Button
                    variant={editorMode === 'markdown' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setEditorMode('markdown');
                      setShowPreview(false);
                    }}
                    type="button"
                  >
                    <CodeBracketIcon className="h-4 w-4 mr-2" />
                    Markdown
                  </Button>
                  {editorMode === 'markdown' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      type="button"
                    >
                      {showPreview ? <EyeSlashIcon className="h-4 w-4 mr-2" /> : <EyeIcon className="h-4 w-4 mr-2" />}
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  )}
                  <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                    Current: {editorMode === 'rich' ? 'Rich Text Editor' : editorMode === 'markdown' ? 'Markdown Editor' : 'Normal Text Editor'}
                  </div>
                </div>
              </div>

              {editorMode === 'rich' ? (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ''}
                    value={content}
                    onEditorChange={(newContent) => {
                      setContent(newContent);
                      setMarkdownContent(newContent);
                      calculateStats(newContent);
                      setHasUnsavedChanges(true);
                      
                      if (autoSave && autoSaveRef.current) {
                        clearTimeout(autoSaveRef.current);
                        autoSaveRef.current = setTimeout(() => {
                          autoSaveContent(newContent);
                        }, 3000);
                      }
                    }}
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount',
                        'codesample', 'emoticons', 'quickbars'
                      ],
                      toolbar: [
                        'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify',
                        'bullist numlist outdent indent | link image media table | code codesample | fullscreen preview'
                      ],
                      content_style: 'body { font-family: Inter, system-ui, sans-serif; font-size: 16px; line-height: 1.6 }',
                      automatic_uploads: true,
                      images_reuse_filename: false,
                      images_file_types: 'jpeg,jpg,jpe,png,webp,gif,svg',
                      file_picker_types: 'image',
                      relative_urls: false,
                      remove_script_host: false,
                      convert_urls: false,
                      document_base_url: '/',
                      file_picker_callback: (cb) => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const form = new FormData();
                          form.append('file', file);
                          form.append('category', 'images');
                          try {
                            const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
                            if (!res.ok) {
                              const err = await res.json().catch(() => ({}));
                              throw new Error(err.error || 'Upload failed');
                            }
                            const data = await res.json();
                            const imageUrl = typeof data.url === 'string' ? data.url : (data.path || '');
                            console.log('File picker upload result:', {
                              originalUrl: data.url,
                              finalUrl: imageUrl,
                              filename: file.name
                            });
                            cb(imageUrl, { title: file.name });
                          } catch (err) {
                            console.error('File picker upload error', err);
                          }
                        };
                        input.click();
                      },
                      images_upload_handler: async (blobInfo) => {
                        try {
                          const blob = blobInfo.blob();
                          const form = new FormData();
                          form.append('file', blob, blobInfo.filename());
                          form.append('category', 'images');
                          const res = await fetch('/api/admin/upload', {
                            method: 'POST',
                            body: form,
                          });
                          if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err.error || 'Upload failed');
                          }
                          const data = await res.json();
                          if (!data?.url) {
                            throw new Error('Invalid upload response');
                          }
                          const finalUrl = data.url;
                          console.log('TinyMCE image upload result:', {
                            originalUrl: data.url,
                            finalUrl: finalUrl,
                            filename: blobInfo.filename()
                          });
                          return finalUrl;
                        } catch (error) {
                          console.error('Image upload error:', error);
                          throw error;
                        }
                      },
                      image_advtab: true,
                      image_caption: true,
                      image_dimensions: true,
                      image_class_list: [
                        { title: 'Responsive', value: 'img-fluid' },
                        { title: 'Thumbnail', value: 'img-thumbnail' },
                        { title: 'Rounded', value: 'rounded' }
                      ],
                      quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                      extended_valid_elements: 'img[class|src|alt|title|width|height|style],table[style|class],thead,tbody,tfoot,tr,td[colspan|rowspan|style|class],th[colspan|rowspan|style|class],caption,colgroup,col[span|width|style|class]',
                      // Remove configs tied to disabled plugins
                      ...(process.env.NEXT_PUBLIC_TINYMCE_API_KEY ? {} : {
                        branding: false,
                        promotion: false,
                        elementpath: false,
                        statusbar: false
                      })
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={markdownContent}
                    onChange={(e) => {
                      setMarkdownContent(e.target.value);
                      setContent(e.target.value);
                      calculateStats(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
                    placeholder="Write your content in Markdown..."
                  />
                  {showPreview && (
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Live Preview:</h4>
                      {renderMarkdownPreview()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                Publishing Options
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={published} 
                      onChange={(e) => {
                        setPublished(e.target.checked);
                        setHasUnsavedChanges(true);
                      }} 
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Publish immediately</span>
                  </label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {published ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                <label className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={featured} 
                    onChange={(e) => {
                      setFeatured(e.target.checked);
                      setHasUnsavedChanges(true);
                    }} 
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured post</span>
                </label>
              </div>

              {/* Scheduling */}
              {!published && (
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Schedule Publication
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="text-sm"
                    />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  {scheduledDate && scheduledTime && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={schedule}
                      className="w-full"
                    >
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Schedule Post
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Author Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Author
              </h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Author
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => {
                    setSelectedAuthor(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={usersLoading}
                >
                  <option value="">Select an author...</option>
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.username})
                    </option>
                  ))}
                </select>
                {usersLoading && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading users...
                  </div>
                )}
                {selectedAuthor && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ✓ Author selected
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Categories and Tags */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FolderIcon className="h-5 w-5 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((c) => (
                    <button 
                      key={c.id} 
                      type="button" 
                      onClick={() => handleCategoriesChange(
                        categories.includes(c.id) ? categories.filter(id => id !== c.id) : [...categories, c.id]
                      )} 
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        categories.includes(c.id) 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                {categories.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Selected: {categories.length} category{categories.length !== 1 ? 'ies' : 'y'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {allTags.map((t) => (
                    <button 
                      key={t.id} 
                      type="button" 
                      onClick={() => handleTagsChange(
                        tags.includes(t.id) ? tags.filter(id => id !== t.id) : [...tags, t.id]
                      )} 
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        tags.includes(t.id) 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                {tags.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Selected: {tags.length} tag{tags.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Cover Image */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2" />
                Cover Image
              </h3>
              <div className="space-y-3">
                <Input 
                  placeholder="Cover image URL" 
                  value={coverImage} 
                  onChange={(e) => handleCoverImageChange(e.target.value)} 
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCoverImageUpload}
                    disabled={uploading}
                  >
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setPickerCategory('cover-images');
                      setShowCoverPicker(true);
                    }}
                  >
                    <FolderIcon className="h-4 w-4 mr-2" />
                    Pick from Files
                  </Button>
                </div>
                {coverImage && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <Image 
                      src={coverImage} 
                      alt="Cover" 
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Advanced Options */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Advanced Options
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Slug
                  </label>
                  <Input
                    placeholder="custom-post-url"
                    value={customSlug}
                    onChange={(e) => {
                      setCustomSlug(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Current: {customSlug || generateSlug(title) || 'Will be generated from title'}
                  </div>
                  {(customSlug || title) && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      URL: yourdomain.com/blog/{customSlug || generateSlug(title)}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta Keywords
                  </label>
                  <textarea
                    placeholder="keyword1, keyword2, keyword3"
                    value={metaKeywords}
                    onChange={(e) => handleSeoChange('keywords', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm resize-none h-16"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* SEO Panel */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <GlobeAltIcon className="h-5 w-5 mr-2" />
                  SEO Settings
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateSeoFields}
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Auto-generate
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SEO Title
                  </label>
                  <Input 
                    placeholder="SEO title" 
                    value={seoTitle} 
                    onChange={(e) => handleSeoChange('title', e.target.value)} 
                    className="text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {seoTitle.length}/60 characters
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    placeholder="SEO description"
                    value={seoDescription}
                    onChange={(e) => handleSeoChange('description', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm resize-none h-16"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {seoDescription.length}/160 characters
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SEO Image
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="SEO image URL" 
                      value={seoImage} 
                      onChange={(e) => handleSeoChange('image', e.target.value)} 
                      className="text-sm flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSeoImageUpload}
                      disabled={uploading}
                    >
                      <PhotoIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 border-t border-gray-200 dark:border-gray-700 gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setShowExitConfirm(true)} type="button">
            Cancel
          </Button>
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                You have unsaved changes
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowPreviewModal(true)} type="button">
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={submit} 
            disabled={!title.trim() || !content.trim() || loading}
            className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
            type="button"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'edit' ? 'Updating...' : 'Publishing...'}
              </div>
            ) : (
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-2" />
                {mode === 'edit' ? 'Update Post' : 'Publish Post'}
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Preview"
        size="xl"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="prose max-w-none dark:prose-invert">
            {editorMode === 'markdown' ? (
              renderMarkdownPreview()
            ) : (
              <div className="prose max-w-none dark:prose-invert">
                {/* Ensure relative image URLs render */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: (content || '<p><em>No content</em></p>').replace(/src=\"(?!https?:\/\/)([^\"]+)\"/g, 'src="/$1"')
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowPreviewModal(false)} type="button">
            Close
          </Button>
        </div>
      </Modal>

      {/* Image Manager Modal */}
      <Modal
        isOpen={showImageManager}
        onClose={() => setShowImageManager(false)}
        title="Image Manager"
        size="4xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search images..."
                value={imageSearch}
                onChange={(e) => setImageSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleBulkImageUpload(e.target.files)}
                className="hidden"
                id="bulk-upload"
              />
              <label htmlFor="bulk-upload">
                <Button variant="outline" as="span" type="button">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              </label>
              <Button onClick={() => setShowImageManager(false)} type="button">
                Done
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {uploadedImages
              .filter(img => img.name.toLowerCase().includes(imageSearch.toLowerCase()))
              .map((img, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <Image 
                      src={img.url} 
                      alt={img.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCoverImage(img.url);
                        setShowImageManager(false);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      type="button"
                    >
                      Use as Cover
                    </Button>
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                    {img.name}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      {/* Cover Image Picker Modal */}
      <Modal
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        title="Select Cover Image"
        size="4xl"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={pickerCategory}
                onChange={(e) => setPickerCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="cover-images">Cover Images</option>
                <option value="images">Images</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchPickerFiles} disabled={pickerLoading}>
                {pickerLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search files..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
              />
            </div>
          </div>

          {pickerLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pickerFiles.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pickerFiles
                .filter(f => f.fileType === 'image')
                .map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCoverImage(file.url);
                      setHasUnsavedChanges(true);
                      setShowCoverPicker(false);
                      showToastMessage('Cover image selected');
                    }}
                    type="button"
                    className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                      <Image src={file.url} alt={file.originalName} width={400} height={400} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 text-left">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{file.originalName}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCoverPicker(false)} type="button">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Unsaved Changes"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            You have unsaved changes. Are you sure you want to leave? All unsaved changes will be lost.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowExitConfirm(false)} type="button">
              Continue Editing
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => { window.location.href = '/admin/posts'; }}
              type="button"
            >
              Leave Anyway
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}