"use client"

import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "react-hot-toast";
import AuthProviders from "./AuthProviders";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProviders>{children}</AuthProviders>
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
