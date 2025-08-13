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
  const [siteName, setSiteName] = useState('');
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [publicSnapshot, setPublicSnapshot] = useState({ platformName: '', brandLogoUrl: '', brandPrimary: '', supportEmail: '' });

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
        setSiteName(data.settings.find((s) => s.key === 'PLATFORM_NAME')?.value || 'Tech Blog');
        setBrandColor(data.settings.find((s) => s.key === 'BRAND_PRIMARY_COLOR')?.value || '#2563eb');
        setLogoUrl(data.settings.find((s) => s.key === 'BRAND_LOGO_URL')?.value || '');
        setPublicSnapshot(data.public || {});
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
    if (res.ok) {
      const payload = await res.json();
      // Inform user if a full reload is needed for NEXT_PUBLIC_* changes
      if (payload.affectsPublicEnv) {
        alert(`Saved. This change affects public env (${payload.mappedEnv}). Please restart the app for full effect.`);
      }
      load();
    }
  };

  const toggleSetting = async (key, bool) => {
    await save(key, bool ? 'true' : 'false');
  };

  const writeEnv = async (pairs) => {
    const res = await fetch('/api/admin/settings/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: pairs })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      alert(e.error || 'Failed to write .env');
    } else {
      alert('Updated .env. Please restart the app to apply changes.');
    }
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
            <div className="flex gap-2">
              <Button onClick={() => toggleSetting('DEBUG_MODE', !debug)} variant={debug ? 'default' : 'outline'}>
                {debug ? 'Disable' : 'Enable'}
              </Button>
              <Button variant="outline" onClick={() => writeEnv({ DEBUG_MODE: (!debug).toString(), NEXT_PUBLIC_DEBUG_MODE: (!debug).toString() })}>Write .env</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Maintenance mode</div>
              <div className="text-sm text-gray-500">Temporarily block public traffic</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => toggleSetting('MAINTENANCE_MODE', !maintenance)} variant={maintenance ? 'destructive' : 'outline'}>
                {maintenance ? 'Disable' : 'Enable'}
              </Button>
              <Button variant="outline" onClick={() => writeEnv({ MAINTENANCE_MODE: (!maintenance).toString() })}>Write .env</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Branding</h2>
          {publicSnapshot?.brandLogoUrl || publicSnapshot?.platformName ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {publicSnapshot.brandLogoUrl ? <img src={publicSnapshot.brandLogoUrl} alt="logo" className="h-8 w-8 rounded-md object-contain" /> : null}
              <div className="text-xs text-gray-400">Current public: {publicSnapshot.platformName || '—'} · {publicSnapshot.brandPrimary || '—'}</div>
            </div>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">Site name</div>
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="md:col-span-2" />
            <div className="md:col-span-3 flex justify-end">
              <div className="flex gap-2">
                <Button onClick={() => save('PLATFORM_NAME', siteName)}>Save</Button>
                <Button variant="outline" onClick={() => writeEnv({ NEXT_PUBLIC_PLATFORM_NAME: siteName })}>Write .env</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">Primary color</div>
            <Input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="md:col-span-2 h-10" />
            <div className="md:col-span-3 flex justify-end">
              <div className="flex gap-2">
                <Button onClick={() => save('BRAND_PRIMARY_COLOR', brandColor)}>Save</Button>
                <Button variant="outline" onClick={() => writeEnv({ NEXT_PUBLIC_BRAND_PRIMARY_COLOR: brandColor })}>Write .env</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">Logo URL</div>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="md:col-span-2" placeholder="https://..." />
            <div className="md:col-span-3 flex justify-end">
              <div className="flex gap-2">
                <Button onClick={() => save('BRAND_LOGO_URL', logoUrl)}>Save</Button>
                <Button variant="outline" onClick={() => writeEnv({ NEXT_PUBLIC_BRAND_LOGO_URL: logoUrl })}>Write .env</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">Support email</div>
            <Input value={publicSnapshot.supportEmail || ''} onChange={(e) => setPublicSnapshot((p) => ({ ...p, supportEmail: e.target.value }))} className="md:col-span-2" placeholder="support@example.com" />
            <div className="md:col-span-3 flex justify-end">
              <div className="flex gap-2">
                <Button onClick={() => save('SUPPORT_EMAIL', publicSnapshot.supportEmail || '')}>Save</Button>
                <Button variant="outline" onClick={() => writeEnv({ NEXT_PUBLIC_SUPPORT_EMAIL: publicSnapshot.supportEmail || '' })}>Write .env</Button>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400">Note: Public branding changes require app restart to update NEXT_PUBLIC_* values used on the client.</div>
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


