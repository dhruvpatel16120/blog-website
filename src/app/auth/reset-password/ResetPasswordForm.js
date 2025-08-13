"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setMessage('Password must be at least 8 characters.');
    if (password !== confirm) return setMessage('Passwords do not match.');
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password updated. Redirecting to sign in...');
        setTimeout(() => router.push('/auth/signin'), 1500);
      } else {
        setMessage(data.error || 'Unable to reset password.');
      }
    } catch {
      setMessage('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reset your password</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          required
          className="w-full mb-3 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          required
          className="w-full mb-4 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded"
        >
          {submitting ? 'Updating...' : 'Update password'}
        </button>
        {message && <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{message}</p>}
      </form>
    </div>
  );
}
