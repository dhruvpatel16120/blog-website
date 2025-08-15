'use client';

import React from 'react';

/**
 * Renders HTML content with proper image handling and security
 * @param {Object} props
 * @param {string} props.content - The HTML content to render
 */
const HTMLRenderer = ({ content }) => {
  // Function to process HTML content and enhance images
  const processContent = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all img tags and enhance them
    const images = tempDiv.querySelectorAll('img');
    images.forEach((img) => {
      // Ensure image URLs are absolute and properly formatted
      if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
        // Convert relative URLs to absolute
        let absoluteUrl = img.src;
        if (!absoluteUrl.startsWith('/')) {
          absoluteUrl = `/${absoluteUrl}`;
        }
        
        // Ensure the URL starts with the correct path
        if (absoluteUrl.startsWith('/uploads/')) {
          // This is already correct
        } else if (absoluteUrl.includes('uploads/')) {
          // Extract the uploads part
          const uploadsIndex = absoluteUrl.indexOf('uploads/');
          absoluteUrl = `/${absoluteUrl.substring(uploadsIndex)}`;
        }
        
        img.src = absoluteUrl;
        console.log('Processed image URL:', absoluteUrl); // Debug log
      }
      
      // Add responsive classes and styling
      img.classList.add('max-w-full', 'h-auto', 'rounded-lg', 'shadow-md', 'my-4');
      
      // Add alt text if missing
      if (!img.alt) {
        img.alt = 'Blog post image';
      }
      
      // Add error handling
      img.onerror = function() {
        console.error('Failed to load image:', this.src);
        this.style.display = 'none';
        // Create a fallback element
        const fallback = document.createElement('div');
        fallback.className = 'bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-center text-gray-500 dark:text-gray-400 my-4';
        fallback.innerHTML = `<p>Image failed to load: ${this.src}</p>`;
        this.parentNode.insertBefore(fallback, this);
      };
      
      // Add loading state
      img.onload = function() {
        console.log('Image loaded successfully:', this.src);
      };
    });
    
    return tempDiv.innerHTML;
  };

  // Use useEffect to process content after component mounts
  const [processedContent, setProcessedContent] = React.useState('');
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setProcessedContent(processContent(content));
    }
  }, [content]);

  // If we're on the server or content hasn't been processed yet, render safely
  if (typeof window === 'undefined' || !processedContent) {
    return (
      <div 
        className="prose max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ 
          __html: content || '' 
        }} 
      />
    );
  }

  return (
    <div 
      className="prose max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ 
        __html: processedContent 
      }} 
    />
  );
};

export default HTMLRenderer;
