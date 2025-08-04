"use client"

import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Button, Input, Textarea, Badge } from '@/components/ui'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

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

// Mock contact methods
const contactMethods = [
  {
    icon: EnvelopeIcon,
    title: 'Email Us',
    description: 'Send us an email and we\'ll get back to you within 24 hours.',
    contact: 'hello@techblog.com',
    action: 'mailto:hello@techblog.com'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Live Chat',
    description: 'Chat with our team in real-time during business hours.',
    contact: 'Available 9AM-6PM EST',
    action: '#'
  },
  {
    icon: PhoneIcon,
    title: 'Call Us',
    description: 'Speak directly with our team for urgent matters.',
    contact: '+1 (555) 123-4567',
    action: 'tel:+15551234567'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the form data to your backend
    alert('Thank you for your message! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Layout showSidebar={false}>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16" style={{
        background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Get In Touch</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Let's Build Something
            <span className="text-primary block">Amazing Together</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Have a question, suggestion, or want to collaborate? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              How Can We Help?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              Choose the best way to reach us based on your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
                onClick={() => method.action !== '#' && window.open(method.action)}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  {method.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  {method.description}
                </p>
                <div className="text-primary font-medium">
                  {method.contact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
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
          Whether you have a question, want to collaborate, or just want to say hello, we're here to help.
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
    </Layout>
  )
} 