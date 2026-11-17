import { Suspense } from 'react';

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
        {children}
      </div>
    </Suspense>
  );
}
