"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card } from '@/components/ui';
import { ArrowLeftIcon, PaperAirplaneIcon, ClockIcon, UserIcon, EnvelopeIcon, BuildingOfficeIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function ContactReplyPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const [replyData, setReplyData] = useState({
    subject: '',
    greeting: 'Dear',
    reply: '',
    signature: 'Best regards,\nYour Support Team'
  });

  useEffect(() => {
    if (session?.user?.type !== 'admin') {
      router.push('/admin/login');
      return;
    }

    const run = async () => {
      try {
        const response = await fetch(`/api/admin/contacts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch contact');
        }
        const data = await response.json();
        setContact(data);
        
        if (data.subject) {
          setReplyData(prev => ({
            ...prev,
            subject: `Re: ${data.subject}`
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [session?.user?.type, params.id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/contacts/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'RESPONDED',
          response: replyData.reply,
          responseSubject: replyData.subject,
          responseGreeting: replyData.greeting,
          responseSignature: replyData.signature,
          respondedBy: session?.user?.fullName || session?.user?.username || 'Admin',
          respondedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      // Send email to user
      const emailResponse = await fetch('/api/admin/contacts/send-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: params.id,
          replyData
        }),
      });

      if (!emailResponse.ok) {
        console.warn('Failed to send email, but reply was saved');
      }

      router.push('/admin/contacts?success=Reply sent successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Reply to Contact" adminSession={session}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!contact) {
    return (
      <AdminLayout title="Contact Not Found" adminSession={session}>
        <div className="text-center py-8">
          <p className="text-gray-500">Contact not found</p>
          <Button onClick={() => router.push('/admin/contacts')} className="mt-4">
            Back to Contacts
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Reply to Contact" adminSession={session}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/admin/contacts')}
              variant="outline"
              size="sm"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reply to Contact
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Details */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{contact.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    {contact.email}
                  </p>
                </div>

                {contact.company && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      {contact.company}
                    </p>
                  </div>
                )}

                {contact.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      {contact.phone}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    {contact.category || 'General Inquiry'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    contact.priority === 'HIGH' || contact.priority === 'URGENT' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : contact.priority === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {contact.priority}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Submitted
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    {new Date(contact.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Original Message */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Original Message
              </h3>
              
              <div className="space-y-3">
                {contact.subject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{contact.subject}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {contact.message}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Reply Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PaperAirplaneIcon className="h-5 w-5" />
                Compose Reply
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    value={replyData.subject}
                    onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject line"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Greeting *
                  </label>
                  <Input
                    type="text"
                    value={replyData.greeting}
                    onChange={(e) => setReplyData(prev => ({ ...prev, greeting: e.target.value }))}
                    placeholder="e.g., Dear, Hello, Hi"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reply Message *
                  </label>
                  <textarea
                    value={replyData.reply}
                    onChange={(e) => setReplyData(prev => ({ ...prev, reply: e.target.value }))}
                    placeholder="Write your professional reply here..."
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {replyData.reply.length}/2000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signature *
                  </label>
                  <textarea
                    value={replyData.signature}
                    onChange={(e) => setReplyData(prev => ({ ...prev, signature: e.target.value }))}
                    placeholder="Your professional signature"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={sending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    )}
                    {sending ? 'Sending...' : 'Send Reply'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => router.push('/admin/contacts')}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
