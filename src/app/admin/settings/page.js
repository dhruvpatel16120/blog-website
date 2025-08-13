"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const adminSession = session?.user;
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) setSettings(data.settings);
    } finally {
      setLoading(false);
    }
  };

  const save = async (key, value) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) load();
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout adminSession={adminSession}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <Card className="p-6 space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            settings.map((s) => (
              <div key={s.key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">{s.key}</div>
                <Input defaultValue={s.value} id={`input-${s.key}`} className="md:col-span-2" />
                <div className="md:col-span-3 flex justify-end">
                  <Button onClick={() => save(s.key, document.getElementById(`input-${s.key}`).value)}>Save</Button>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}


