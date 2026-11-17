"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else if (status === 'authenticated' && session?.user) {
      setUser(session.user);
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [session, status]);

  const login = useCallback(async (credentials, provider = 'user-credentials') => {
    try {
      const result = await signIn(provider, {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      // Small tick for NextAuth session client state to re-evaluate
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const sessionData = await response.json();

      if (sessionData?.user) {
        setUser(sessionData.user);
      }

      return { success: true, user: sessionData?.user };
    } catch (error) {
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }, []);

  const logout = useCallback(async (redirectUrl = '/') => {
    try {
      setUser(null);
      await signOut({ redirect: false });
      router.push(redirectUrl);
    } catch (error) {
      console.error('Logout error:', error);
      router.push(redirectUrl);
    }
  }, [router]);

  const isAdmin = useCallback(() => {
    return user?.role === 'ADMIN' || user?.type === 'admin';
  }, [user]);

  const hasPermission = useCallback((permission) => {
    switch (permission) {
      case 'admin':
        return isAdmin();
      case 'user':
        return !!user;
      default:
        return false;
    }
  }, [isAdmin, user]);

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    hasPermission,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
