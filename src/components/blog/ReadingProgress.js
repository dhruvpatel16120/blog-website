"use client"

import React, { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const total = rect.height - windowHeight;
      const scrolled = window.scrollY - article.offsetTop;
      const percent = Math.max(0, Math.min(1, scrolled / total));
      setProgress(percent * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-transparent">
      <div
        className="h-1 bg-primary transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}