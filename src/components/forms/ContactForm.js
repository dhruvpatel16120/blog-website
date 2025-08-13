"use client";

import { useState, useRef, useEffect } from 'react';
import { Button, Input, Badge } from '@/components/ui';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon, 
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const CATEGORIES = [
  'General Inquiry',
  'Technical Support',
  'Business Partnership',
  'Content Submission',
  'Bug Report',
  'Feature Request',
  'Advertising',
  'Other'
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-600', activeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-800/30 dark:text-emerald-200 dark:border-emerald-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600', activeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-200 dark:border-blue-500' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-600', activeColor: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-800/30 dark:text-orange-200 dark:border-orange-500' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600', activeColor: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-200 dark:border-red-500' }
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    category: 'General Inquiry',
    priority: 'MEDIUM',
    source: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isHuman, setIsHuman] = useState(false);
  const [spamScore, setSpamScore] = useState(0);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const hiddenFieldRef = useRef(null);
  const timeStartRef = useRef(Date.now());

  // Spam detection
  useEffect(() => {
    const timeSpent = Date.now() - timeStartRef.current;
    if (timeSpent < 5000) { // Less than 5 seconds
      setSpamScore(prev => prev + 30);
    }
    
    // Check for hidden field manipulation
    if (hiddenFieldRef.current && hiddenFieldRef.current.value) {
      setSpamScore(prev => prev + 50);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Spam detection based on typing patterns
    if (name === 'message' && value.length > 0) {
      const suspiciousPatterns = [
        /\b(viagra|casino|loan|credit|money|free|click here|buy now)\b/i,
        /[A-Z]{5,}/, // Too many caps
        /!{3,}/, // Too many exclamation marks
        /\b(www\.|http:\/\/|https:\/\/)\b/ // URLs
      ];
      
      let score = 0;
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(value)) score += 10;
      });
      
      setSpamScore(prev => Math.min(prev + score, 100));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    const email = formData.email.trim();
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    else if (formData.subject.trim().length < 5) newErrors.subject = 'Subject must be at least 5 characters';
    
    const msg = formData.message.trim();
    if (!msg) newErrors.message = 'Message is required';
    else if (msg.length < 10) newErrors.message = 'Please provide at least 10 characters';
    else if (msg.length > 2000) newErrors.message = 'Message is too long (max 2000 characters)';
    
    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Spam detection
    if (spamScore > 70) {
      newErrors.spam = 'Your message appears to be spam. Please review and try again.';
    }
    
    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to our terms and privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError || 'Please fix the highlighted fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          spamScore,
          timeSpent: Date.now() - timeStartRef.current,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Message sent successfully! Check your email for confirmation.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: '',
          category: 'General Inquiry',
          priority: 'MEDIUM',
          source: '',
          agreeToTerms: false,
          subscribeNewsletter: false
        });
        setErrors({});
        setSpamScore(0);
        setShowAdvancedFields(false);
        
        // Track successful submission
        if (typeof gtag !== 'undefined') {
          gtag('event', 'contact_form_submitted', {
            event_category: 'engagement',
            event_label: formData.category
          });
        }
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    return PRIORITIES.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityActiveColor = (priority) => {
    return PRIORITIES.find(p => p.value === priority)?.activeColor || 'bg-gray-200 text-gray-800 border-gray-300';
  };

  return (
    <div
      className="rounded-2xl shadow-sm border overflow-hidden"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Form Header */}
      <div
        className="px-8 py-6"
        style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Get in Touch</h2>
        </div>
        <p style={{ color: 'var(--muted-foreground)' }}>
          We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </div>

      {/* Hidden spam protection field */}
      <input
        ref={hiddenFieldRef}
        type="text"
        name="website"
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Personal Information</h3>
          </div>
          
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Full Name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
                placeholder="Enter your full name"
                className={`w-full transition-all duration-200 ${
                  errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.name && <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {errors.name}
              </p>}
        </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Email Address *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
                className={`w-full transition-all duration-200 ${
                  errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.email && <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {errors.email}
              </p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="company" className="block text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Company
              </label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company name (optional)"
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={`w-full transition-all duration-200 ${
                  errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.phone && <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {errors.phone}
              </p>}
            </div>
          </div>
        </div>

        {/* Message Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Message Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Subject *
        </label>
        <Input
          id="subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          required
          placeholder="What's this about?"
                className={`w-full transition-all duration-200 ${
                  errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
        />
              {errors.subject && <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {errors.subject}
              </p>}
      </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'var(--card)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)'
                }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium" style={{ color: 'var(--muted-foreground) ' }}>
              Priority Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRIORITIES.map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                  style={{ color: 'var(--foreground)' }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.priority === priority.value 
                      ? getPriorityActiveColor(priority.value) + ' scale-105 shadow-md' 
                      : getPriorityColor(priority.value) + ' hover:scale-105 hover:shadow-md'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="source" className="block text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              How did you find us?
            </label>
            <Input
              id="source"
              name="source"
              type="text"
              value={formData.source}
              onChange={handleChange}
              placeholder="Google, Social Media, Referral, etc."
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Message Section */}
        <div className="space-y-3">
          <label htmlFor="message" className="block text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
            Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
            placeholder="Tell us more about your inquiry..."
            className={`w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200 ${
              errors.message 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-blue-500'
            }`}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {formData.message.length}/2000 characters
            </span>
            {errors.message && <p className="text-sm text-red-600 flex items-center gap-1">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {errors.message}
            </p>}
          </div>
        </div>

        {/* Spam Warning */}
        {spamScore > 50 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Spam Score: {spamScore}%
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Please ensure your message is legitimate and avoid excessive capitalization or suspicious content.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Newsletter */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 underline font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline font-medium">Privacy Policy</a>
              *
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-sm text-red-600 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {errors.agreeToTerms}
          </p>}
          
          <div className="flex items-start gap-3">
            <input
              id="subscribeNewsletter"
              name="subscribeNewsletter"
              type="checkbox"
              checked={formData.subscribeNewsletter}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="subscribeNewsletter" className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Subscribe to our newsletter for updates and insights
            </label>
          </div>
      </div>

        {/* Submit Button */}
        <div className="pt-4">
      <Button
        type="submit"
        variant="primary"
            className="w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={loading || spamScore > 70}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Sending Message...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-5 h-5" />
                Send Message
              </div>
            )}
      </Button>

          {spamScore > 70 && (
            <p className="text-sm text-red-600 text-center mt-3 flex items-center justify-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              Your message has been flagged as potential spam. Please review and try again.
            </p>
          )}
        </div>

        {/* Success Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">24-48h Response</p>
            <p className="text-xs text-gray-500">We&apos;ll get back to you quickly</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Secure & Private</p>
            <p className="text-xs text-gray-500">Your data is protected</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Always Available</p>
            <p className="text-xs text-gray-500">Submit anytime, anywhere</p>
          </div>
        </div>
    </form>
    </div>
  );
}
