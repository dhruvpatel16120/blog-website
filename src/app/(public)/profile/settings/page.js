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
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'likes' | 'comments' | 'danger'
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState({ comments: [], likes: [], posts: [] });
  const [loadingActivity, setLoadingActivity] = useState(false);

  const isAuthenticated = status === "authenticated" && session?.user?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile/settings");
    }
  }, [status, router]);

  // Fetch current user details
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setUser(data);
      } catch (e) {
        toast.error(e.message || "Error loading profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  // Fetch activity when clicking likes or comments tab
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "likes" || activeTab === "comments") {
      const fetchActivity = async () => {
        try {
          setLoadingActivity(true);
          const res = await fetch("/api/profile/activity", { cache: "no-store" });
          if (!res.ok) throw new Error("Failed to fetch activity");
          const data = await res.json();
          setActivity(data);
        } catch (e) {
          toast.error("Could not load your activity items.");
        } finally {
          setLoadingActivity(false);
        }
      };
      fetchActivity();
    }
  }, [isAuthenticated, activeTab]);

  if (status === "loading" || (isAuthenticated && loading && !user)) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">Loading profile settings...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/profile"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Back to Public Profile</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Manage your personal credentials, public info, and view all your activity.
          </p>
        </div>

        <Link href="/profile">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer text-xs">
            <UserIcon className="w-4 h-4" />
            <span>View Public Profile</span>
          </Button>
        </Link>
      </div>

      {/* Main Settings Navigation & Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <aside className="md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "profile"
                ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("likes")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "likes"
                ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <HeartIcon className="w-4 h-4 shrink-0" />
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
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "comments"
                ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 shrink-0" />
              <span>My Comments</span>
            </div>
            {user?.stats?.commentCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'comments' ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                {user.stats.commentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
              activeTab === "danger"
                ? "bg-rose-600 text-white shadow-xs font-semibold"
                : "text-rose-500 hover:bg-rose-500/10"
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
            <span>Danger Zone</span>
          </button>
        </aside>

        {/* Tab Panels */}
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
      });
    }
  }, [user]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
      toast.success("Profile saved successfully!");
    } catch (e) {
      toast.error(e.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const defaultAvatar = user?.avatar || (user ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.username || user.fullName || "user")}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf` : "");

  return (
    <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
      <CardHeader className="border-b border-[var(--border)] pb-4">
        <CardTitle className="text-base sm:text-lg font-bold">Public Information</CardTitle>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          This info will be visible to everyone on your public author profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Avatar Section - Default assigned avatar */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Assigned Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--border)] overflow-hidden relative bg-[var(--muted)] shrink-0 shadow-xs">
                {defaultAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={defaultAvatar} alt="Default avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--muted-foreground)]">
                    {(form.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">
                  Default System Avatar
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Automatically assigned and synced with your verified user profile.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="Alex Johnson"
                required
                className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] text-sm"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Username
              </label>
              <Input
                id="username"
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="alex_dev"
                required
                className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={onChange}
                rows={3}
                placeholder="Share your interests, tech stack, and background..."
                className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] text-sm"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Website / Portfolio
              </label>
              <Input
                id="website"
                name="website"
                value={form.website}
                onChange={onChange}
                placeholder="https://yourportfolio.dev"
                type="url"
                className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] text-sm"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={form.location}
                onChange={onChange}
                placeholder="San Francisco, CA"
                className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--border)]">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="cursor-pointer px-6 font-medium text-xs sm:text-sm"
            >
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function LikesTab({ likes, loading }) {
  if (loading) {
    return (
      <Card className="border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
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
                Browse Articles
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {likes.map((like) => {
              const post = like.post;
              if (!post) return null;
              return (
                <div
                  key={like.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--muted)] transition-colors"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    {post.excerpt && (
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)] pt-1">
                      <span>By {post.author?.fullName || post.author?.username || "Author"}</span>
                      {post.readTime && <span>• {post.readTime} min read</span>}
                      <span>• Liked {new Date(like.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="shrink-0">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs gap-1 cursor-pointer">
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
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">Loading your comments...</p>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
      <CardHeader className="border-b border-[var(--border)] pb-4">
        <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-[var(--primary)]" />
          <span>Your Discussion Comments ({comments?.length || 0})</span>
        </CardTitle>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          History of all questions, answers, and comments you&apos;ve posted on articles.
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
                      className="font-semibold text-[var(--foreground)] hover:text-[var(--primary)] line-clamp-1 transition-colors"
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
                  <span>{new Date(comment.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                  <Link href={`/blog/${comment.post?.slug}`} className="text-[var(--primary)] hover:underline inline-flex items-center gap-1">
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

  const canDelete = confirm.trim().toLowerCase() === "delete my account";

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
      {/* Session Logout Card */}
      <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
        <CardHeader className="pb-4 border-b border-[var(--border)]">
          <CardTitle className="text-base font-bold">Active Session</CardTitle>
          <CardDescription className="text-xs text-[var(--muted-foreground)]">
            Signed in as {user?.fullName || user?.username} ({user?.email})
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted-foreground)] max-w-md">
            Need to take a break or leave this device? You can sign out safely and return anytime.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="gap-2 cursor-pointer text-xs shrink-0"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion Card */}
      <Card className="border-rose-500/30 bg-rose-500/5 text-[var(--foreground)] shadow-xs">
        <CardHeader className="border-b border-rose-500/20 pb-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <CardTitle className="text-base font-bold">Permanently Delete Account</CardTitle>
          </div>
          <CardDescription className="text-xs text-[var(--muted-foreground)]">
            Irreversible action. All active sessions will be terminated and credentials purged.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Deleting your account will permanently remove your password, deactivate your access, and detach your author identity. To proceed, please type <strong className="text-[var(--foreground)] font-mono font-bold">DELETE MY ACCOUNT</strong>:
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="flex-1 bg-[var(--background)] border-rose-500/30 focus:border-rose-500 text-xs font-mono"
            />
            <Button
              type="button"
              disabled={!canDelete || busy}
              onClick={onDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600 disabled:opacity-40 cursor-pointer text-xs shrink-0"
            >
              <TrashIcon className="w-4 h-4 mr-1.5" />
              {busy ? "Deleting..." : "Permanently Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
