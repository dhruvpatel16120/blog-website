"use client"

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";

export default function SignOutPage() {
  const { status } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);

  // Support optional auto sign-out via ?auto=true
  useEffect(() => {
    if (status === "authenticated" && search?.get("auto") === "true") {
      handleSignOut();
    }
  }, [status, search]);

  const handleSignOut = async () => {
    try {
      setBusy(true);
      await signOut({ redirect: true, callbackUrl: "/" });
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <CardTitle className="text-lg">Sign out</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "unauthenticated" ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">You are not signed in.</p>
              <Button onClick={() => router.push("/auth/signin")}>Go to sign in</Button>
            </div>
          ) : (
            <div className="py-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to sign out from this device?
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={busy}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                  onClick={handleSignOut}
                  disabled={busy}
                >
                  {busy ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


