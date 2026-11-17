"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Button, Input } from '@/components/ui';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/auth/AuthLayout';

export default function AdminLoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If admin is already logged in, redirect straight to /admin
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user?.role === 'ADMIN' || session?.user?.type === 'admin') {
        router.replace('/admin');
      }
    };
    checkSession();
  }, [router]);

  // Show error messages from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'unauthorized':
          toast.error('Admin privilege required to access this resource.');
          break;
        case 'account_deactivated':
          toast.error('Your administrator account has been deactivated.');
          break;
        case 'server_error':
          toast.error('Server error occurred. Please try again.');
          break;
        default:
          toast.error('Authentication error.');
      }
    }
  }, [searchParams]);

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
      const result = await signIn('admin-credentials', {
        redirect: false,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        callbackUrl: '/admin',
      });

      if (result?.error) {
        toast.error('Invalid administrative credentials.');
      } else if (result?.ok) {
        toast.success('Administrator authenticated.');
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      toast.error('An unexpected error occurred during administrative login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Control Center"
      subtitle="Restricted access for platform administrators and editors."
      badge="Admin Security Guard"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field (Requirement 2: Use email for admin auth) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Admin Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="admin@techblog.com"
            leftIcon={<EnvelopeIcon className="w-5 h-5" />}
            className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Master Password
          </label>
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
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            }
            className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
            disabled={loading}
          />
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-[var(--muted-foreground)] flex items-start gap-2.5">
          <ShieldCheckIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <span>
            All administrative actions and failed login attempts are cryptographically verified and audited.
          </span>
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
              Authenticating...
            </span>
          ) : (
            'Enter Admin Dashboard'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
