"use client";

import { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  LinkIcon,
  CheckIcon,
  ShareIcon,
  GlobeAltIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function SocialShare({ title, slug, excerpt = '' }) {
  const [copied, setCopied] = useState(false);
  
  // Get the current URL (works on both client and server)
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `/blog/${slug}`;
  };

  const shareUrl = getShareUrl();
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedExcerpt = encodeURIComponent(excerpt || title);

  // Social media sharing URLs with enhanced parameters
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=TechBlog&hashtags=tech,blog`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedExcerpt}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Handle social media sharing
  const handleShare = (platform) => {
    const url = shareLinks[platform];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Share this post
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {/* Twitter */}
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Share on Twitter"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Twitter</span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          aria-label="Share on LinkedIn"
        >
          <GlobeAltIcon className="h-5 w-5" />
          <span className="hidden sm:inline">LinkedIn</span>
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          aria-label="Share on Facebook"
        >
          <ShareIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Facebook</span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Share on WhatsApp"
        >
          <EnvelopeIcon className="h-5 w-5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            copied 
              ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500' 
              : 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500'
          }`}
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Share URL display */}
      <div className="mt-4 p-3 rounded-lg bg-[var(--card)] text-[var(--foreground)] border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent text-sm bg-[var(--card)] text-[var(--foreground)] border-none outline-none"
            aria-label="Share URL"
          />
          <button
            onClick={copyToClipboard}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Copy URL"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}