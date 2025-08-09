import { createContext, useContext, useState, useEffect } from 'react';

const AdminSessionContext = createContext();

export function AdminSessionProvider({ children }) {
  const [adminSession, setAdminSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session in localStorage
    const storedSession = localStorage.getItem('adminSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        // Check if session is still valid (24 hours)
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          setAdminSession(session);
        } else {
          localStorage.removeItem('adminSession');
        }
      } catch (error) {
        localStorage.removeItem('adminSession');
      }
    }
    setLoading(false);
  }, []);

  const adminSignIn = async (credentials) => {
    try {
      const response = await fetch('/api/auth/admin/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        const session = {
          ...data.admin,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        };
        setAdminSession(session);
        localStorage.setItem('adminSession', JSON.stringify(session));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const adminSignOut = () => {
    setAdminSession(null);
    localStorage.removeItem('adminSession');
  };

  const value = {
    adminSession,
    loading,
    adminSignIn,
    adminSignOut,
  };

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error('useAdminSession must be used within an AdminSessionProvider');
  }
  return context;
}
