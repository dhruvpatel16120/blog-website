"use client"

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/auth-context";
import { AdminSessionProvider } from "@/lib/admin-session";

export default function AuthProviders({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <AdminSessionProvider>
          {children}
        </AdminSessionProvider>
      </AuthProvider>
    </SessionProvider>
  );
}


