"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';

export default function TagsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const adminSession = session?.user;
  const isModerator = false; // Only USER and ADMIN roles exist

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '10', 10));
  const [hasPosts, setHasPosts] = useState(searchParams.get('hasPosts') || '');
  const [total, setTotal] = useState(0);
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sortBy, order, page: String(page), limit: String(limit) });
      if (hasPosts) params.set('hasPosts', hasPosts);
      const res = await fetch(`/api/admin/tags?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.data || []);
        setTotal(data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [q, sortBy, order, page, limit, hasPosts]);

  useEffect(() => {
    const created = searchParams.get('created');
    const updated = searchParams.get('updated');
    const deleted = searchParams.get('deleted');
    if (created) setSuccess('Tag created successfully');
    if (updated) setSuccess('Tag updated successfully');
    if (deleted) setSuccess('Tag deleted successfully');
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);

  const goNew = () => router.push('/admin/tags/new');
  const goEdit = (id) => router.push(`/admin/tags/${id}/edit`);
  const goDelete = (id) => router.push(`/admin/tags/${id}/delete`);

  return (
    <AdminLayout title="Tags" adminSession={adminSession}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tags</h1>
          <Button onClick={goNew}>New Tag</Button>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={() => setSuccess('')} className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input placeholder="Search tags…" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} />
            <select className="h-10 rounded border dark:bg-gray-800" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
              <option value="createdAt">Sort: Created</option>
              <option value="updatedAt">Sort: Updated</option>
              <option value="name">Sort: Name</option>
              <option value="posts">Sort: Posts</option>
            </select>
            <select className="h-10 rounded border dark:bg-gray-800" value={order} onChange={(e)=>setOrder(e.target.value)}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
            <select className="h-10 rounded border dark:bg-gray-800" value={limit} onChange={(e)=>{ setLimit(parseInt(e.target.value, 10)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <select className="h-10 rounded border dark:bg-gray-800" value={hasPosts} onChange={(e)=>{ setHasPosts(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="true">Linked to posts</option>
              <option value="false">Unused only</option>
            </select>
            <div className="flex justify-end">
              <Button onClick={goNew}>Add Tag</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Posts</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td className="px-6 py-4" colSpan={5}>Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td className="px-6 py-4" colSpan={5}>No tags</td></tr>
                ) : items.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4">{t.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.slug}</td>
                    <td className="px-6 py-4"><span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: t.color || '#e5e7eb' }} /></td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">{t._count?.posts ?? 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={()=>goEdit(t.id)}>Edit</Button>
                                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={()=>goDelete(t.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages} • {total} total</p>
            <div className="space-x-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={()=>setPage((p)=>Math.max(p-1, 1))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={()=>setPage((p)=>Math.min(p+1, totalPages))}>Next</Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
