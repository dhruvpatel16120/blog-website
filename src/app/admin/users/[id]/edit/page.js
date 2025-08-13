'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui';
export default function EditUserPage() {
  const params = useParams();
  const userId = useMemo(() => params?.id || '', [params]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [session?.user?.type, status, router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        if (!res.ok) {
          router.push('/admin/users');
          return;
        }
        const data = await res.json();
        setForm({
          username: data.username || '',
          fullName: data.fullName || '',
          email: data.email || '',
          role: data.role || 'USER',
          isActive: !!data.isActive,
          avatar: data.avatar || '',
          bio: data.bio || '',
          website: data.website || '',
          location: data.location || '',
        });
        setLoaded(true);
      } catch (e) {
        router.push('/admin/users');
      }
    };
    if (userId) fetchUser();
  }, [userId, router]);

  if (loading || !adminSession || !loaded || !form) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading…</div>;
  }

  const canAssignAdmin = adminSession?.role === 'SUPER_ADMIN';
  const isModerator = adminSession?.role === 'MODERATOR';

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (isModerator) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          fullName: form.fullName,
          role: canAssignAdmin ? form.role : (form.role === 'ADMIN' ? 'USER' : form.role),
          isActive: form.isActive,
          avatar: form.avatar,
          bio: form.bio,
          website: form.website,
          location: form.location,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to save');
      router.push('/admin/users');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={`Edit User`} adminSession={adminSession}>
      <form onSubmit={onSave} className="max-w-3xl">
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input name="username" value={form.username} onChange={onChange} required minLength={3} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input name="fullName" value={form.fullName} onChange={onChange} required className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select name="role" value={form.role} onChange={onChange} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" disabled={isModerator}>
              <option value="USER">User</option>
              <option value="MODERATOR">Moderator</option>
              {canAssignAdmin && <option value="ADMIN">Admin</option>}
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <input name="avatar" value={form.avatar} onChange={onChange} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input name="website" value={form.website} onChange={onChange} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input name="location" value={form.location} onChange={onChange} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={onChange} rows={4} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <label className="inline-flex items-center space-x-2 text-sm">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} disabled={isModerator} />
            <span>Active</span>
          </label>
          <div className="space-x-2">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/users')}>Cancel</Button>
            <Button type="submit" disabled={saving || isModerator}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}


