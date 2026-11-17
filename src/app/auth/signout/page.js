"use client";

import { Suspense } from "react";
import SignOutForm from "./SignOutForm";

export default function SignOutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignOutForm />
    </Suspense>
  );
}
