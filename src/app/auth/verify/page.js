"use client";

import { Suspense } from 'react';
import VerifyForm from './VerifyForm';

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}


