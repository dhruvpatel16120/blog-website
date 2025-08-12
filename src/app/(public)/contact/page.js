import React from 'react'
import { Button, Badge } from '@/components/ui'
import { 
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import ContactForm from '@/components/forms/ContactForm'
import ContactMethods from '@/components/contact/ContactMethods'

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
    question: "Do you have a newsletter?",
    answer: "Yes! Subscribe to our newsletter to get the latest articles, tutorials, and tech news delivered to your inbox weekly."
  },
  {
    question: "How can I report a bug or issue?",
    answer: "If you find any issues with our website or content, please email us at support@techblog.com and we'll address it promptly."
  }
]

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16" style={{
        background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Get In Touch</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Let&#39;s Build Something
            <span className="text-primary block">Amazing Together</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Have a question, suggestion, or want to collaborate? We&#39;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <ContactMethods />

      {/* Contact Form & Info */}
      <section className="mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                Send Us a Message
              </h2>
              <ContactForm />
            </div>
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                Get in Touch
              </h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      Office Location
                    </h3>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                      123 Tech Street<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      Business Hours
                    </h3>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday: 10:00 AM - 4:00 PM EST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DocumentTextIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      Quick Links
                    </h3>
                    <div className="space-y-2">
                      <a href="#" className="block text-primary hover:underline">Privacy Policy</a>
                      <a href="#" className="block text-primary hover:underline">Terms of Service</a>
                      <a href="#" className="block text-primary hover:underline">Cookie Policy</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              Find quick answers to common questions about our services and community
            </p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card p-6"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                  {faq.question}
                </h3>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center rounded-2xl p-8 lg:p-12" style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)'
      }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Ready to Get Started?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
           Whether you have a question, want to collaborate, or just want to say hello, we&#39;re here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            Start a Project
          </Button>
          <Button variant="outline" size="lg">
            Join Our Newsletter
          </Button>
        </div>
      </section>
    </>
  )
} 