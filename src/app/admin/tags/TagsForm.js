"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';
import { MagnifyingGlassIcon, TagIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function TagsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const adminSession = session?.user;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '5', 10));
  const [hasPosts, setHasPosts] = useState(searchParams.get('hasPosts') || '');
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ total: 0, used: 0, unused: 0 });
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
        if (data.summary) setSummary(data.summary);
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
    <AdminLayout title="Tag Management" adminSession={adminSession}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tags Management</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage blog tags and categorization
            </p>
          </div>
          <Button onClick={goNew}>New Tag</Button>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto inline-flex rounded-md bg-green-50 p-1.5 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Tags', value: summary.total, icon: TagIcon, color: 'bg-gray-900 dark:bg-black', textColor: 'text-white' },
            { label: 'Used Tags', value: summary.used, icon: CheckCircleIcon, color: 'bg-green-900 dark:bg-green-800', textColor: 'text-white' },
            { label: 'Unused Tags', value: summary.unused, icon: XMarkIcon, color: 'bg-yellow-900 dark:bg-yellow-800', textColor: 'text-white' },
          ].map((card, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${card.color} border-gray-700 dark:border-gray-600 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${card.textColor} opacity-80`}>{card.label}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.textColor} opacity-80`} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="relative md:col-span-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search tags…" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} className="pl-9" />
            </div>
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <select className="h-10 rounded border dark:bg-gray-800" value={hasPosts} onChange={(e)=>{ setHasPosts(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="true">Linked to posts</option>
              <option value="false">Unused only</option>
            </select>
          </div>
        </Card>

        {/* Tags List */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tags ({total} total)
              </h3>
              <Button onClick={load} variant="outline" disabled={loading}>
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages} • {total} total</p>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={()=>setPage((p)=>Math.max(p-1, 1))}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={()=>setPage((p)=>Math.min(p+1, totalPages))}>Next</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
