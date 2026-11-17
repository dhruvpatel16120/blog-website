"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import AuthLayout from "@/components/auth/AuthLayout";

export default function SignOutForm() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      setBusy(true);
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [router]);

  // Support optional auto sign-out via ?auto=true
  useEffect(() => {
    if (status === "authenticated" && search?.get("auto") === "true") {
      handleSignOut();
    }
  }, [status, search, handleSignOut]);

  const handleCancel = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <AuthLayout
      title="Sign Out"
      subtitle={
        session?.user
          ? `Signed in as ${session.user.fullName || session.user.username || session.user.email}`
          : "End your current active session"
      }
      badge="Session Management"
    >
      {status === "unauthenticated" ? (
        <div className="py-4 text-center space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            You are currently not signed in.
          </p>
          <Button
            variant="primary"
            className="w-full cursor-pointer"
            onClick={() => router.push("/auth/signin")}
          >
            Go to Sign In
          </Button>
        </div>
      ) : (
        <div className="py-2 space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Signing out will end your session on this browser. You can sign back in anytime.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={busy}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-rose-600 cursor-pointer"
              onClick={handleSignOut}
              disabled={busy}
            >
              {busy ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
