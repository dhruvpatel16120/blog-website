"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { 
  ArrowRightOnRectangleIcon, 
  ShieldCheckIcon, 
  UserIcon, 
  CheckCircleIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline";
import AuthLayout from "@/components/auth/AuthLayout";
import toast from "react-hot-toast";

export default function SignOutForm() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);

  const user = session?.user;

  const handleSignOut = useCallback(async () => {
    try {
      setBusy(true);
      await signOut({ redirect: false });
      toast.success("Signed out successfully. See you soon!");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Failed to sign out. Please try again.");
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

  const avatarUrl = user?.avatar || (user ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.username || user.fullName || "user")}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf` : "");

  return (
    <AuthLayout
      title="Confirm Sign Out"
      subtitle="Are you sure you want to end your active session?"
      badge="Session Security"
    >
      {status === "unauthenticated" ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">No Active Session Found</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              You are currently signed out of TechBlog.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs sm:text-sm"
            onClick={() => router.push("/auth/signin")}
          >
            Go to Sign In
          </Button>
        </div>
      ) : (
        <div className="py-2 space-y-6">
          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-purple-50/70 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/60 dark:border-indigo-900/50 flex items-center gap-4 shadow-xs">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-300 dark:border-indigo-700 overflow-hidden shrink-0 shadow-sm relative bg-white dark:bg-gray-800">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user?.fullName || "User Avatar"}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-indigo-600">
                  {(user?.fullName || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                  {user?.fullName || user?.username}
                </h4>
                {user?.role === "ADMIN" || user?.type === "admin" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <ShieldCheckIcon className="w-3 h-3" />
                    <span>Admin</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <UserIcon className="w-3 h-3" />
                    <span>Member</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted-foreground)] font-mono truncate mt-0.5">
                @{user?.username} • {user?.email}
              </p>
            </div>
          </div>

          {/* Sign Out Information Note */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Signing out will end your session on this browser. You will need to sign in again to publish articles, like posts, or submit comments.
            </p>
          </div>

          {/* Structured Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={busy}
              className="w-full sm:flex-1 cursor-pointer font-medium text-xs sm:text-sm py-2.5 flex items-center justify-center gap-1.5"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Stay Signed In</span>
            </Button>

            <Button
              type="button"
              className="w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 text-white border-rose-600 cursor-pointer font-semibold text-xs sm:text-sm py-2.5 shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50"
              onClick={handleSignOut}
              disabled={busy}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>{busy ? "Signing Out..." : "Sign Out Now"}</span>
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
