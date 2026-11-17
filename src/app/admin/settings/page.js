"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from "@/components/ui";
import { 
  TagIcon, 
  FolderIcon, 
  CheckCircleIcon, 
  Cog6ToothIcon, 
  DocumentTextIcon, 
  HomeIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    postsPerPage: 9,
    homeFeaturedCount: 6,
    homeTrendingCount: 6,
    homeLatestCount: 9,
    categoriesLimit: 6,
    tagsLimit: 12,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setForm({
            postsPerPage: data.postsPerPage ?? 9,
            homeFeaturedCount: data.homeFeaturedCount ?? 6,
            homeTrendingCount: data.homeTrendingCount ?? 6,
            homeLatestCount: data.homeLatestCount ?? 9,
            categoriesLimit: data.categoriesLimit ?? data.categoriesCount ?? 6,
            tagsLimit: data.tagsLimit ?? data.tagsCount ?? 12,
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postsPerPage: Number(form.postsPerPage),
          homeFeaturedCount: Number(form.homeFeaturedCount),
          homeTrendingCount: Number(form.homeTrendingCount),
          homeLatestCount: Number(form.homeLatestCount),
          categoriesLimit: Number(form.categoriesLimit),
          tagsLimit: Number(form.tagsLimit),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      toast.success("Blog settings saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Blog Settings">
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Blog Configuration & Page Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Configure pagination, item counts, and display density across the blog, home page, and sidebars.
          </p>
        </div>

        {loading ? (
          <Card className="border-[var(--border)] bg-[var(--card)] p-12 text-center">
            <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">Loading blog settings...</p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Blog Listing & Pagination */}
            <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
              <CardHeader className="p-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <DocumentTextIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">Blog Feed & Pagination</CardTitle>
                    <CardDescription className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Control the number of posts loaded per page on the main blog index (/blog).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="max-w-md p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="postsPerPage" className="text-sm font-semibold text-[var(--foreground)]">
                      Posts Per Page
                    </label>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                      {form.postsPerPage} posts/page
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Determines pagination chunking. Lower numbers load faster and preserve database bandwidth.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <Input
                      id="postsPerPage"
                      type="number"
                      min={3}
                      max={48}
                      step={3}
                      value={form.postsPerPage}
                      onChange={(e) => setForm((prev) => ({ ...prev, postsPerPage: e.target.value }))}
                      required
                      className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm font-semibold max-w-[120px]"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[6, 9, 12, 18].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, postsPerPage: val }))}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            Number(form.postsPerPage) === val
                              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                              : "border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Home Page Item Limits */}
            <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
              <CardHeader className="p-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <HomeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">Home Page Section Counts</CardTitle>
                    <CardDescription className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Configure the number of posts queried and shown in each home page section.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Featured Count */}
                  <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-amber-500 shrink-0" />
                      <label htmlFor="homeFeaturedCount" className="text-sm font-semibold text-[var(--foreground)]">
                        Featured Posts
                      </label>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Hero featured articles shown on the homepage.
                    </p>
                    <Input
                      id="homeFeaturedCount"
                      type="number"
                      min={1}
                      max={18}
                      value={form.homeFeaturedCount}
                      onChange={(e) => setForm((prev) => ({ ...prev, homeFeaturedCount: e.target.value }))}
                      required
                      className="mt-2 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm font-semibold"
                    />
                  </div>

                  {/* Latest Count */}
                  <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      <label htmlFor="homeLatestCount" className="text-sm font-semibold text-[var(--foreground)]">
                        Latest Posts
                      </label>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Recent articles grid displayed on the home page.
                    </p>
                    <Input
                      id="homeLatestCount"
                      type="number"
                      min={3}
                      max={24}
                      value={form.homeLatestCount}
                      onChange={(e) => setForm((prev) => ({ ...prev, homeLatestCount: e.target.value }))}
                      required
                      className="mt-2 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm font-semibold"
                    />
                  </div>

                  {/* Trending Count */}
                  <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <FireIcon className="w-4 h-4 text-rose-500 shrink-0" />
                      <label htmlFor="homeTrendingCount" className="text-sm font-semibold text-[var(--foreground)]">
                        Trending Posts
                      </label>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Most viewed posts shown in the trending section.
                    </p>
                    <Input
                      id="homeTrendingCount"
                      type="number"
                      min={1}
                      max={18}
                      value={form.homeTrendingCount}
                      onChange={(e) => setForm((prev) => ({ ...prev, homeTrendingCount: e.target.value }))}
                      required
                      className="mt-2 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm font-semibold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Sidebar List Limits */}
            <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
              <CardHeader className="p-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Cog6ToothIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">Right Sidebar List Limits</CardTitle>
                    <CardDescription className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Control the density of categories and tags shown to readers in the blog sidebar.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Categories Count */}
                  <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      <label htmlFor="categoriesLimit" className="text-sm font-semibold text-[var(--foreground)]">
                        Categories Display Limit
                      </label>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Maximum top categories to show in the sidebar (recommended: 4 to 12).
                    </p>
                    <Input
                      id="categoriesLimit"
                      type="number"
                      min={1}
                      max={50}
                      value={form.categoriesLimit}
                      onChange={(e) => setForm((prev) => ({ ...prev, categoriesLimit: e.target.value }))}
                      required
                      className="mt-2 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm font-semibold"
                    />
                  </div>

                  {/* Tags Count */}
                  <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-purple-500 shrink-0" />
                      <label htmlFor="tagsLimit" className="text-sm font-semibold text-[var(--foreground)]">
                        Tags Display Limit
                      </label>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Maximum popular tags to show in the sidebar cloud (recommended: 8 to 25).
                    </p>
                    <Input
                      id="tagsLimit"
                      type="number"
                      min={1}
                      max={100}
                      value={form.tagsLimit}
                      onChange={(e) => setForm((prev) => ({ ...prev, tagsLimit: e.target.value }))}
                      required
                      className="mt-2 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm font-semibold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Actions Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Changes take effect immediately across all blog and home pages.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="w-full sm:w-auto cursor-pointer px-7 py-3 font-semibold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20"
              >
                {saving ? "Saving Changes..." : "Save Blog Settings"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
