"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, Button } from "@/components/ui";
import {
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  CalendarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function CurrentUserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [publishedPosts, setPublishedPosts] = useState([]);

  const isAuthenticated = status === "authenticated" && session?.user?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfileAndPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load profile");
        const meData = await res.json();
        setProfile(meData);

        // Fetch their published articles if user
        if (meData?.username) {
          const publicRes = await fetch(`/api/users/${encodeURIComponent(meData.username)}`, { cache: "no-store" });
          if (publicRes.ok) {
            const publicData = await publicRes.json();
            setPublishedPosts(publicData.user?.posts || []);
          }
        }
      } catch (e) {
        toast.error(e.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [isAuthenticated]);

  if (status === "loading" || (isAuthenticated && loading && !profile)) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">Loading public profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isOwner = true; // Viewing own profile on /profile
  const isAdmin = profile?.type === "admin" || profile?.role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8">
      {/* Profile Header Hero Card */}
      <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          {isAdmin && (
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 border border-white/20">
              <ShieldCheckIcon className="w-4 h-4 text-amber-300" />
              <span>Platform Staff</span>
            </div>
          )}
        </div>

        {/* Profile Info Row */}
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--card)] bg-[var(--background)] overflow-hidden shadow-md relative shrink-0">
              <Image
                src={profile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile?.username || profile?.fullName || "user")}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                alt={profile?.fullName || profile?.username || "Avatar"}
                width={128}
                height={128}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
                    <ShieldCheckIcon className="w-4 h-4 text-[var(--primary)]" />
                    <span>Admin Dashboard</span>
                  </Button>
                </Link>
              )}

              {isOwner && (
                <Link href="/profile/settings">
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs cursor-pointer font-medium">
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span>Edit Profile &amp; Settings</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* User Names & Bio */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                  {profile?.fullName || profile?.username}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                  {profile?.role || "MEMBER"}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-[var(--muted-foreground)]">
                @{profile?.username}
              </p>
            </div>

            {profile?.bio && (
              <p className="text-xs sm:text-sm text-[var(--foreground)]/90 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[var(--muted-foreground)] pt-1">
              <div className="flex items-center gap-1.5">
                <EnvelopeIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>{profile?.email}</span>
              </div>

              {profile?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile?.website && (
                <div className="flex items-center gap-1.5">
                  <GlobeAltIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  <a
                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--primary)] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>{profile.website.replace(/^https?:\/\//, "")}</span>
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>
                  Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Recently"}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border)] max-w-md">
              <div className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
                <div className="text-lg font-bold text-[var(--foreground)]">{profile?.stats?.postCount ?? 0}</div>
                <div className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)] tracking-wider">Articles</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
                <div className="text-lg font-bold text-[var(--foreground)]">{profile?.stats?.commentCount ?? 0}</div>
                <div className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)] tracking-wider">Comments</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
                <div className="text-lg font-bold text-[var(--foreground)]">{profile?.stats?.likeCount ?? 0}</div>
                <div className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)] tracking-wider">Likes Given</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Published Articles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-[var(--primary)]" />
            <span>Published Articles ({publishedPosts.length})</span>
          </h2>

          <Link href="/profile/settings">
            <span className="text-xs text-[var(--primary)] hover:underline font-medium">
              View Activity &amp; Liked Posts &rarr;
            </span>
          </Link>
        </div>

        {publishedPosts.length === 0 ? (
          <Card className="border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-3">
            <DocumentTextIcon className="w-12 h-12 text-[var(--muted-foreground)]/40 mx-auto" />
            <p className="text-sm font-semibold text-[var(--foreground)]">No published articles yet</p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
              Articles and tutorials published under your account will be displayed right here on your public profile.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedPosts.map((post) => (
              <Card key={post.id} className="border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-all shadow-xs flex flex-col justify-between">
                <CardContent className="p-5 space-y-2.5">
                  {post.categories?.[0]?.category && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--primary)]/10 text-[var(--primary)]">
                      {post.categories[0].category.name}
                    </span>
                  )}
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-base font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Recent"}</span>
                    {post.readTime && <span>{post.readTime} min read</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
