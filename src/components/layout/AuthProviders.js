"use client"

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/auth-context";

export default function AuthProviders({ children }) {
  return (
    <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false} refetchInterval={0}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}


