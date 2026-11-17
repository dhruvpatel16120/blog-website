"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button, Input } from '@/components/ui';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthError from './AuthError';
import AuthLayout from './AuthLayout';

export default function SignInForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();

      // If someone inputs a raw username without @, gently guide them
      if (email && !email.includes('@')) {
        toast.error('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      const result = await signIn('user-credentials', {
        email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('EMAIL_NOT_VERIFIED')) {
          toast.error('Your email is not verified yet. Please verify your email before signing in.');
          router.push(`/auth/verify?email=${encodeURIComponent(email)}&unverified=true`);
          return;
        }

        toast.error('Invalid email or password.');
      } else {
        toast.success('Welcome back!');
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl');
        if (callbackUrl && !callbackUrl.startsWith('/auth/signin')) {
          window.location.href = callbackUrl;
        } else {
          router.push('/');
          router.refresh();
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to read, comment, and engage with our community."
      badge="Reader & Author Portal"
    >
      <Suspense fallback={null}>
        <AuthError />
      </Suspense>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            leftIcon={<EnvelopeIcon className="w-5 h-5" />}
            className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            leftIcon={<LockClosedIcon className="w-5 h-5" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            }
            className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
          />
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
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}
