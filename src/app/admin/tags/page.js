"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#9333ea');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tags');
      const data = await res.json();
      if (res.ok) setTags(data.tags);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    const res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) { setName(''); load(); }
  };

  const remove = async (id) => {
    const res = await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tags</h1>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Tag name" value={name} onChange={(e)=>setName(e.target.value)} />
            <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="h-10 w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={create}>Add Tag</Button>
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
                ) : tags.length === 0 ? (
                  <tr><td className="px-6 py-4" colSpan={3}>No tags</td></tr>
                ) : tags.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4">{t.name}</td>
                    <td className="px-6 py-4"><span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: t.color }} /></td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={()=>remove(t.id)}>Delete</Button>
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


