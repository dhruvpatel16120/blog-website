"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  UserCircleIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const isAuthenticated = status === "authenticated" && session?.user?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/me`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setUser(data);
      } catch (e) {
        toast.error(e.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  if (status === "loading" || (isAuthenticated && loading && !user)) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">Loading your profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Account Settings
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Manage your public author profile, personal preferences, and security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Preview */}
        <div className="lg:col-span-1">
          <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm sticky top-24 overflow-hidden">
            {/* Top decorative gradient band */}
            <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <CardContent className="pt-0 -mt-12 px-6 pb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-[var(--card)] bg-[var(--background)] overflow-hidden shadow-md relative">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="User avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--muted)] text-[var(--foreground)] text-2xl font-bold">
                      {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <h2 className="mt-3 text-lg font-bold text-[var(--foreground)]">
                  {user?.fullName || user?.username}
                </h2>
                <p className="text-xs font-mono text-[var(--muted-foreground)]">
                  @{user?.username}
                </p>

                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                  {user?.role || "MEMBER"}
                </div>
              </div>

              {/* Bio & Links */}
              <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-3 text-sm">
                {user?.bio ? (
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed italic">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] italic">
                    No bio added yet. Add one in the edit form!
                  </p>
                )}

                <div className="pt-2 space-y-2 text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>

                  {user?.location && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                      <span>{user.location}</span>
                    </div>
                  )}

                  {user?.website && (
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                      <a
                        href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--primary)] hover:underline inline-flex items-center gap-1 truncate"
                      >
                        <span>{user.website.replace(/^https?:\/\//, "")}</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                    <span>
                      Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Recently"}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                {user?.stats && (
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--border)]">
                    <StatItem label="Articles" value={user.stats.postCount} />
                    <StatItem label="Comments" value={user.stats.commentCount} />
                    <StatItem label="Likes" value={user.stats.likeCount} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          <EditProfileCard user={user} onUpdated={setUser} />
          <DangerZoneCard />
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-2.5 text-center">
      <div className="text-base font-bold text-[var(--foreground)]">{value ?? 0}</div>
      <div className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

function EditProfileCard({ user, onUpdated }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    website: "",
    location: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        username: user.username || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("category", "avatar");

    try {
      setUploadingAvatar(true);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setForm((f) => ({ ...f, avatar: json.url }));
      toast.success("Avatar uploaded! Remember to click Save.");
    } catch (e) {
      toast.error(e.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
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
      toast.success("Profile updated successfully!");
    } catch (e) {
      toast.error(e.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm">
      <CardHeader className="border-b border-[var(--border)] pb-4">
        <CardTitle className="text-lg font-bold text-[var(--foreground)]">
          Profile Details
        </CardTitle>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          Update your public persona and social presence on TechBlog.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--border)] overflow-hidden relative bg-[var(--muted)] shrink-0">
                {form.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--muted-foreground)]">
                    {(form.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] text-xs font-medium text-[var(--foreground)] transition-colors cursor-pointer shadow-xs">
                  <CameraIcon className="w-4 h-4 text-[var(--primary)]" />
                  <span>{uploadingAvatar ? "Uploading..." : "Change avatar"}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </label>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                  JPG, PNG or GIF up to 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="Your full name"
                required
                className="w-full bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Username
              </label>
              <Input
                id="username"
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="unique_username"
                required
                className="w-full bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={onChange}
                rows={3}
                placeholder="Share a short bio with the tech community..."
                className="w-full bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Website
              </label>
              <Input
                id="website"
                name="website"
                value={form.website}
                onChange={onChange}
                placeholder="https://yourportfolio.dev"
                type="url"
                className="w-full bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={form.location}
                onChange={onChange}
                placeholder="City, Country"
                className="w-full bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--border)]">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="cursor-pointer px-6 font-medium"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DangerZoneCard() {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const canDelete = confirm.trim().toLowerCase() === "delete my account";

  const onDelete = async () => {
    if (!canDelete) return;
    try {
      setBusy(true);
      const res = await fetch(`/api/profile`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete account");
      toast.success("Your account has been deleted");
      router.push("/");
      router.refresh();
    } catch (e) {
      toast.error(e.message || "Failed to delete account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-rose-500/30 bg-rose-500/5 text-[var(--foreground)] shadow-xs">
      <CardHeader className="border-b border-rose-500/20 pb-4">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <CardTitle className="text-base font-bold">Danger Zone</CardTitle>
        </div>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          Irreversible account deactivation and data detachment.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          Deleting your account will permanently remove your login credentials, anonymize your author identity, and revoke access. To confirm, please type <strong className="text-[var(--foreground)] font-mono">DELETE MY ACCOUNT</strong> below:
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
            className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600 disabled:opacity-40 cursor-pointer text-xs"
          >
            <TrashIcon className="w-4 h-4 mr-1.5" />
            {busy ? "Deleting..." : "Permanently Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
