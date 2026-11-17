"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChatBubbleLeftEllipsisIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const CONTACT_STATUS = {
  PENDING: { label: 'Pending', badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' },
  IN_PROGRESS: { label: 'In Progress', badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  RESPONDED: { label: 'Responded', badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
  CLOSED: { label: 'Closed', badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20' },
  SPAM: { label: 'Spam', badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' },
  ARCHIVED: { label: 'Archived', badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' }
};

const PRIORITY_BADGES = {
  LOW: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  MEDIUM: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
  HIGH: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50',
  URGENT: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50'
};

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [contacts, setContacts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, responded: 0, spam: 0, archived: 0, highPriority: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [queueMetrics, setQueueMetrics] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [session?.user?.type, status, router]);

  // Fetch contacts list
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.search ? { search: filters.search } : {}),
      });

      const res = await fetch(`/api/admin/contacts?${query}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
        }));
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
      toast.error('Failed to fetch contact inquiries');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch email queue metrics for system design showcase
  const fetchQueueMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/email-queue?limit=1');
      if (res.ok) {
        const data = await res.json();
        setQueueMetrics(data.metrics);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (session?.user?.type === 'admin') {
      fetchContacts();
      fetchQueueMetrics();
    }
  }, [session?.user?.type, fetchContacts, fetchQueueMetrics]);

  // Update status
  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      // Optimistic update
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
      );

      const res = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Marked as ${newStatus}`);
      fetchContacts();
    } catch (err) {
      toast.error(err.message || 'Error updating status');
      fetchContacts();
    }
  };

  // Delete inquiry
  const handleDeleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to permanently delete this contact inquiry?')) return;

    try {
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      const res = await fetch(`/api/admin/contacts/${contactId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Inquiry removed');
      fetchContacts();
    } catch (err) {
      toast.error(err.message || 'Error deleting');
      fetchContacts();
    }
  };

  // Send reply through Email Queue
  const handleSendReply = async () => {
    if (!selectedContact || !replyText.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    try {
      setReplying(true);
      const res = await fetch(`/api/admin/contacts/${selectedContact.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: replyText.trim(),
          subject: `Re: ${selectedContact.subject || 'Your Inquiry to TechBlog'}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send response');

      toast.success('Reply queued for automated delivery!');
      setShowReplyModal(false);
      setReplyText('');
      setSelectedContact(null);
      fetchContacts();
      fetchQueueMetrics();
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session?.user?.type !== 'admin') return null;

  return (
    <AdminLayout title="Contacts Management">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)]">
              Contact Inquiries &amp; Messages
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">
              Manage incoming inquiries, trigger asynchronous email replies, and review queue telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {queueMetrics && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Queue: <strong>{queueMetrics.pending}</strong> pending / <strong>{queueMetrics.sent}</strong> delivered</span>
              </div>
            )}
            <Button
              onClick={() => {
                fetchContacts();
                fetchQueueMetrics();
              }}
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer text-xs"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Summary Stat Cards (Theme-Aware) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Total Inquiries', count: summary.total, icon: EnvelopeIcon, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
            { label: 'Pending Action', count: summary.pending, icon: ClockIcon, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
            { label: 'Responded', count: summary.responded, icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
            { label: 'High Priority', count: summary.highPriority, icon: ExclamationTriangleIcon, color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
            { label: 'Spam Blocked', count: summary.spam, icon: ExclamationTriangleIcon, color: 'text-red-600 dark:text-red-400 bg-red-500/10' },
            { label: 'Archived', count: summary.archived, icon: ArchiveBoxIcon, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10' },
          ].map((item, idx) => (
            <Card key={idx} className="border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--muted-foreground)]">{item.label}</p>
                  <p className="text-xl font-bold text-[var(--foreground)] mt-0.5">{item.count || 0}</p>
                </div>
                <div className={`p-2 rounded-xl ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Controls */}
        <Card className="border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search sender, email, subject..."
                  value={filters.search}
                  onChange={(e) => {
                    const val = e.target.value;
                    startTransition(() => {
                      setFilters((prev) => ({ ...prev, search: val }));
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    });
                  }}
                  className="pl-9 bg-[var(--background)] border-[var(--input)] text-xs text-[var(--foreground)] h-9"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({ ...prev, status: val }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full h-9 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESPONDED">Responded</option>
                  <option value="CLOSED">Closed</option>
                  <option value="SPAM">Spam</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={filters.priority}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({ ...prev, priority: val }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full h-9 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={filters.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({ ...prev, category: val }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full h-9 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Collaboration & Partnership">Collaboration</option>
                  <option value="Content & Guest Posts">Content Submission</option>
                  <option value="Bug Report & Feedback">Bug Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card className="border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject &amp; Message</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[var(--muted-foreground)]">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span>Loading inquiries...</span>
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[var(--muted-foreground)] space-y-2">
                      <EnvelopeIcon className="w-8 h-8 mx-auto text-[var(--muted-foreground)]/50" />
                      <p className="font-semibold text-sm text-[var(--foreground)]">No contact inquiries found</p>
                      <p className="text-xs">Try adjusting your filters or search keywords.</p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => {
                    const statusConfig = CONTACT_STATUS[contact.status] || CONTACT_STATUS.PENDING;
                    return (
                      <tr
                        key={contact.id}
                        className="hover:bg-[var(--muted)]/30 transition-colors group"
                      >
                        {/* Sender */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--foreground)]">{contact.name}</div>
                          <div className="text-[11px] text-[var(--muted-foreground)] truncate max-w-[160px]">{contact.email}</div>
                          {contact.priority && contact.priority !== 'MEDIUM' && (
                            <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${PRIORITY_BADGES[contact.priority] || ''}`}>
                              {contact.priority}
                            </span>
                          )}
                        </td>

                        {/* Subject & Message Snippet */}
                        <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                          <div className="font-semibold text-[var(--foreground)] truncate">
                            {contact.subject || 'General Inquiry'}
                          </div>
                          <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                            {contact.message}
                          </p>
                          {contact.response && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              <span>Responded</span>
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                            <TagIcon className="w-2.5 h-2.5" />
                            <span>{contact.category || 'General'}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig.badgeClass}`}>
                            {statusConfig.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">
                          {new Date(contact.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowReplyModal(false);
                              }}
                              className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-indigo-600 transition-colors"
                              title="View details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowReplyModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[var(--muted-foreground)] hover:text-indigo-600 transition-colors"
                              title="Reply via Email Queue"
                            >
                              <PaperAirplaneIcon className="w-4 h-4 text-indigo-500" />
                            </button>

                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[var(--muted-foreground)] hover:text-rose-600 transition-colors"
                              title="Delete inquiry"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              <span>
                Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page <= 1}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1 px-2.5 h-8 text-xs"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </Button>
                <Button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                  disabled={pagination.page >= pagination.totalPages}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1 px-2.5 h-8 text-xs"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* View Message Modal */}
      {selectedContact && !showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)]">{selectedContact.subject || 'Inquiry Details'}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">From {selectedContact.name} ({selectedContact.email})</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {selectedContact.message}
            </div>

            {selectedContact.response && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <span className="font-bold block">Sent Response:</span>
                <p className="italic">{selectedContact.response}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleUpdateStatus(selectedContact.id, e.target.value)}
                  className="text-xs rounded-lg border border-[var(--input)] bg-[var(--background)] px-2.5 py-1.5 text-[var(--foreground)]"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESPONDED">Responded</option>
                  <option value="CLOSED">Closed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowReplyModal(true)}
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </Button>
                <Button
                  onClick={() => setSelectedContact(null)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal via Email Queue */}
      {selectedContact && showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-indigo-500" />
                  <span>Reply to {selectedContact.name}</span>
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">Recipient: {selectedContact.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedContact(null);
                }}
                className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label htmlFor="replyText" className="block text-xs font-semibold text-[var(--foreground)]">
                Email Message Body
              </label>
              <textarea
                id="replyText"
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here. It will be dispatched through the resilient email queue..."
                className="w-full rounded-xl border border-[var(--input)] bg-[var(--background)] p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              <span>Dispatched asynchronously via Email Queue.</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowReplyModal(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendReply}
                  disabled={replying || !replyText.trim()}
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
                >
                  {replying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Queueing...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-3.5 h-3.5" />
                      <span>Dispatch Reply</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
