"use client";

import { createContext, useContext, useEffect, useState } from 'react';
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

  const login = async (credentials) => {
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Wait a moment for session to update, then return user data
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the updated session after login
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      
      return { success: true, user: sessionData.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isModerator = () => {
    return user?.role === 'MODERATOR' || user?.role === 'ADMIN';
  };

  const hasPermission = (permission) => {
    switch (permission) {
      case 'admin':
        return isAdmin();
      case 'moderator':
        return isModerator();
      case 'user':
        return !!user;
      default:
        return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isModerator,
    hasPermission,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};