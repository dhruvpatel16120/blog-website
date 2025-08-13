"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';
import { iconOptions, getIconComponent } from '@/lib/icons';
export default function NewCategoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6', icon: 'CodeBracketIcon' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only admins in this panel; extra guard
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [session?.user?.role, status, router]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          color: form.color,
          icon: form.icon,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create category');
      router.push('/admin/categories?created=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (session?.user?.role !== 'ADMIN') return null;

  return (
    <AdminLayout title="New Category" adminSession={adminSession}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Category</h1>
        <Card className="p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input name="name" value={form.name} onChange={onChange} required placeholder="e.g., React" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                placeholder="Short description (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                name="color"
                value={form.color}
                onChange={onChange}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <div className="flex items-center space-x-3">
                <select name="icon" value={form.icon} onChange={onChange} className="h-10 rounded border dark:bg-gray-800 flex-1">
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="w-10 h-10 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  {(() => { const Icon = getIconComponent(form.icon); return <Icon className="w-6 h-6" />; })()}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Choose an icon to represent this category on the frontend.</p>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => router.push('/admin/categories')} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}


