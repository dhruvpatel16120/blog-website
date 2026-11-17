"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        toast.success('Password reset email sent!');
      } else {
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="We've sent recovery instructions to your email."
        badge="Reset Link Sent"
      >
        <div className="text-center py-2">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
            <CheckCircleIcon className="h-8 w-8" />
          </div>

          <p className="text-sm text-[var(--foreground)] mb-2 font-medium">
            Recovery link sent to:
          </p>
          <p className="text-sm font-semibold text-[var(--primary)] mb-4">
            {email}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mb-6">
            If you don&apos;t see the email within a couple minutes, please check your spam folder. The link remains valid for 24 hours.
          </p>

          <div className="space-y-3">
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full cursor-pointer">
                Return to Sign In
              </Button>
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline block w-full text-center cursor-pointer"
            >
              Didn&apos;t receive it? Try a different email
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your account and we'll send you a password reset link."
      badge="Account Recovery"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
              <EnvelopeIcon className="h-5 w-5" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full pl-10 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-medium transition-transform active:scale-[0.99] cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              Sending Link...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
        Remembered your password?{' '}
        <Link
          href="/auth/signin"
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
