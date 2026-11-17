"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from "@/components/ui";
import { TagIcon, FolderIcon, CheckCircleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    categoriesCount: 6,
    tagsCount: 12,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setForm({
            categoriesCount: data.categoriesCount ?? 6,
            tagsCount: data.tagsCount ?? 12,
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
          categoriesCount: Number(form.categoriesCount),
          tagsCount: Number(form.tagsCount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      toast.success("Sidebar settings saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Blog Settings">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Blog Sidebar Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Configure the maximum number of categories and tags displayed in the public blog sidebar.
          </p>
        </div>

        {loading ? (
          <Card className="border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">Loading settings...</p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
              <CardHeader className="p-6 sm:p-7 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Cog6ToothIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">Right Sidebar List Limits</CardTitle>
                    <CardDescription className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Control the density of categories and tags shown to readers on blog pages.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-7 pt-6 space-y-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Categories Count */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      <label htmlFor="categoriesCount" className="text-sm font-semibold text-[var(--foreground)]">
                        Categories Display Limit
                      </label>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Maximum number of top categories to show in the sidebar (recommended: 4 to 12).
                    </p>
                    <Input
                      id="categoriesCount"
                      type="number"
                      min={1}
                      max={50}
                      value={form.categoriesCount}
                      onChange={(e) => setForm((prev) => ({ ...prev, categoriesCount: e.target.value }))}
                      required
                      className="mt-3 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm font-semibold"
                    />
                  </div>

                  {/* Tags Count */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-purple-500 shrink-0" />
                      <label htmlFor="tagsCount" className="text-sm font-semibold text-[var(--foreground)]">
                        Tags Display Limit
                      </label>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Maximum number of popular tags to show in the sidebar tag cloud (recommended: 8 to 25).
                    </p>
                    <Input
                      id="tagsCount"
                      type="number"
                      min={1}
                      max={100}
                      value={form.tagsCount}
                      onChange={(e) => setForm((prev) => ({ ...prev, tagsCount: e.target.value }))}
                      required
                      className="mt-3 bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Changes take effect immediately across all blog pages.</span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    className="w-full sm:w-auto cursor-pointer px-6 py-2.5 font-semibold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20"
                  >
                    {saving ? "Saving Changes..." : "Save Sidebar Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
