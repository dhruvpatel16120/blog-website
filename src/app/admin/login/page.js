"use client";

import { Suspense } from 'react';
import AdminLoginForm from './AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
            </div>
            <div className="h-8 bg-white/10 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse"></div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="h-6 bg-white/10 rounded animate-pulse mb-6"></div>
            <div className="space-y-6">
              <div className="h-12 bg-white/10 rounded animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
