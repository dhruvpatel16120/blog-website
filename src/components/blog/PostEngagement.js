"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  HeartIcon as HeartOutline,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  UserCircleIcon,
  ShareIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function PostEngagement({
  postSlug,
  initialLikesCount = 0,
  initialLiked = false,
  initialLikedUsers = [],
  commentCount = 0,
  postTitle = "",
}) {
  const { data: session, status } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [likedUsers, setLikedUsers] = useState(initialLikedUsers);
  const [isLiking, setIsLiking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync state if initial props change
  useEffect(() => {
    setLiked(initialLiked);
    setLikesCount(initialLikesCount);
    setLikedUsers(initialLikedUsers);
  }, [initialLiked, initialLikesCount, initialLikedUsers]);

  // Handle like toggle
  const handleToggleLike = async () => {
    if (status !== "authenticated" || !session?.user) {
      toast((t) => (
        <div className="flex items-center gap-3">
          <span>Please sign in to like this post.</span>
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : `/blog/${postSlug}`)}`}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => toast.dismiss(t.id)}
          >
            Sign In
          </Link>
        </div>
      ), { icon: "❤️" });
      return;
    }

    if (isLiking) return;

    // Optimistic UI update
    const prevLiked = liked;
    const prevCount = likesCount;
    const prevUsers = [...likedUsers];

    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    let nextUsers = [...prevUsers];
    if (nextLiked) {
      const currentUserObj = {
        id: session.user.id || "me",
        username: session.user.username || session.user.email?.split("@")[0] || "user",
        fullName: session.user.name || session.user.fullName || session.user.username || "You",
        avatar: session.user.image || session.user.avatar || null,
        bio: session.user.bio || null,
      };
      nextUsers = [currentUserObj, ...prevUsers.filter((u) => u.id !== currentUserObj.id)];
    } else {
      nextUsers = prevUsers.filter(
        (u) => u.id !== session.user.id && u.username !== session.user.username
      );
    }

    setLiked(nextLiked);
    setLikesCount(nextCount);
    setLikedUsers(nextUsers);
    setIsLiking(true);

    try {
      const res = await fetch(`/api/posts/${postSlug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update like");
      }

      setLiked(data.liked);
      setLikesCount(data.likesCount);
      if (Array.isArray(data.likedUsers)) {
        setLikedUsers(data.likedUsers);
      }
    } catch (err) {
      // Revert optimistic update
      setLiked(prevLiked);
      setLikesCount(prevCount);
      setLikedUsers(prevUsers);
      toast.error(err.message || "Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Filter users inside the modal
  const filteredUsers = likedUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-6 border-y border-[var(--border)] my-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* Left: Like Button and Liked Avatars */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
              liked
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20 shadow-xs"
                : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--accent)] hover:border-rose-400/50"
            }`}
            aria-label={liked ? "Unlike this article" : "Like this article"}
          >
            {liked ? (
              <HeartSolid className="w-5 h-5 text-rose-500 animate-in zoom-in-50 duration-200" />
            ) : (
              <HeartOutline className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-rose-500" />
            )}
            <span>{likesCount}</span>
            <span className="hidden xs:inline text-xs font-medium text-[var(--muted-foreground)]">
              {likesCount === 1 ? "Like" : "Likes"}
            </span>
          </button>

          {/* Avatars Stack & View Who Liked */}
          {likesCount > 0 && (
            <div
              onClick={() => setShowModal(true)}
              className="group cursor-pointer flex items-center gap-2.5 py-1 px-2 rounded-xl hover:bg-[var(--muted)]/50 transition-colors"
              title="View all people who liked this post"
            >
              {/* Stacked avatars */}
              <div className="flex -space-x-2 overflow-hidden items-center">
                {likedUsers.slice(0, 4).map((user, idx) => (
                  <div
                    key={user.id || user.username || idx}
                    className="inline-block relative w-7 h-7 rounded-full ring-2 ring-[var(--background)] overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 shrink-0 shadow-2xs"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.fullName || user.username}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {(user.fullName || user.username || "U")[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Text summary */}
              <div className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                {liked ? (
                  <span>
                    Liked by <strong className="text-[var(--foreground)]">you</strong>
                    {likesCount > 1 ? ` and ${likesCount - 1} other${likesCount > 2 ? "s" : ""}` : ""}
                  </span>
                ) : (
                  <span>
                    {likedUsers[0]?.fullName ? (
                      <>
                        Liked by <strong className="text-[var(--foreground)]">{likedUsers[0].fullName.split(" ")[0]}</strong>
                        {likesCount > 1 ? ` & ${likesCount - 1} other${likesCount > 2 ? "s" : ""}` : ""}
                      </>
                    ) : (
                      <span>{likesCount} {likesCount === 1 ? "person" : "people"} liked this</span>
                    )}
                  </span>
                )}
                <span className="ml-1 text-[11px] underline opacity-80 group-hover:opacity-100">
                  (view)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Share / Comments jump */}
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <button
            type="button"
            onClick={handleCopyLink}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--foreground)] font-medium transition-colors"
          >
            <ShareIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span>{copied ? "Link Copied!" : "Share Article"}</span>
          </button>

          <a
            href="#comments"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--foreground)] font-medium transition-colors"
          >
            <span>💬 {commentCount} Comments</span>
          </a>
        </div>
      </div>

      {/* Liked Users Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-[var(--card-foreground)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <HeartSolid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Liked by</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {likesCount} {likesCount === 1 ? "reader" : "readers"} appreciated this post
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Optional Search if more than 5 users */}
            {likedUsers.length > 5 && (
              <div className="px-6 pt-3 pb-1 border-b border-[var(--border)]">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or username..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--muted)]/40 border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--border)] p-2">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">
                  {searchQuery ? "No users matching your search." : "No likes yet."}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id || user.username}
                    className="p-3 rounded-xl hover:bg-[var(--muted)]/50 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() => setShowModal(false)}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      {/* Avatar */}
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 shrink-0 border border-[var(--border)]">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.fullName || user.username}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white uppercase">
                            {(user.fullName || user.username || "U")[0]}
                          </span>
                        )}
                      </div>

                      {/* Name & Username */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[var(--foreground)] group-hover:text-blue-500 transition-colors truncate">
                            {user.fullName || user.username}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5 opacity-80">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </Link>

                    {/* View Profile Button */}
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() => setShowModal(false)}
                      className="cursor-pointer shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all flex items-center gap-1 text-[var(--foreground)]"
                    >
                      <span>Profile</span>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[var(--muted)]/30 border-t border-[var(--border)] text-center">
              <p className="text-xs text-[var(--muted-foreground)]">
                Click on any profile to see their public bio, articles, and community activity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
