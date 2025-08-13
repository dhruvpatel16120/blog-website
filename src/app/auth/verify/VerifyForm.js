"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('invalid');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        setStatus(res.ok ? 'success' : 'invalid');
        if (res.ok) setTimeout(() => router.push('/auth/signin'), 1500);
      } catch {
        setStatus('invalid');
      }
    })();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
        {status === 'verifying' && <p className="text-gray-700 dark:text-gray-300">Verifying your email...</p>}
        {status === 'success' && <p className="text-green-600">Email verified! Redirecting to sign in...</p>}
        {status === 'invalid' && <p className="text-red-600">Verification link is invalid or expired.</p>}
      </div>
    </div>
  );
}
