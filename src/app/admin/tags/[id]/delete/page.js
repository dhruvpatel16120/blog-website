"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button } from '@/components/ui';
import { useSession } from 'next-auth/react';
export default function DeleteTagPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [tag, setTag] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/tags/${params.id}`);
        const data = await res.json();
        if (res.ok) setTag(data);
        else setError(data.error || 'Failed to load tag');
      } catch (e) {
        setError('Failed to load tag');
      }
    };
    if (params?.id) load();
  }, [params?.id]);

  const onDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/tags/${params.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete tag');
      router.push('/admin/tags?deleted=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (session?.user?.role !== 'ADMIN') return null;

  return (
    <AdminLayout title="Delete Tag" adminSession={adminSession}>
      <div className="max-w-xl">
        <Card className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}
          {!tag ? (
            <div>Loading…</div>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">You are about to delete the following tag. This action cannot be undone.</p>
              </div>
              <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tag.name}</p>
                    <p className="text-xs text-gray-500 mt-2">Slug: {tag.slug}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-block w-5 h-5 rounded" style={{ backgroundColor: tag.color || '#e5e7eb' }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Posts linked: {tag._count?.posts ?? 0}</span>
                  </div>
                </div>
              </div>
              {tag._count?.posts > 0 && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                  This tag is linked to existing posts and cannot be deleted until those links are removed.
                </div>
              )}
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={confirm} onChange={(e)=>setConfirm(e.target.checked)} />
                <span>I understand this action cannot be undone</span>
              </label>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => router.push('/admin/tags')} disabled={deleting}>Cancel</Button>
                <Button onClick={onDelete} disabled={deleting || !confirm || tag._count?.posts > 0} className="bg-red-600 hover:bg-red-700">
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


