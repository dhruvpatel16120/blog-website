"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/auth/AuthLayout';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This password reset link is missing a verification token."
        badge="Security Error"
      >
        <div className="text-center py-4 space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Please request a new reset link to proceed with changing your password.
          </p>
          <Link href="/auth/forgot-password">
            <Button variant="primary" className="w-full">
              Request New Link
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success('Password updated successfully!');
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        toast.error(data.error || 'Unable to reset password.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Your password has been changed successfully."
        badge="Success"
      >
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Redirecting you to the sign in page in a moment...
          </p>
          <Link href="/auth/signin">
            <Button variant="primary" className="w-full">
              Sign In Now
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Choose a secure password that is at least 8 characters long."
      badge="Password Reset"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            New Password
          </label>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            leftIcon={<LockClosedIcon className="w-5 h-5" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            }
            className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Confirm New Password
          </label>
          <Input
            id="confirm"
            name="confirm"
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            leftIcon={<LockClosedIcon className="w-5 h-5" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            }
            className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-medium transition-transform active:scale-[0.99] cursor-pointer"
          disabled={submitting}
        >
          {submitting ? 'Updating Password...' : 'Save New Password'}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
        Remembered your old password?{' '}
        <Link
          href="/auth/signin"
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
