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
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/auth/AuthLayout';

export default function AdminLoginForm() {
  const [formData, setFormData] = useState({
    username: '',
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
        username: formData.username.trim(),
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
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Admin Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
              <UserIcon className="h-5 w-5" />
            </div>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="admin_root"
              className="w-full pl-10 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Master Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
              <LockClosedIcon className="h-5 w-5" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-10 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
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
