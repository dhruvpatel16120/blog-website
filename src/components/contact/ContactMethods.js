"use client";
import { 
  EnvelopeIcon, 
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

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

export default function ContactMethods() {
  return (
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
  );
} 