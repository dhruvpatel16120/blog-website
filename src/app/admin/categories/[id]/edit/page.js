"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';
import { iconOptions, getIconComponent } from '@/lib/icons';
export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6', icon: 'CodeBracketIcon' });
  const [initialName, setInitialName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${params.id}`);
        const data = await res.json();
        if (res.ok) {
          setForm({ name: data.name || '', description: data.description || '', color: data.color || '#3b82f6', icon: data.icon || 'CodeBracketIcon' });
          setInitialName(data.name || '');
          setLoaded(true);
        }
      } catch (e) {
        setError('Failed to load category');
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
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          color: form.color,
          icon: form.icon,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update category');
      router.push('/admin/categories?updated=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (session?.user?.type !== 'admin') return null;

  return (
    <AdminLayout title="Edit Category" adminSession={adminSession}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Category</h1>
        <Card className="p-6">
          {!loaded ? (
            <div>Loading category…</div>
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
                <input type="color" name="color" value={form.color} onChange={onChange} className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
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
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => router.push('/admin/categories')} disabled={saving}>
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


