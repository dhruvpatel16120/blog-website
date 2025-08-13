"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';
export default function NewTagPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [form, setForm] = useState({ name: '', color: '#3b82f6' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [session?.user?.type, status, router]);

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
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), color: form.color }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create tag');
      router.push('/admin/tags?created=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (session?.user?.type !== 'admin') return null;

  return (
    <AdminLayout title="New Tag" adminSession={adminSession}>
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Tag</h1>
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
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                name="color"
                value={form.color}
                onChange={onChange}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => router.push('/admin/tags')} disabled={submitting}>
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


