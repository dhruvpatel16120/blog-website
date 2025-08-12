import React from 'react'
import { Badge } from '@/components/ui'

export default function TermsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Legal</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            The terms and conditions governing your use of our website and services
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
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                By accessing and using TechBlog, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Use License</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on TechBlog 
                  for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
                  and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on TechBlog</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
                </ul>
                <p>
                  This license shall automatically terminate if you violate any of these restrictions and may be terminated 
                  by TechBlog at any time.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. User Content</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  By posting content to TechBlog, you grant us the right to use, modify, publicly perform, publicly display, 
                  reproduce, and distribute such content on and through TechBlog. You retain any and all of your rights to 
                  any content you submit, post, or display on or through TechBlog and you are responsible for protecting those rights.
                </p>
                <p>
                  You represent and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The content is yours or you have the right to use it and grant us the rights and license as provided in these Terms</li>
                  <li>The posting of your content on or through TechBlog does not violate the privacy rights, publicity rights, 
                      copyrights, contract rights, or any other rights of any person</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4. Prohibited Uses</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You may use TechBlog only for lawful purposes and in accordance with these Terms. You agree not to use TechBlog:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material, including any &quot;junk mail,&quot; 
                    &quot;chain letter,&quot; &quot;spam,&quot; or any other similar solicitation</li>
                <li>To impersonate or attempt to impersonate TechBlog, a TechBlog employee, another user, or any other person or entity</li>
                <li>To engage in any other conduct that restricts or inhibits anyone&apos;s use or enjoyment of TechBlog</li>
                <li>To introduce any viruses, trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">5. Intellectual Property Rights</h2>
              <p className="text-gray-600 dark:text-gray-400">
                The Service and its original content, features, and functionality are and will remain the exclusive property 
                of TechBlog and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks 
                and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">6. Disclaimer</h2>
              <p className="text-gray-600 dark:text-gray-400">
                The materials on TechBlog are provided on an &apos;as is&apos; basis. TechBlog makes no warranties, expressed or implied, 
                and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions 
                of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">7. Limitations</h2>
              <p className="text-gray-600 dark:text-gray-400">
                In no event shall TechBlog or its suppliers be liable for any damages (including, without limitation, damages for 
                loss of data or profit, or due to business interruption) arising out of the use or inability to use TechBlog, 
                even if TechBlog or a TechBlog authorized representative has been notified orally or in writing of the possibility 
                of such damage.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">8. Accuracy of Materials</h2>
              <p className="text-gray-600 dark:text-gray-400">
                The materials appearing on TechBlog could include technical, typographical, or photographic errors. TechBlog does 
                not warrant that any of the materials on its website are accurate, complete, or current. TechBlog may make changes 
                to the materials contained on its website at any time without notice.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">9. Links</h2>
              <p className="text-gray-600 dark:text-gray-400">
                TechBlog has not reviewed all of the sites linked to its website and is not responsible for the contents of any 
                such linked site. The inclusion of any link does not imply endorsement by TechBlog of the site. Use of any such 
                linked website is at the user&apos;s own risk.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">10. Modifications</h2>
              <p className="text-gray-600 dark:text-gray-400">
                TechBlog may revise these terms of service for its website at any time without notice. By using this website, 
                you are agreeing to be bound by the then current version of these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">11. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400">
                These terms and conditions are governed by and construed in accordance with the laws of the United States and 
                you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">12. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong> legal@techblog.com<br />
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
