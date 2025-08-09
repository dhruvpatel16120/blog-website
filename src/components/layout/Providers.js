"use client"

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "react-hot-toast";

// Lazy-load auth-related providers to keep them out of the shared client bundle
const AuthProviders = dynamic(() => import("./AuthProviders"), {
  ssr: false,
  // Ensure this chunk only loads on routes that actually render it
});

export default function Providers({ children }) {
  const pathname = usePathname();
  const needsAuthProviders = pathname?.startsWith("/admin") || pathname?.startsWith("/auth");

  // Theme and toaster are lightweight and can remain global
  const content = needsAuthProviders ? (
    <AuthProviders>{children}</AuthProviders>
  ) : (
    children
  );

  return (
    <ThemeProvider>
      {content}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </ThemeProvider>
  );
}
