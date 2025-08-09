"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/lib/admin-session';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  LockClosedIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(null);
  const router = useRouter();
  const { adminSession, adminSignIn } = useAdminSession();

  useEffect(() => {
    // Check if admin is already logged in
    if (adminSession) {
      router.push('/admin');
    }
  }, [adminSession, router]);

  useEffect(() => {
    // Check for existing lock from localStorage
    const lockedUntil = localStorage.getItem('adminLockedUntil');
    if (lockedUntil) {
      const lockTime = new Date(lockedUntil);
      if (lockTime > new Date()) {
        setIsLocked(true);
        setLockTime(lockTime);
      } else {
        localStorage.removeItem('adminLockedUntil');
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error('Account is temporarily locked. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      const result = await adminSignIn({
        username: formData.username,
        password: formData.password,
      });

      if (!result.success) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          // Lock for 30 minutes
          const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
          localStorage.setItem('adminLockedUntil', lockUntil.toISOString());
          setIsLocked(true);
          setLockTime(lockUntil);
          toast.error('Too many failed attempts. Account locked for 30 minutes.');
        } else {
          toast.error(`Invalid credentials. ${5 - newAttempts} attempts remaining.`);
        }
      } else {
        // Reset attempts on success
        setLoginAttempts(0);
        localStorage.removeItem('adminLockedUntil');
        toast.success('Login successful!');
        router.push('/admin');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTime = () => {
    if (!lockTime) return '';
    const now = new Date();
    const diff = lockTime - now;
    if (diff <= 0) {
      setIsLocked(false);
      setLockTime(null);
      localStorage.removeItem('adminLockedUntil');
      return '';
    }
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isLocked && lockTime) {
      const timer = setInterval(() => {
        const remaining = getRemainingTime();
        if (!remaining) {
          setIsLocked(false);
          setLockTime(null);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockTime, getRemainingTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-300">Secure administrative access</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {isLocked ? (
            <div className="text-center">
              <LockClosedIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Account Locked</h2>
              <p className="text-gray-300 mb-4">
                Too many failed login attempts. Please try again in:
              </p>
              <div className="text-3xl font-mono text-red-400 mb-4">
                {getRemainingTime()}
              </div>
              <p className="text-sm text-gray-400">
                For security reasons, your account has been temporarily locked.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                Administrator Login
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your username"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Attempts Warning */}
                {loginAttempts > 0 && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 text-sm">
                      Failed login attempts: {loginAttempts}/5
                    </p>
                    <p className="text-red-300 text-xs mt-1">
                      Account will be locked after 5 failed attempts
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Security Notice</p>
                    <p className="text-blue-200 text-xs mt-1">
                      This is a secure administrative area. All login attempts are logged and monitored.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            © 2024 Tech Blog Admin Panel. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
