'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui';

export default function InviteUserPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [form, setForm] = useState({ fullName: '', email: '', role: 'USER', customMessage: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading…</div>;
  if (session?.user?.role !== 'ADMIN') return null;

  const canAssignAdmin = adminSession?.role === 'ADMIN';

  const validateForm = () => {
    const errors = {};
    
    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (form.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!form.role) {
      errors.role = 'Role is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const onInvite = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSending(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          role: canAssignAdmin ? form.role : 'USER',
          customMessage: form.customMessage.trim(),
        }),
      });
      
      const payload = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to send invite');
      }
      
      setSuccess('Invitation sent successfully! Redirecting to users list...');
      setTimeout(() => router.push('/admin/users'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || '';
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-3 py-2 rounded-md border dark:bg-gray-800";
    return getFieldError(fieldName) 
      ? `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500` 
      : `${baseClass} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
  };

  return (
    <AdminLayout title="Invite User" adminSession={adminSession}>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invite New User</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Send an invitation to a new user to join the platform. They will receive an email with instructions to set their password.
          </p>
        </div>

        <form onSubmit={onInvite} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

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
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                required
                className={getFieldClassName('fullName')}
                placeholder="Enter full name"
              />
              {getFieldError('fullName') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('fullName')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                className={getFieldClassName('email')}
                placeholder="Enter email address"
              />
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className={getFieldClassName('role')}
            >
              <option value="USER">User</option>
              {canAssignAdmin && <option value="ADMIN">Admin</option>}
            </select>
            {getFieldError('role') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('role')}</p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {canAssignAdmin 
                ? 'You can assign any role including Admin' 
                : 'You can assign User roles only'
              }
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              name="customMessage"
              value={form.customMessage}
              onChange={onChange}
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 resize-none focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add a personal message to the invitation email..."
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This message will be included in the invitation email to personalize the invitation
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/admin/users')}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending}
              className="min-w-[120px]"
            >
              {sending ? 'Sending Invite...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}


