"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button } from '@/components/ui';

export default function AuditPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const load = async (p = 1) => {
    const res = await fetch(`/api/admin/audit?page=${p}`);
    const data = await res.json();
    if (res.ok) {
      setItems(data.items);
      setPagination(data.pagination);
    }
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{log.user?.email || '-'}</td>
                  <td className="px-6 py-4 text-sm">{log.action}</td>
                  <td className="px-6 py-4 text-sm">{log.entity} {log.entityId ? `(${log.entityId})` : ''}</td>
                  <td className="px-6 py-4 text-sm">{log.metadata}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setPage(Math.max(1, page-1))} disabled={page<=1}>Prev</Button>
            <Button variant="outline" onClick={()=>setPage(Math.min(pagination.pages, page+1))} disabled={page>=pagination.pages}>Next</Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}


