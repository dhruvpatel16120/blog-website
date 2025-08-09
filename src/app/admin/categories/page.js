"use client";

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok) setCategories(data.categories);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) { setName(''); load(); }
  };

  const remove = async (id) => {
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Category name" value={name} onChange={(e)=>setName(e.target.value)} />
            <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="h-10 w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={create}>Add Category</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td className="px-6 py-4" colSpan={3}>Loading...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td className="px-6 py-4" colSpan={3}>No categories</td></tr>
                ) : categories.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4">{c.name}</td>
                    <td className="px-6 py-4"><span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: c.color }} /></td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={()=>remove(c.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}


