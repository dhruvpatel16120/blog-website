"use client"

import React from 'react'
import { Button, Badge } from '@/components/ui'
import { 
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  StarIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import ContactForm from '@/components/forms/ContactForm'
import { useTheme } from '@/lib/theme'

// Mock FAQ data
const faqs = [
  {
    question: "How can I contribute to the blog?",
    answer: "We welcome guest contributions! Please email us at contribute@techblog.com with your article idea and we'll get back to you within 48 hours."
  },
  {
    question: "Do you offer technical consulting services?",
    answer: "Yes, we provide technical consulting for web development projects. Contact us with your requirements and we'll schedule a consultation."
  },
  {
    question: "How often do you publish new content?",
    answer: "We publish new articles 2-3 times per week, covering the latest in web development, tutorials, and industry insights."
  },
  {
    question: "Can I request a specific topic to be covered?",
    answer: "Absolutely! We love hearing from our community. Send us your topic suggestions and we'll consider them for future articles."
  },
  {
    question: "How can I stay updated?",
    answer: "Follow us on Twitter, GitHub, and join our Discord community for the latest articles, tutorials, and news."
  },
  {
    question: "How can I report a bug or issue?",
    answer: "If you find any issues with our website or content, please email us at support@techblog.com and we'll address it promptly."
  }
]

const stats = [
  { label: 'Response Time', value: '24-48h', icon: ClockIcon, color: 'text-blue-600' },
  { label: 'Success Rate', value: '99.9%', icon: CheckCircleIcon, color: 'text-green-600' },
  { label: 'Customer Satisfaction', value: '4.9/5', icon: StarIcon, color: 'text-yellow-600' },
  { label: 'Support Team', value: '24/7', icon: ShieldCheckIcon, color: 'text-purple-600' }
]

export default function ContactPage() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden text-center py-20 lg:py-32"
        style={{ background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)' }}
      >
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-600 blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-6">
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Get In Touch
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Let&apos;s Build Something <span className="text-primary">Amazing Together</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Have a question, suggestion, or want to collaborate? We&apos;d love to hear from you. 
            Our team is here to help and respond within 24-48 hours.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-full shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Contact Form - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Contact Information & Quick Actions */}
            <div className="space-y-8">
              {/* Quick Contact */}
              <div
                className="rounded-3xl p-8 shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
                  <EnvelopeIcon className="w-6 h-6 text-primary" />
                  Quick Contact
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                      <EnvelopeIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                        Email Us
                      </h4>
                      <p className="mb-2" style={{ color: 'var(--muted-foreground)' }}>
                        Get in touch via email
                      </p>
                      <a href="mailto:hello@techblog.com" className="text-primary hover:underline font-small mr-2">
                        hello@techblog.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                      <PhoneIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                        Call Us
                      </h4>
                      <p className="mb-2" style={{ color: 'var(--muted-foreground)' }}>
                        Speak with our team
                      </p>
                      <a href="tel:+1-555-123-4567" className="text-primary hover:underline font-medium">
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Office Information */}
              <div
                className="rounded-2xl p-8 shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
                  <MapPinIcon className="w-6 h-6 text-primary" />
                  Office Location
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                        123 Tech Street
                      </p>
                      <p style={{ color: 'var(--muted-foreground)' }}>
                        San Francisco, CA 94105
                      </p>
                      <p style={{ color: 'var(--muted-foreground)' }}>
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        Business Hours
                      </p>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Monday - Friday: 9:00 AM - 6:00 PM EST
                      </p>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Saturday: 10:00 AM - 4:00 PM EST
                      </p>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Links */}
              <div
                className="rounded-2xl p-8 shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
                  <DocumentTextIcon className="w-6 h-6 text-primary" />
                  Quick Links
                </h3>
                
                <div className="space-y-3">
                  <a href="/privacy" className="block transition-colors hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                    Privacy Policy
                  </a>
                  <a href="/terms" className="block transition-colors hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                    Terms of Service
                  </a>
                  <a href="/cookies" className="block transition-colors hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                    Cookie Policy
                  </a>
                  <a href="/guidelines" className="block transition-colors hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                    Community Guidelines
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              Find quick answers to common questions about our services and community
            </p>
          </div>
          
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-lg font-semibold mb-3 flex items-start gap-3" style={{ color: 'var(--foreground)' }}>
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  )
} 