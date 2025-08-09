"use client";

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input, Badge, Card } from '@/components/ui';

const Editor = dynamic(() => import('@tinymce/tinymce-react').then(m => m.Editor), { ssr: false });

export default function PostEditor({ mode = 'create', postId }) {
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

  useEffect(() => {
    (async () => {
      const [catsRes, tagsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/tags'),
      ]);
      const cats = await catsRes.json();
      const tgs = await tagsRes.json();
      setAllCategories(cats.categories || []);
      setAllTags(tgs.tags || []);
      if (mode === 'edit' && postId) {
        const res = await fetch(`/api/admin/posts/${postId}`);
        if (res.ok) {
          const p = await res.json();
          setTitle(p.title);
          setExcerpt(p.excerpt || '');
          setContent(p.content || '');
          setPublished(p.published);
          setFeatured(p.featured);
          setCoverImage(p.coverImage || '');
          setCategories(p.categories?.map(pc => pc.category.id) || []);
          setTags(p.tags?.map(pt => pt.tag.id) || []);
          setSeoTitle(p.seoTitle || '');
          setSeoDescription(p.seoDescription || '');
          setSeoImage(p.seoImage || '');
        }
      }
      setLoading(false);
    })();
  }, [mode, postId]);

  const submit = async () => {
    const payload = {
      title,
      content,
      excerpt,
      coverImage,
      published,
      featured,
      categories,
      tags,
      seoTitle,
      seoDescription,
      seoImage,
    };
    const endpoint = mode === 'edit' ? `/api/admin/posts/${postId}` : '/api/admin/posts';
    const method = mode === 'edit' ? 'PATCH' : 'POST';
    const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) window.location.href = '/admin/posts';
  };

  const schedule = async () => {
    const publishAt = prompt('Enter publish date-time (YYYY-MM-DD HH:mm)');
    if (!publishAt || !postId) return;
    const res = await fetch('/api/admin/posts/schedule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: postId, publishAt }),
    });
    if (res.ok) alert('Post scheduled');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{mode === 'edit' ? 'Edit Post' : 'New Post'}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Write and manage your content.</p>
      </div>
      <Card className="p-6 space-y-4">
        <Input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <Input placeholder="Excerpt" value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} />
        <div className="flex gap-2 items-center">
          <Input placeholder="Cover image URL" value={coverImage} onChange={(e)=>setCoverImage(e.target.value)} />
          <Button variant="outline" onClick={async ()=>{
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              const form = new FormData();
              form.append('file', file);
              const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
              if (res.ok) {
                const data = await res.json();
                setCoverImage(data.url);
              }
            };
            input.click();
          }}>Upload</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="SEO title" value={seoTitle} onChange={(e)=>setSeoTitle(e.target.value)} />
          <Input placeholder="SEO description" value={seoDescription} onChange={(e)=>setSeoDescription(e.target.value)} />
          <Input placeholder="SEO image URL" value={seoImage} onChange={(e)=>setSeoImage(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((c) => (
                <button key={c.id} type="button" onClick={()=> setCategories((prev)=> prev.includes(c.id) ? prev.filter(id=>id!==c.id) : [...prev, c.id])} className={`px-2 py-1 rounded border ${categories.includes(c.id) ? 'bg-primary text-white' : 'bg-transparent'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <button key={t.id} type="button" onClick={()=> setTags((prev)=> prev.includes(t.id) ? prev.filter(id=>id!==t.id) : [...prev, t.id])} className={`px-2 py-1 rounded border ${tags.includes(t.id) ? 'bg-primary text-white' : 'bg-transparent'}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={published} onChange={(e)=>setPublished(e.target.checked)} />
            <span>Published</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e)=>setFeatured(e.target.checked)} />
            <span>Featured</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ''}
            value={content}
            onEditorChange={setContent}
            init={{
              height: 500,
              menubar: false,
              plugins: 'lists link table code codesample',
              toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link table | code codesample',
              content_style: 'body { font-family: Inter, system-ui, sans-serif; font-size:14px }'
            }}
          />
        </div>
        <div className="flex justify-end gap-2">
          {mode === 'edit' && <Button variant="outline" onClick={schedule}>Schedule</Button>}
          <Button onClick={submit}>{mode === 'edit' ? 'Save Changes' : 'Create Post'}</Button>
        </div>
      </Card>
    </div>
  );
}


