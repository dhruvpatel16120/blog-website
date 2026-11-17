"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AuthLayout from '@/components/auth/AuthLayout';

export default function VerifyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'invalid'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('invalid');
      setMessage('No verification token found in URL.');
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok) {
          setStatus('success');
          setMessage('Your email address has been successfully verified.');
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
  }, [params, router]);

  return (
    <AuthLayout
      title={
        status === 'verifying'
          ? 'Verifying Email'
          : status === 'success'
          ? 'Email Verified'
          : 'Verification Failed'
      }
      subtitle={
        status === 'verifying'
          ? 'Please wait while we confirm your email address...'
          : status === 'success'
          ? 'Thank you! Your account is now active.'
          : 'There was a problem verifying your account.'
      }
      badge="Account Verification"
    >
      <div className="text-center py-4">
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--muted-foreground)]">Verifying credentials with server...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <p className="text-sm text-[var(--foreground)]">{message}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Redirecting you to sign in...</p>
            <Link href="/auth/signin">
              <Button variant="primary" className="w-full mt-2 cursor-pointer">
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <XCircleIcon className="h-8 w-8" />
            </div>
            <p className="text-sm text-[var(--foreground)]">{message}</p>
            <div className="space-y-2 pt-2">
              <Link href="/auth/signin">
                <Button variant="primary" className="w-full cursor-pointer">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
