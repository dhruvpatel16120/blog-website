"use client"

import { Suspense } from "react";
import SignOutForm from "./SignOutForm";

export default function SignOutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-800 p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            <div className="py-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
              <div className="flex items-center justify-end gap-3">
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignOutForm />
    </Suspense>
  );
}


