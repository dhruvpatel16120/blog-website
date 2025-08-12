"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';
export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [form, setForm] = useState({ name: '', color: '#3b82f6' });
  const [initialName, setInitialName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/tags/${params.id}`);
        const data = await res.json();
        if (res.ok) {
          setForm({ name: data.name || '', color: data.color || '#3b82f6' });
          setInitialName(data.name || '');
          setLoaded(true);
        }
      } catch (e) {
        setError('Failed to load tag');
      }
    };
    if (params?.id) load();
  }, [params?.id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/tags/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), color: form.color }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update tag');
      router.push('/admin/tags?updated=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (session?.user?.type !== 'admin') return null;

  return (
    <AdminLayout title="Edit Tag" adminSession={adminSession}>
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Tag</h1>
        <Card className="p-6">
          {!loaded ? (
            <div>Loading tag…</div>
          ) : (
            <form onSubmit={onSave} className="space-y-4">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="name" value={form.name} onChange={onChange} required />
                {initialName && initialName !== form.name && (
                  <p className="mt-1 text-xs text-gray-500">Slug will be updated based on the new name</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input type="color" name="color" value={form.color} onChange={onChange} className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => router.push('/admin/tags')} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}


