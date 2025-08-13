import React from 'react'
import { Badge } from '@/components/ui'

export default function PrivacyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Legal</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            How we collect, use, and protect your personal information
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Introduction</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                At TechBlog, we respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you visit our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Information We Collect</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Personal Information</h3>
                  <p>We may collect personal information that you voluntarily provide to us, including:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Name and email address you voluntarily provide (e.g., contact forms)</li>
                    <li>Contact information when you submit a contact form</li>
                    <li>Account information if you create an account</li>
                    <li>Comments and feedback you provide on our articles</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Automatically Collected Information</h3>
                  <p>We automatically collect certain information when you visit our website:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>IP address and browser type</li>
                    <li>Pages visited and time spent on each page</li>
                    <li>Referring website and search terms</li>
                    <li>Device information and operating system</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use the information we collect for various purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>To provide and maintain our website and services</li>
                <li>To send you updates and communications you request</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To analyze website usage and improve our content</li>
                <li>To detect and prevent fraud or abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cookies and Tracking</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Essential Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    These cookies are necessary for the website to function properly and cannot be disabled.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Analytics Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We use analytics cookies to understand how visitors interact with our website and improve our content.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Preference Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    These cookies remember your preferences and settings to provide a personalized experience.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Third-Party Services</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may use third-party services that collect, monitor, and analyze data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Google Analytics for website analytics</li>
                <li>Newsletter services for email marketing</li>
                <li>Social media platforms for sharing content</li>
                <li>Comment systems for user engagement</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Data Security</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, 
                and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for data processing</li>
                <li>Object to data processing</li>
                <li>Request data portability</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Children&apos;s Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our website is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you are a parent or guardian and believe your child has provided 
                us with personal information, please contact us.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the 
                new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy 
                periodically.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-400">
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong> privacy@techblog.com<br />
                  <strong>Address:</strong> 123 Tech Street, San Francisco, CA 94105<br />
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
