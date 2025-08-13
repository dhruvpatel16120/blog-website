"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input, Badge } from '@/components/ui';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const adminSession = session?.user;
  const [settings, setSettings] = useState([]);
  const [debug, setDebug] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        const dbg = data.settings.find((s) => s.key === 'DEBUG_MODE')?.value;
        const mnt = data.settings.find((s) => s.key === 'MAINTENANCE_MODE')?.value;
        setDebug(String(dbg || '').toLowerCase() === 'true');
        setMaintenance(String(mnt || '').toLowerCase() === 'true');
      }
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

  const toggleSetting = async (key, bool) => {
    await save(key, bool ? 'true' : 'false');
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout adminSession={adminSession}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <div className="flex gap-2">
            <Badge variant={debug ? 'default' : 'outline'}>Debug: {debug ? 'ON' : 'OFF'}</Badge>
            <Badge variant={maintenance ? 'destructive' : 'outline'}>Maintenance: {maintenance ? 'ON' : 'OFF'}</Badge>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Site Modes</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Debug mode</div>
              <div className="text-sm text-gray-500">Enable verbose logging in the app</div>
            </div>
            <Button onClick={() => toggleSetting('DEBUG_MODE', !debug)} variant={debug ? 'default' : 'outline'}>
              {debug ? 'Disable' : 'Enable'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Maintenance mode</div>
              <div className="text-sm text-gray-500">Temporarily block public traffic</div>
            </div>
            <Button onClick={() => toggleSetting('MAINTENANCE_MODE', !maintenance)} variant={maintenance ? 'destructive' : 'outline'}>
              {maintenance ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Key/Value Settings</h2>
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


