"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const isAuthenticated = status === "authenticated" && session?.user?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
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

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-lg">Your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                {user?.avatar ? (
                  <Image src={user.avatar} alt="avatar" width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-xl font-semibold">
                    {(user?.fullName || user?.username || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xl font-semibold">{user?.fullName || user?.username}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              {user?.bio && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Bio</div>
                  <div className="leading-relaxed">{user.bio}</div>
                </div>
              )}
              {user?.website && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Website</div>
                  <a className="text-indigo-500 hover:underline" href={user.website} target="_blank" rel="noreferrer">
                    {user.website}
                  </a>
                </div>
              )}
              {user?.location && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Location</div>
                  <div>{user.location}</div>
                </div>
              )}
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">Joined</div>
                <div>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</div>
              </div>
              {user?.stats && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Stat label="Posts" value={user.stats.postCount} />
                  <Stat label="Comments" value={user.stats.commentCount} />
                  <Stat label="Likes" value={user.stats.likeCount} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit */}
        <EditProfile user={user} onUpdated={setUser} />
      </div>
      <div className="mt-6">
        <DangerZone userId={user?.id} />
      </div>
    </div>
  );
}

function EditProfile({ user, onUpdated }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    website: "",
    location: "",
    avatar: "",
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
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("category", "avatar");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setForm((f) => ({ ...f, avatar: json.url }));
      toast.success("Avatar uploaded");
    } catch (e) {
      toast.error(e.message);
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
      if (!res.ok) throw new Error(json.error || "Failed to save");
      onUpdated(json.user);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-lg">Edit profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              {form.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-lg font-semibold">
                  {(form.fullName || form.username || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors border-indigo-500 text-indigo-400/90 bg-transparent hover:bg-indigo-500 hover:text-white cursor-pointer">
              <input type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
              Change avatar
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Full name</label>
              <input name="fullName" value={form.fullName} onChange={onChange} className="w-full mt-1 input" placeholder="Your full name" />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Username</label>
              <input name="username" value={form.username} onChange={onChange} className="w-full mt-1 input" placeholder="Choose a unique username" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">Bio</label>
              <textarea name="bio" value={form.bio} onChange={onChange} rows={3} className="w-full mt-1 textarea border" placeholder="Tell us a bit about you" />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Website</label>
              <input name="website" value={form.website} onChange={onChange} className="w-full mt-1 input" placeholder="https://" />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Location</label>
              <input name="location" value={form.location} onChange={onChange} className="w-full mt-1 input" placeholder="City, Country" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors border-indigo-500 text-indigo-400/90 bg-transparent hover:bg-indigo-500 hover:text-white">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DangerZone({ userId }) {
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
        body: JSON.stringify({ id: userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete account");
      toast.success("Account deleted");
      router.push("/");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-red-600">Danger zone</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Type <span className="font-semibold">DELETE MY ACCOUNT</span> to permanently remove your account and all associated data. This action cannot be undone.
        </p>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="DELETE MY ACCOUNT"
          className="input w-full mb-3"
        />
        <button
          disabled={!canDelete || busy}
          onClick={onDelete}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors border-red-600 text-red-500 bg-transparent hover:bg-red-600 hover:text-white disabled:opacity-50"
        >
          {busy ? "Deleting..." : "Delete account"}
        </button>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-center">
      <div className="text-base font-semibold">{value ?? 0}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}


