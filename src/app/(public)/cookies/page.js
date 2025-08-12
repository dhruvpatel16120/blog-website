import React from 'react'
import { Badge } from '@/components/ui'

export default function CookiesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Legal</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
            Cookie Policy
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            How we use cookies and similar technologies on our website
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
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">What Are Cookies?</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">How We Use Cookies</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use cookies for several purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>To provide you with a better user experience</li>
                <li>To understand how you use our website</li>
                <li>To remember your preferences and settings</li>
                <li>To provide personalized content and advertisements</li>
                <li>To ensure the security of our website</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Types of Cookies We Use</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Essential Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    These cookies are necessary for the website to function properly. They enable basic functions like page 
                    navigation and access to secure areas of the website. The website cannot function properly without these cookies.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                    <li>Authentication cookies to keep you logged in</li>
                    <li>Security cookies to protect against fraud</li>
                    <li>Session cookies to maintain your session</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Analytics Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    These cookies help us understand how visitors interact with our website by collecting and reporting 
                    information anonymously.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                    <li>Google Analytics cookies to track page views and user behavior</li>
                    <li>Performance monitoring cookies</li>
                    <li>Error tracking cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Preference Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    These cookies allow the website to remember choices you make and provide enhanced, more personal features.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                    <li>Language preference cookies</li>
                    <li>Theme preference cookies (light/dark mode)</li>
                    <li>Font size preference cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Marketing Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    These cookies are used to track visitors across websites. The intention is to display ads that are 
                    relevant and engaging for individual users.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                    <li>Social media cookies for sharing content</li>
                    <li>Advertising cookies for targeted ads</li>
                    <li>Newsletter subscription cookies</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Third-Party Cookies</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may also use third-party cookies from trusted partners:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Google Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We use Google Analytics to understand how visitors interact with our website. Google Analytics uses 
                    cookies to collect information about your use of our website, including your IP address.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Social Media</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We may include social media buttons that allow you to share content on platforms like Twitter, 
                    LinkedIn, and GitHub. These platforms may set cookies when you interact with their buttons.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Managing Cookies</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  You can control and manage cookies in several ways:
                </p>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Browser Settings</h3>
                  <p className="mb-2">
                    Most web browsers allow you to control cookies through their settings preferences. However, 
                    if you limit the ability of websites to set cookies, you may worsen your overall user experience.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
                    <li>Firefox: Options → Privacy &amp; Security → Cookies and Site Data</li>
                    <li>Safari: Preferences → Privacy → Manage Website Data</li>
                    <li>Edge: Settings → Cookies and site permissions → Cookies and site data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Cookie Consent</h3>
                  <p>
                    When you first visit our website, you&apos;ll see a cookie consent banner that allows you to accept 
                    or decline non-essential cookies. You can change your preferences at any time.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cookie Duration</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Session Cookies</h3>
                  <p>
                    These cookies are temporary and are deleted when you close your browser. They are used to maintain 
                    your session while you browse our website.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Persistent Cookies</h3>
                  <p>
                    These cookies remain on your device for a set period or until you delete them. They are used to 
                    remember your preferences and settings for future visits.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Updates to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
                operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
                new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-400">
                If you have any questions about our use of cookies, please contact us at:
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
