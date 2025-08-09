"use client";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  // Security: Only render sensitive info on client
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            {session ? (
              <div>
                <p><strong>User Type:</strong> {session.user?.type || 'Unknown'}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Name:</strong> {session.user?.fullName || session.user?.name}</p>
                {session.user?.role && (
                  <p><strong>Role:</strong> {session.user.role}</p>
                )}
              </div>
            ) : (
              <p>Not authenticated</p>
            )}
          </div>
          <div className="mt-6 space-y-2">
            <a href="/auth/signin" className="block w-full bg-blue-600 text-white py-2 px-4 rounded text-center">
              Test User Login
            </a>
            <a href="/admin/login" className="block w-full bg-green-600 text-white py-2 px-4 rounded text-center">
              Test Admin Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
