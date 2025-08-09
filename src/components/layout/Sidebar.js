"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button, Input, Badge } from '@/components/ui'
import { useRouter } from 'next/navigation';

const Sidebar = ({ allPosts = [] }) => {
  const [email, setEmail] = useState('')
  const router = useRouter();

  // Real data for widgets
  const recentPosts = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  // Category/Tag Cloud
  const categorySet = new Set();
  const tagSet = new Set();
  allPosts.forEach(post => {
    (post.categories || []).forEach(c => categorySet.add(c));
    (post.tags || []).forEach(t => tagSet.add(t));
  });
  const allCategories = Array.from(categorySet);
  const allTags = Array.from(tagSet);

  const handleNewsletterSignup = (e) => {
    e.preventDefault()
    // Implement newsletter signup logic here
    setEmail('')
  }

  return (
    <aside className="space-y-8">
      {/* Sidebar content here, using real data only */}
    </aside>
  );
}

export default Sidebar; 