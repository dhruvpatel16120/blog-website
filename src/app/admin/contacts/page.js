"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
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
  ChevronRightIcon,
  ShieldExclamationIcon,
  ArrowUturnLeftIcon,
  CheckIcon
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
  HIGH: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:orange-950/40 border-orange-200 dark:border-orange-900/50',
  URGENT: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50'
};

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [contacts, setContacts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, responded: 0, spam: 0, archived: 0, highPriority: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replying, setReplying] = useState(false);
  const [queueMetrics, setQueueMetrics] = useState(null);
  const [queueProcessing, setQueueProcessing] = useState(false);

  // Multi-selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Search input state (with debouncing)
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef(null);

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

  // Handle debounced search input
  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: val }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setFilters((prev) => ({ ...prev, search: '' }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

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

  // Fetch email queue metrics
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

  // Trigger manual processing of pending email queue
  const handleProcessEmailQueue = async () => {
    try {
      setQueueProcessing(true);
      const res = await fetch('/api/admin/email-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Processed: ${data.result?.succeeded || 0} sent, ${data.result?.failed || 0} failed`);
        fetchQueueMetrics();
      } else {
        throw new Error(data.error || 'Failed to process queue');
      }
    } catch (err) {
      toast.error(err.message || 'Queue trigger failed');
    } finally {
      setQueueProcessing(false);
    }
  };

  // Trigger retry of failed emails
  const handleRetryFailedEmails = async () => {
    try {
      setQueueProcessing(true);
      const res = await fetch('/api/admin/email-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry-failed' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Requeued ${data.retriedCount || 0} failed emails`);
        fetchQueueMetrics();
      } else {
        throw new Error(data.error || 'Failed to retry');
      }
    } catch (err) {
      toast.error(err.message || 'Retry failed');
    } finally {
      setQueueProcessing(false);
    }
  };

  // Update single contact status
  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      // Optimistic update
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
      );
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact((prev) => ({ ...prev, status: newStatus }));
      }

      const res = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Marked as ${newStatus}`);
      fetchContacts();
    } catch (err) {
      toast.error(err.message || 'Error updating status');
      fetchContacts();
    }
  };

  // Delete single inquiry
  const handleDeleteContact = async (contact) => {
    if (!confirm(`Are you sure you want to delete inquiry from "${contact.name}"?`)) return;

    try {
      // If contact is not yet archived or spam, archive it first or delete directly
      let res = await fetch(`/api/admin/contacts/${contact.id}`, { method: 'DELETE' });
      
      // If backend requires it to be archived/spam first, handle gracefully
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error && errorData.error.includes('Only contacts marked as SPAM or ARCHIVED')) {
          // Auto-archive first, then delete
          await fetch(`/api/admin/contacts/${contact.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ARCHIVED' })
          });
          res = await fetch(`/api/admin/contacts/${contact.id}`, { method: 'DELETE' });
        }
      }

      if (!res.ok) throw new Error('Failed to delete inquiry');

      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      setSelectedIds((prev) => prev.filter((id) => id !== contact.id));
      if (selectedContact?.id === contact.id) setSelectedContact(null);
      toast.success('Inquiry permanently removed');
      fetchContacts();
    } catch (err) {
      toast.error(err.message || 'Error deleting inquiry');
      fetchContacts();
    }
  };

  // Multi-selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(contacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk status update
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedIds.length === 0) return;
    try {
      setBulkLoading(true);
      const res = await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed bulk update');

      toast.success(`Updated ${data.count || selectedIds.length} inquiries to ${newStatus}`);
      setSelectedIds([]);
      fetchContacts();
    } catch (err) {
      toast.error(err.message || 'Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.length} selected inquiries?`)) return;

    try {
      setBulkLoading(true);
      const res = await fetch('/api/admin/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed bulk delete');

      toast.success(`Deleted ${data.count || selectedIds.length} inquiries`);
      setSelectedIds([]);
      fetchContacts();
    } catch (err) {
      toast.error(err.message || 'Bulk delete failed');
    } finally {
      setBulkLoading(false);
    }
  };

  // Open reply modal for a contact
  const handleOpenReplyModal = (contact) => {
    setSelectedContact(contact);
    setReplySubject(`Re: ${contact.subject || 'Your Inquiry to TechBlog'}`);
    setReplyText(`Hello ${contact.name},\n\nThank you for reaching out to us regarding "${contact.subject || 'your inquiry'}".\n\n\n\nBest regards,\nTechBlog Support Team`);
    setShowReplyModal(true);
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
          subject: replySubject.trim() || `Re: ${selectedContact.subject || 'Your Inquiry to TechBlog'}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send response');

      toast.success('Reply queued for automated delivery!');
      setShowReplyModal(false);
      setReplyText('');
      setReplySubject('');
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

  const isAllSelected = contacts.length > 0 && selectedIds.length === contacts.length;

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
              Review visitor inquiries, dispatch queued email responses, and manage communication workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

        {/* Email Queue Telemetry Bar */}
        {queueMetrics && (
          <div className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <PaperAirplaneIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="font-semibold text-[var(--foreground)]">Email Queue Telemetry:</span>
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <strong>{queueMetrics.pending || 0}</strong> Pending
                </span>
                <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <strong>{queueMetrics.processing || 0}</strong> Processing
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckIcon className="w-3.5 h-3.5" />
                  <strong>{queueMetrics.sent || 0}</strong> Delivered
                </span>
                {queueMetrics.failed > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                    <ShieldExclamationIcon className="w-3.5 h-3.5" />
                    <strong>{queueMetrics.failed}</strong> Failed
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {queueMetrics.failed > 0 && (
                <Button
                  onClick={handleRetryFailedEmails}
                  disabled={queueProcessing}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <ArrowUturnLeftIcon className="w-3 h-3" />
                  <span>Retry Failed</span>
                </Button>
              )}
              <Button
                onClick={handleProcessEmailQueue}
                disabled={queueProcessing}
                variant="outline"
                size="sm"
                className="text-xs gap-1 cursor-pointer"
              >
                <ArrowPathIcon className={`w-3 h-3 ${queueProcessing ? 'animate-spin' : ''}`} />
                <span>Process Queue</span>
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Total Inquiries', count: summary.total, icon: EnvelopeIcon, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
            { label: 'Pending Action', count: summary.pending, icon: ClockIcon, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
            { label: 'Responded', count: summary.responded, icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
            { label: 'High Priority', count: summary.highPriority, icon: ExclamationTriangleIcon, color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
            { label: 'Spam Blocked', count: summary.spam, icon: ShieldExclamationIcon, color: 'text-red-600 dark:text-red-400 bg-red-500/10' },
            { label: 'Archived', count: summary.archived, icon: ArchiveBoxIcon, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10' },
          ].map((item, i) => (
            <Card key={i} className="border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{item.label}</p>
                  <p className="text-xl sm:text-2xl font-black text-[var(--foreground)] mt-1">{item.count}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
          {[
            { key: '', label: 'All Inquiries', count: summary.total },
            { key: 'PENDING', label: 'Pending', count: summary.pending },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'RESPONDED', label: 'Responded', count: summary.responded },
            { key: 'CLOSED', label: 'Closed' },
            { key: 'SPAM', label: 'Spam', count: summary.spam },
            { key: 'ARCHIVED', label: 'Archived', count: summary.archived },
          ].map((tab) => {
            const isActive = filters.status === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, status: tab.key }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--border)] text-[var(--foreground)]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <Card className="border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search with Fixed Icon & Clear Button */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search sender, email, subject..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                    title="Clear search"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
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
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Priority</option>
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
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Collaboration & Partnership">Collaboration &amp; Partnership</option>
                  <option value="Content & Guest Posts">Content &amp; Guest Posts</option>
                  <option value="Bug Report & Feedback">Bug Report &amp; Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Reset Filters */}
              <div>
                <Button
                  onClick={() => {
                    setSearchInput('');
                    setFilters({ status: '', category: '', priority: '', search: '' });
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  variant="outline"
                  className="w-full h-9 text-xs cursor-pointer border-slate-200 dark:border-slate-800"
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Action Bar (Visible when rows selected) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {selectedIds.length} {selectedIds.length === 1 ? 'inquiry' : 'inquiries'} selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => handleBulkStatusUpdate('RESPONDED')}
                disabled={bulkLoading}
                size="sm"
                variant="outline"
                className="text-xs h-8 bg-white dark:bg-[#121212]"
              >
                Mark as Responded
              </Button>
              <Button
                onClick={() => handleBulkStatusUpdate('CLOSED')}
                disabled={bulkLoading}
                size="sm"
                variant="outline"
                className="text-xs h-8 bg-white dark:bg-[#121212]"
              >
                Mark as Closed
              </Button>
              <Button
                onClick={() => handleBulkStatusUpdate('ARCHIVED')}
                disabled={bulkLoading}
                size="sm"
                variant="outline"
                className="text-xs h-8 bg-white dark:bg-[#121212]"
              >
                Archive
              </Button>
              <Button
                onClick={() => handleBulkStatusUpdate('SPAM')}
                disabled={bulkLoading}
                size="sm"
                variant="outline"
                className="text-xs h-8 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900 bg-white dark:bg-[#121212]"
              >
                Mark as Spam
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                size="sm"
                className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white"
              >
                <TrashIcon className="w-3.5 h-3.5 mr-1" />
                <span>Delete Selected</span>
              </Button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* Contacts Table */}
        <Card className="border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject &amp; Snippet</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--muted-foreground)]">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span>Loading inquiries...</span>
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--muted-foreground)] space-y-2">
                      <EnvelopeIcon className="w-8 h-8 mx-auto text-[var(--muted-foreground)]/50" />
                      <p className="font-semibold text-sm text-[var(--foreground)]">No contact inquiries found</p>
                      <p className="text-xs">Try adjusting your filters or search keywords.</p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => {
                    const statusConfig = CONTACT_STATUS[contact.status] || CONTACT_STATUS.PENDING;
                    const isSelected = selectedIds.includes(contact.id);
                    return (
                      <tr
                        key={contact.id}
                        className={`transition-colors group ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : 'hover:bg-[var(--muted)]/30'}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(contact.id)}
                            className="rounded border-[var(--border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* Sender */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                            <span>{contact.name}</span>
                            {contact.company && (
                              <span className="text-[10px] text-[var(--muted-foreground)] font-normal">
                                @{contact.company}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--muted-foreground)] truncate max-w-[170px]">{contact.email}</div>
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                            <TagIcon className="w-2.5 h-2.5" />
                            <span>{contact.category || 'General'}</span>
                          </span>
                        </td>

                        {/* Status (with inline quick change) */}
                        <td className="py-3 px-4">
                          <select
                            value={contact.status}
                            onChange={(e) => handleUpdateStatus(contact.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer bg-transparent ${statusConfig.badgeClass}`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESPONDED">Responded</option>
                            <option value="CLOSED">Closed</option>
                            <option value="SPAM">Spam</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowReplyModal(false);
                              }}
                              className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-indigo-600 transition-colors cursor-pointer"
                              title="View full inquiry"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenReplyModal(contact)}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[var(--muted-foreground)] hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Reply via Email Queue"
                            >
                              <PaperAirplaneIcon className="w-4 h-4 text-indigo-500" />
                            </button>

                            <button
                              onClick={() => handleDeleteContact(contact)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[var(--muted-foreground)] hover:text-rose-600 transition-colors cursor-pointer"
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
                <p className="text-xs text-[var(--muted-foreground)]">
                  From {selectedContact.name} ({selectedContact.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Metadata Pills */}
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)]">
                Category: <strong>{selectedContact.category || 'General'}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)]">
                Priority: <strong>{selectedContact.priority || 'MEDIUM'}</strong>
              </span>
              {selectedContact.phone && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)]">
                  Phone: <strong>{selectedContact.phone}</strong>
                </span>
              )}
              {selectedContact.company && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)]">
                  Company: <strong>{selectedContact.company}</strong>
                </span>
              )}
              {typeof selectedContact.spamScore === 'number' && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)]">
                  Spam Score: <strong>{selectedContact.spamScore}%</strong>
                </span>
              )}
            </div>

            {/* Message Body */}
            <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {selectedContact.message}
            </div>

            {/* Previous Response if any */}
            {selectedContact.response && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <span className="font-bold block">Sent Response:</span>
                <p className="italic whitespace-pre-wrap">{selectedContact.response}</p>
                {selectedContact.respondedAt && (
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                    Sent on {new Date(selectedContact.respondedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleUpdateStatus(selectedContact.id, e.target.value)}
                  className="text-xs rounded-xl border border-[var(--input)] bg-[var(--background)] px-2.5 py-1.5 text-[var(--foreground)] cursor-pointer"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESPONDED">Responded</option>
                  <option value="CLOSED">Closed</option>
                  <option value="SPAM">Spam</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleOpenReplyModal(selectedContact)}
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer"
                >
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </Button>
                <Button
                  onClick={() => setSelectedContact(null)}
                  variant="outline"
                  size="sm"
                  className="text-xs cursor-pointer"
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
                }}
                className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="replySubject" className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Subject Line
                </label>
                <input
                  id="replySubject"
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="replyText" className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Email Message Body
                </label>
                <textarea
                  id="replyText"
                  rows={6}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here. It will be dispatched through the resilient email queue..."
                  className="w-full rounded-xl border border-[var(--input)] bg-[var(--background)] p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              <span>Dispatched asynchronously via Email Queue.</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowReplyModal(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendReply}
                  disabled={replying || !replyText.trim()}
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold cursor-pointer"
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
