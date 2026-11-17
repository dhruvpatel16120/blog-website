"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Textarea,
} from "@/components/ui";
import {
  UserIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'likes' | 'comments' | 'danger'
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState({ comments: [], likes: [], posts: [] });
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthenticated = status === "authenticated" && session?.user?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile/settings");
    }
  }, [status, router]);

  // Fetch current user details
  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me");
        if (!res.ok) {
          if (res.status === 401) router.push("/auth/signin");
          return;
        }
        const data = await res.json();
        if (mounted) setUser(data);
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [isAuthenticated, router]);

  // Fetch user activity (likes, comments)
  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;
    const fetchActivity = async () => {
      try {
        setLoadingActivity(true);
        const res = await fetch("/api/profile/activity");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setActivity(data);
        }
      } catch (err) {
        console.error("Error loading activity:", err);
      } finally {
        if (mounted) setLoadingActivity(false);
      }
    };

    fetchActivity();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  if (!isMounted || status === "loading" || loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">Loading your profile settings...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/profile"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Back to Public Profile</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)]">
            Account & Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">
            Manage your personal information, public visibility, privacy toggles, and security.
          </p>
        </div>

        <Link href="/profile">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer text-xs">
            <UserIcon className="w-4 h-4 text-indigo-500" />
            <span>View Public Profile</span>
          </Button>
        </Link>
      </div>

      {/* Main Settings Navigation & Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <aside className="md:col-span-1 space-y-1.5">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-left ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("likes")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-left ${
              activeTab === "likes"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <HeartIcon className="w-4 h-4 shrink-0 text-rose-500" />
              <span>Liked Posts</span>
            </div>
            {user?.stats?.likeCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'likes' ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                {user.stats.likeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("comments")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-left ${
              activeTab === "comments"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 shrink-0 text-blue-500" />
              <span>My Comments</span>
            </div>
            {user?.stats?.commentCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'comments' ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                {user.stats.commentCount}
              </span>
            )}
          </button>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab("danger")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-left ${
                activeTab === "danger"
                  ? "bg-red-600 text-white font-semibold shadow-xs"
                  : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              }`}
            >
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
              <span>Danger Zone</span>
            </button>
          </div>
        </aside>

        {/* Tab Content Panels */}
        <section className="md:col-span-3">
          {activeTab === "profile" && (
            <EditProfileTab user={user} onUpdated={setUser} />
          )}

          {activeTab === "likes" && (
            <LikesTab likes={activity.likes} loading={loadingActivity} />
          )}

          {activeTab === "comments" && (
            <CommentsTab comments={activity.comments} loading={loadingActivity} />
          )}

          {activeTab === "danger" && (
            <DangerZoneTab user={user} />
          )}
        </section>
      </div>
    </div>
  );
}

function EditProfileTab({ user, onUpdated }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
    bio: user?.bio || "",
    website: user?.website || "",
    location: user?.location || "",
    showEmail: user?.showEmail !== false,
    showLikedPosts: user?.showLikedPosts !== false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        username: user.username || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        showEmail: user.showEmail !== false,
        showLikedPosts: user.showLikedPosts !== false,
      });
    }
  }, [user]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleEmailPrivacy = () => {
    setForm((f) => ({ ...f, showEmail: !f.showEmail }));
  };

  const toggleLikedPostsPrivacy = () => {
    setForm((f) => ({ ...f, showLikedPosts: !f.showLikedPosts }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save profile");

      onUpdated((prev) => ({
        ...prev,
        ...json.user,
      }));
      toast.success("Profile and privacy preferences saved successfully!");
    } catch (e) {
      toast.error(e.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const defaultAvatar = user?.avatar || (user ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.username || user.fullName || "user")}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf` : "");

  return (
    <div className="space-y-6">
      {/* Public Profile Info Card */}
      <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
        <CardHeader className="border-b border-[var(--border)] pb-4">
          <CardTitle className="text-base sm:text-lg font-bold">Public Profile Information</CardTitle>
          <CardDescription className="text-xs text-[var(--muted-foreground)]">
            This information is shown on your public author profile across the blog.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Avatar Section - Profile Avatar */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden relative bg-[var(--muted)] shrink-0 shadow-xs">
                  {defaultAvatar ? (
                    <Image
                      src={defaultAvatar}
                      alt="Profile avatar"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--muted-foreground)]">
                      {(form.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    @{form.username || user?.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  placeholder="Alex Johnson"
                  required
                  className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="alex_dev"
                  required
                  className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Author Bio
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={onChange}
                  rows={3}
                  placeholder="Share your interests, tech stack, and experience..."
                  className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Website / Portfolio Link
                </label>
                <Input
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={onChange}
                  placeholder="https://yourportfolio.dev"
                  type="url"
                  className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Location
                </label>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="San Francisco, CA"
                  className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm"
                />
              </div>
            </div>

            {/* Privacy Settings Section */}
            <div className="pt-4 border-t border-[var(--border)] space-y-4">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Public Profile Privacy Preferences</h3>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Control which personal details and interactions are visible to other users when viewing your author profile.
              </p>

              <div className="space-y-3">
                {/* Email Privacy Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-2">
                      {form.showEmail ? (
                        <EyeIcon className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                        Show Email Address on Public Profile
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {form.showEmail
                        ? "Your registered email is visible to other visitors on your author page."
                        : "Your email is kept private and hidden from public visitors."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleEmailPrivacy}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      form.showEmail ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                    role="switch"
                    aria-checked={Boolean(form.showEmail)}
                    suppressHydrationWarning
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        form.showEmail ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Liked Articles Privacy Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-2">
                      {form.showLikedPosts ? (
                        <HeartIcon className="w-4 h-4 text-rose-500" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                        Show Liked Articles on Public Profile
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {form.showLikedPosts
                        ? "Your upvoted and bookmarked articles are shown on your public profile tab."
                        : "Your liked articles activity is hidden from public visitors."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleLikedPostsPrivacy}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      form.showLikedPosts ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                    role="switch"
                    aria-checked={Boolean(form.showLikedPosts)}
                    suppressHydrationWarning
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        form.showLikedPosts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--border)]">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="cursor-pointer px-6 font-semibold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20"
              >
                {saving ? "Saving Changes..." : "Save Profile & Privacy Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function LikesTab({ likes, loading }) {
  if (loading) {
    return (
      <Card className="border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">Loading your liked articles...</p>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
      <CardHeader className="border-b border-[var(--border)] pb-4">
        <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
          <HeartIcon className="w-5 h-5 text-rose-500" />
          <span>Articles You&apos;ve Liked ({likes?.length || 0})</span>
        </CardTitle>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          All the tech stories and tutorials you have upvoted and bookmarked.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!likes || likes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <HeartIcon className="w-12 h-12 text-[var(--muted-foreground)]/40 mx-auto" />
            <p className="text-sm font-medium text-[var(--foreground)]">No liked articles yet</p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
              Explore the blog and tap the heart icon on any post you enjoy to bookmark it here.
            </p>
            <Link href="/blog">
              <Button variant="outline" size="sm" className="mt-2 text-xs cursor-pointer">
                Explore Blog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {likes.map((like) => {
              const post = like.post;
              if (!post) return null;
              return (
                <div key={like.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-semibold text-sm sm:text-base text-[var(--foreground)] hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    {post.excerpt && (
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)] pt-1">
                      <span suppressHydrationWarning>Liked on {new Date(like.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {post.readTime && <span>• {post.readTime} min read</span>}
                    </div>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" size="sm" className="shrink-0 text-xs gap-1">
                      <span>Read</span>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommentsTab({ comments, loading }) {
  if (loading) {
    return (
      <Card className="border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">Loading your comments...</p>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
      <CardHeader className="border-b border-[var(--border)] pb-4">
        <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-indigo-500" />
          <span>Your Discussions & Comments ({comments?.length || 0})</span>
        </CardTitle>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          Comments and insights you have published across blog posts.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!comments || comments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <ChatBubbleLeftEllipsisIcon className="w-12 h-12 text-[var(--muted-foreground)]/40 mx-auto" />
            <p className="text-sm font-medium text-[var(--foreground)]">No comments posted yet</p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
              Join discussions on tutorial posts to ask questions or share insights.
            </p>
            <Link href="/blog">
              <Button variant="outline" size="sm" className="mt-2 text-xs cursor-pointer">
                Explore Blog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <span>On:</span>
                    <Link
                      href={`/blog/${comment.post?.slug}`}
                      className="font-semibold text-[var(--foreground)] hover:text-indigo-600 line-clamp-1 transition-colors"
                    >
                      {comment.post?.title || "Article"}
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {comment.approved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <ClockIcon className="w-3 h-3" />
                        <span>Under Review</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed italic bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                  &ldquo;{comment.content}&rdquo;
                </p>

                <div className="text-[11px] text-[var(--muted-foreground)] flex items-center justify-between pt-1">
                  <span suppressHydrationWarning>{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <Link href={`/blog/${comment.post?.slug}`} className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                    <span>View Post</span>
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DangerZoneTab({ user }) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const canDelete = confirm.trim() === "DELETE MY ACCOUNT";

  const onDelete = async () => {
    if (!canDelete || busy) return;
    try {
      setBusy(true);
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete account");
      toast.success("Account deleted successfully.");
      router.push("/");
      router.refresh();
    } catch (e) {
      toast.error(e.message || "Failed to delete account");
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = () => {
    router.push("/auth/signout");
  };

  return (
    <div className="space-y-6">
      {/* Active Session Management Card */}
      <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
        <CardHeader className="pb-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                <span>Active Session</span>
              </CardTitle>
              <CardDescription className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Signed in as <strong className="text-[var(--foreground)]">{user?.fullName || user?.username}</strong> ({user?.email})
              </CardDescription>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Active Now
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted-foreground)] max-w-md leading-relaxed">
            End your current browser session securely. You can sign back into your TechBlog profile anytime with your credentials.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="gap-2 cursor-pointer text-xs shrink-0 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Sign Out Session</span>
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion Card (High-Contrast Red Danger Alert) */}
      <Card className="border-2 border-red-500/40 bg-red-500/[0.03] text-[var(--foreground)] shadow-xs overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-600 to-red-700" />
        <CardHeader className="border-b border-red-500/20 pb-4">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
            <ShieldExclamationIcon className="w-6 h-6 shrink-0" />
            <div>
              <CardTitle className="text-base font-bold text-red-600 dark:text-red-400">
                Permanently Delete Account
              </CardTitle>
              <CardDescription className="text-xs text-red-700/80 dark:text-red-300/80 mt-0.5">
                Warning: This action is permanent and completely irreversible.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          <div className="p-3.5 rounded-xl bg-red-100/60 dark:bg-red-950/40 border border-red-300/60 dark:border-red-800/60 text-xs text-red-900 dark:text-red-200 space-y-1.5 leading-relaxed">
            <p className="font-semibold flex items-center gap-1.5">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              <span>Consequences of deleting your account:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-red-800 dark:text-red-300">
              <li>All active user sessions across all devices will be immediately revoked.</li>
              <li>Your login credentials and personal profile information will be purged.</li>
              <li>Your comments and liked posts history will be permanently disassociated.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmDelete" className="block text-xs font-semibold text-[var(--foreground)]">
              To proceed, please type <span className="font-mono text-red-600 dark:text-red-400 font-bold">DELETE MY ACCOUNT</span> below:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="confirmDelete"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="flex-1 bg-[var(--background)] border-red-300 dark:border-red-800 focus:border-red-600 text-xs font-mono font-semibold"
              />
              <Button
                type="button"
                disabled={!canDelete || busy}
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 disabled:opacity-40 cursor-pointer text-xs shrink-0 font-semibold px-4 py-2"
              >
                <TrashIcon className="w-4 h-4 mr-1.5" />
                {busy ? "Deleting Account..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
