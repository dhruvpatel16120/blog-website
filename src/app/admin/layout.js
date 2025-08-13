import { Suspense } from 'react';
import Providers from '@/components/layout/Providers';

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({ children }) {
  return (
    <Providers>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        {children}
      </Suspense>
    </Providers>
  );
}
