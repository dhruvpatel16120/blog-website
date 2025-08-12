"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const CONTACT_STATUS = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: ClockIcon },
  RESPONDED: { label: 'Responded', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircleIcon },
  SPAM: { label: 'Spam', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: ExclamationTriangleIcon },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: ArchiveBoxIcon }
};

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, responded: 0, spam: 0, archived: 0, respondedToday: 0 });
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [adminSession, loading, router]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoadingContacts(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/contacts?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
        setPagination(prev => ({ ...prev, total: data.total }));
        if (data.summary) setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  }, [filters, pagination.limit, pagination.page]);

  useEffect(() => {
    if (adminSession) {
      fetchContacts();
    }
  }, [adminSession, fetchContacts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const onSort = (key) => {
    setFilters(prev => ({ ...prev, sortBy: key, order: prev.order === 'asc' && prev.sortBy === key ? 'desc' : 'asc' }));
  };

  const updateContactStatus = async (contactId, status) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setContacts(prev => 
          prev.map(contact => 
            contact.id === contactId ? { ...contact, status } : contact
          )
        );
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const sendResponse = async () => {
    if (!selectedContact || !responseText.trim()) return;

    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          response: responseText,
          adminId: adminSession.id
        }),
      });

      if (response.ok) {
        setContacts(prev => 
          prev.map(contact => 
            contact.id === selectedContact.id 
              ? { 
                  ...contact, 
                  status: 'RESPONDED',
                  response: responseText,
                  respondedAt: new Date().toISOString(),
                  respondedBy: adminSession.fullName || adminSession.username
                } 
              : contact
          )
        );
        setShowResponseModal(false);
        setResponseText('');
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  // Delete confirm modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmError, setConfirmError] = useState('');
  const doDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmError('');
    try {
      const res = await fetch(`/api/admin/contacts/${confirmDeleteId}`, { method: 'DELETE' });
      const payload = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to delete');
      setContacts(prev => prev.filter(c => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (e) {
      setConfirmError(e.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusConfig = (status) => {
    return CONTACT_STATUS[status] || CONTACT_STATUS.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session?.user?.type !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Contact Management" adminSession={adminSession}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: summary.total, color: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Pending', value: summary.pending, color: 'bg-yellow-100 dark:bg-yellow-900/20' },
          { label: 'Responded', value: summary.responded, color: 'bg-green-100 dark:bg-green-900/20' },
          { label: 'Spam', value: summary.spam, color: 'bg-red-100 dark:bg-red-900/20' },
          { label: 'Responded Today', value: summary.respondedToday, color: 'bg-blue-100 dark:bg-blue-900/20' },
        ].map((card, idx) => (
          <div key={idx} className={`p-4 rounded-lg border ${card.color} border-gray-200 dark:border-gray-700`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="RESPONDED">Responded</option>
                <option value="SPAM">Spam</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="createdAt">Created</option>
                  <option value="respondedAt">Responded</option>
                  <option value="status">Status</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                </select>
                <select
                  value={filters.order || 'desc'}
                  onChange={(e) => handleFilterChange('order', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Contacts List */}
      <Card>
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Messages ({pagination.total} total)
            </h3>
              <Button
              onClick={fetchContacts}
              variant="outline"
              disabled={loadingContacts}
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {loadingContacts ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-4">
              {contacts.map((contact) => {
                const statusConfig = getStatusConfig(contact.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={contact.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(contact.createdAt)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {contact.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {contact.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Subject
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {contact.subject || 'No subject'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Message
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {contact.message}
                            </p>
                          </div>
                        </div>

                        {contact.response && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Response:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {contact.response}
                            </p>
                            {contact.respondedBy && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Responded by {contact.respondedBy} on {formatDate(contact.respondedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => router.push(`/admin/contacts/${contact.id}/reply`)}
                          variant="outline"
                          size="sm"
                          disabled={contact.status === 'RESPONDED'}
                        >
                          <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Button
                          onClick={() => setConfirmDeleteId(contact.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <select
                        value={contact.status}
                        onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="PENDING">Mark as Pending</option>
                        <option value="RESPONDED">Mark as Responded</option>
                        <option value="SPAM">Mark as Spam</option>
                        <option value="ARCHIVED">Archive</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No contact messages found matching your criteria
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Response Modal */}
      {showResponseModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reply to {selectedContact.name}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <strong>From:</strong> {selectedContact.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <strong>Subject:</strong> {selectedContact.subject || 'No subject'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                <strong>Message:</strong> {selectedContact.message}
              </p>
            </div>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type your response..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseText('');
                  setSelectedContact(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={sendResponse}
                disabled={!responseText.trim()}
              >
                Send Response
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Contact</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Only contacts marked as SPAM or ARCHIVED can be deleted. This action cannot be undone.</p>
            {confirmError && <p className="text-sm text-red-600 mt-2">{confirmError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={()=>{ setConfirmDeleteId(null); setConfirmError(''); }}>Cancel</Button>
              <Button onClick={doDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
