"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/auth/AuthLayout';

export default function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => searchParams.get('token'), [searchParams]);
  const emailParam = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const isUnverifiedAttempt = useMemo(() => searchParams.get('unverified') === 'true', [searchParams]);

  const [status, setStatus] = useState(token ? 'verifying' : 'awaiting'); // 'verifying' | 'success' | 'invalid' | 'awaiting'
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // If a verification token is provided in URL, perform verification
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok) {
          setStatus('success');
          setMessage('Your email address has been successfully verified.');
          toast.success('Email verified successfully!');
          setTimeout(() => router.push('/auth/signin'), 2500);
        } else {
          setStatus('invalid');
          setMessage(data.error || 'Verification link is invalid or has expired.');
        }
      } catch {
        if (isMounted) {
          setStatus('invalid');
          setMessage('Unable to verify email due to a network error. Please try again.');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [token, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!emailParam || resending || resendCooldown > 0) return;

    setResending(true);
    try {
      const res = await fetch('/api/auth/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.alreadyVerified) {
          toast.success('Your email is already verified! Redirecting to sign in...');
          router.push('/auth/signin');
          return;
        }
        toast.success(data.message || 'Verification link sent!');
        setResendCooldown(60); // 60s cooldown
      } else {
        toast.error(data.error || 'Failed to resend verification link');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // State A: Token verification in progress
  if (status === 'verifying') {
    return (
      <AuthLayout
        title="Verifying Email"
        subtitle="Please wait while we confirm your credentials..."
        badge="Account Verification"
      >
        <div className="text-center py-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Communicating with verification server...</p>
        </div>
      </AuthLayout>
    );
  }

  // State B: Verification Success
  if (status === 'success') {
    return (
      <AuthLayout
        title="Email Verified!"
        subtitle="Your account is active. You can now publish stories and engage with articles."
        badge="Success"
      >
        <div className="text-center py-4 space-y-5">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircleIcon className="h-10 w-10" />
          </div>
          <p className="text-sm text-[var(--foreground)] font-medium">{message}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Redirecting you to sign in automatically...</p>
          <Link href="/auth/signin">
            <Button variant="primary" className="w-full mt-2 cursor-pointer">
              Sign In Now
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // State C: Verification Token Invalid or Expired
  if (status === 'invalid') {
    return (
      <AuthLayout
        title="Verification Expired"
        subtitle="The verification link is invalid, expired, or was already used."
        badge="Verification Error"
      >
        <div className="text-center py-4 space-y-5">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircleIcon className="h-10 w-10" />
          </div>
          <p className="text-sm text-[var(--foreground)]">{message}</p>

          {emailParam ? (
            <Button
              variant="primary"
              className="w-full cursor-pointer"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
            >
              {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Send New Verification Link'}
            </Button>
          ) : (
            <Link href="/auth/signin">
              <Button variant="primary" className="w-full cursor-pointer">
                Return to Sign In
              </Button>
            </Link>
          )}
        </div>
      </AuthLayout>
    );
  }

  // State D: Awaiting verification (redirected after Sign Up or when signing in unverified)
  return (
    <AuthLayout
      title={isUnverifiedAttempt ? "Verification Required" : "Check Your Inbox"}
      subtitle={
        isUnverifiedAttempt
          ? "Please verify your email address to access your account."
          : "We have dispatched a verification link to your email."
      }
      badge="Verify Email"
    >
      <div className="text-center py-2 space-y-5">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
          <EnvelopeIcon className="h-9 w-9" />
        </div>

        {emailParam && (
          <div className="p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)]">Verification link sent to:</p>
            <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5 break-all">
              {emailParam}
            </p>
          </div>
        )}

        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          Click the link in the email to activate your account. If you don&apos;t see it within a couple minutes, please check your spam folder.
        </p>

        <div className="space-y-3 pt-2">
          {emailParam && (
            <Button
              variant="outline"
              className="w-full gap-2 cursor-pointer"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
            >
              <ArrowPathIcon className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              <span>
                {resending ? 'Sending...' : resendCooldown > 0 ? `Resend link (${resendCooldown}s)` : 'Resend Verification Email'}
              </span>
            </Button>
          )}

          <Link href="/auth/signin" className="block w-full">
            <Button variant={emailParam ? "primary" : "primary"} className="w-full cursor-pointer">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
