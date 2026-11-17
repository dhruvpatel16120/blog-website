"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Textarea } from '@/components/ui';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  GlobeAltIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthError from './AuthError';
import AuthLayout from './AuthLayout';

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    bio: '',
    website: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return false;
    }

    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim().toLowerCase(),
          email,
          fullName: formData.fullName.trim(),
          password: formData.password,
          bio: formData.bio,
          website: formData.website,
          location: formData.location,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created! Please verify your email to continue.');
        // Requirement 3: When signup is completed, redirect to verify email page
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join the Community"
      subtitle="Create an account to publish articles, bookmark stories, and participate in tech discussions."
      badge="Create Account"
      maxWidth="max-w-xl"
    >
      <Suspense fallback={null}>
        <AuthError />
      </Suspense>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Full Name *
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Alex Johnson"
              className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
            />
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Username *
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="alex_dev"
              minLength={3}
              leftIcon={<UserIcon className="w-5 h-5" />}
              className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Email Address *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="alex@example.com"
            leftIcon={<EnvelopeIcon className="w-5 h-5" />}
            className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Password *
            </label>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min. 8 characters"
              minLength={8}
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Confirm Password *
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter password"
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              }
              className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            Bio <span className="text-xs text-[var(--muted-foreground)]">(Optional)</span>
          </label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={2}
            placeholder="A short note about your interests and work..."
            className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
          />
        </div>

        {/* Website & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Website <span className="text-xs text-[var(--muted-foreground)]">(Optional)</span>
            </label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              leftIcon={<GlobeAltIcon className="w-5 h-5" />}
              className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
            >
              Location <span className="text-xs text-[var(--muted-foreground)]">(Optional)</span>
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="San Francisco, CA"
              leftIcon={<MapPinIcon className="w-5 h-5" />}
              className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-medium transition-transform active:scale-[0.99] cursor-pointer mt-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{' '}
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
