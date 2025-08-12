"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button } from '@/components/ui';
export default function DeleteCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [category, setCategory] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${params.id}`);
        const data = await res.json();
        if (res.ok) setCategory(data);
        else setError(data.error || 'Failed to load category');
      } catch (e) {
        setError('Failed to load category');
      }
    };
    if (params?.id) load();
  }, [params?.id]);

  const onDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/categories/${params.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete category');
      router.push('/admin/categories?deleted=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (session?.user?.type !== 'admin') return null;

  return (
    <AdminLayout title="Delete Category" adminSession={adminSession}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Delete Category</h1>
        <Card className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}
          {!category ? (
            <div>Loading…</div>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">You are about to delete the following category. This action cannot be undone.</p>
              </div>
              <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Slug: {category.slug}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-block w-5 h-5 rounded" style={{ backgroundColor: category.color || '#e5e7eb' }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Posts linked: {category._count?.posts ?? 0}</span>
                  </div>
                </div>
              </div>
              {category._count?.posts > 0 && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                  This category is linked to existing posts and cannot be deleted until those links are removed.
                </div>
              )}
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={confirm} onChange={(e)=>setConfirm(e.target.checked)} />
                <span>I understand this action cannot be undone</span>
              </label>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => router.push('/admin/categories')} disabled={deleting}>Cancel</Button>
                <Button onClick={onDelete} disabled={deleting || !confirm || category._count?.posts > 0} className="bg-red-600 hover:bg-red-700">
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}


