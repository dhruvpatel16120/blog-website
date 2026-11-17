"use client";

import { useState, useRef } from 'react';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import toast from 'react-hot-toast';
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const INQUIRY_CATEGORIES = [
  'General Inquiry',
  'Technical Support',
  'Collaboration & Partnership',
  'Content & Guest Posts',
  'Bug Report & Feedback',
  'Other'
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: '',
    website: '', // Honeypot field (hidden from real users)
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timeStartRef = useRef(Date.now());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (form.message.trim().length < 10) {
      toast.error('Message must be at least 10 characters long.');
      return;
    }

    try {
      setLoading(true);

      const timeSpent = Date.now() - timeStartRef.current;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          category: form.category,
          subject: form.subject.trim() || form.category,
          message: form.message.trim(),
          website: form.website, // honeypot
          timeSpent,
          agreeToTerms: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deliver message');
      }

      setSubmitted(true);
      toast.success('Your message has been sent successfully!');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: '',
      email: '',
      category: 'General Inquiry',
      subject: '',
      message: '',
      website: '',
    });
    timeStartRef.current = Date.now();
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Card className="border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
        <CardContent className="p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircleIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Message Sent Successfully!
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
            Thank you for reaching out. Your inquiry has been received and queued for our team. We typically respond within 24 to 48 hours.
          </p>
          <div className="pt-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="cursor-pointer text-xs font-semibold px-5"
            >
              Send Another Message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs">
      <CardHeader className="p-6 sm:p-8 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Direct Inquiry</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-[var(--foreground)]">
          Send Us a Message
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Have feedback, a technical query, or want to collaborate? Fill in the details below.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot field (hidden from accessibility tree & visual rendering) */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="hp_website">Website</label>
            <input
              id="hp_website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={handleChange}
            />
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Your Name <span className="text-rose-500">*</span></span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 flex items-center gap-1.5">
                <EnvelopeIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Email Address <span className="text-rose-500">*</span></span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="alex@company.com"
                className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm"
              />
            </div>
          </div>

          {/* Category & Subject Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Category</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
              >
                {INQUIRY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 flex items-center gap-1.5">
                <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Subject</span>
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Article feedback, partnership inquiry..."
                className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="message" className="block text-xs font-semibold text-[var(--foreground)]">
                Message <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-[var(--muted-foreground)]">
                {form.message.length} chars (min 10)
              </span>
            </div>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what you have in mind. Provide any context or questions..."
              className="bg-[var(--background)] border-[var(--input)] text-[var(--foreground)] text-sm resize-y"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between">
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer px-6 py-2.5 font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Delivering...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
