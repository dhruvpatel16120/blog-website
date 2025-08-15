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
      // Normalize URLs: convert same-origin absolute URLs to path-only; ensure /uploads paths are correct
      if (img.src) {
        try {
          const isData = img.src.startsWith('data:');
          if (!isData) {
            // Do not modify absolute URLs; only normalize relative-like ones
            if (!img.src.startsWith('http://') && !img.src.startsWith('https://') && !img.src.startsWith('//')) {
              if (!img.src.startsWith('/')) {
                img.src = `/${img.src}`;
              }
              if (!img.src.startsWith('/uploads/') && img.src.includes('uploads/')) {
                const idx = img.src.indexOf('uploads/');
                img.src = `/${img.src.substring(idx)}`;
              }
            }
          }
        } catch (_e) {
          // Ignore URL parsing errors and leave src as-is
        }
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
        const fallback = document.createElement('div');
        fallback.className = 'bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-center text-gray-500 dark:text-gray-400 my-4';
        fallback.innerHTML = `<p>Image failed to load: ${this.src}</p>`;
        this.parentNode && this.parentNode.insertBefore(fallback, this);
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
