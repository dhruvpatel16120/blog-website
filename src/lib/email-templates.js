// Email templates for the TechBlog platform
// Designed to match the TechBlog branding: vibrant blue-to-purple gradient, modern typography, and rock-solid email client compatibility.

// Helper function to get platform name from environment
export const getPlatformName = () => {
  return process.env.PLATFORM_NAME || 'TechBlog';
};

// Helper function to get platform URL from environment
export const getPlatformUrl = () => {
  const url = process.env.NEXTAUTH_URL || process.env.PLATFORM_URL || 'http://localhost:3000';
  return url.replace(/\/+$/, '');
};

// HTML escape helper
const escapeHtml = (str) => {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Base email layout wrapper that renders responsive, client-compatible emails matching TechBlog theme.
 */
export function renderBaseEmail({
  platformName = getPlatformName(),
  platformUrl = getPlatformUrl(),
  preheader = '',
  heroBadge = '',
  heroBadgeColor = '#2563eb',
  heroBadgeBg = '#eff6ff',
  heroBadgeBorder = '#bfdbfe',
  title = '',
  subtitle = '',
  contentHtml = '',
  ctaText = '',
  ctaUrl = '',
  footerNote = '',
  supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@techblog.com',
}) {
  const safePreheader = escapeHtml(preheader);
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${safeTitle ? `${safeTitle} — ` : ''}${escapeHtml(platformName)}</title>
  <style>
    /* Reset & Base Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    
    /* Interactive */
    .cta-button:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 50%, #6d28d9 100%) !important;
    }

    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .email-content { padding: 24px 20px !important; }
      .stat-cell { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
      .stat-spacer { display: none !important; }
      .h1-title { font-size: 22px !important; line-height: 28px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text (shows in inbox snippet, hidden in email view) -->
  ${safePreheader ? `
  <div style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${safePreheader}
    ${'&#847;&zwnj;&nbsp;'.repeat(40)}
  </div>` : ''}

  <!-- Outer Canvas Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f1f5f9; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        
        <!-- Main Card Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);">
          
          <!-- Top Gradient Accent Bar (matches blog header line) -->
          <tr>
            <td style="height: 4px; background-color: #2563eb; background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding: 32px 32px 24px 32px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <!-- TB Gradient Logo Mark -->
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="width: 44px; height: 44px; background-color: #2563eb; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%); border-radius: 12px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 44px; display: block;">TB</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Brand Name & Tagline -->
                  <td style="vertical-align: middle; text-align: left;">
                    <a href="${platformUrl}" target="_blank" style="text-decoration: none; display: block;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em; line-height: 1.15; display: block;">${escapeHtml(platformName)}</span>
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-top: 3px;">Tech News &amp; Tutorials</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Content Area -->
          <tr>
            <td class="email-content" style="padding: 36px 36px 28px 36px; background-color: #ffffff;">
              
              <!-- Hero Section: Badge, Title & Subtitle -->
              ${heroBadge || title ? `
              <div style="text-align: center; margin-bottom: 28px;">
                ${heroBadge ? `
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px auto;">
                  <tr>
                    <td align="center" style="background-color: ${heroBadgeBg}; border: 1px solid ${heroBadgeBorder}; border-radius: 9999px; padding: 6px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: ${heroBadgeColor}; letter-spacing: 0.03em;">
                      ${heroBadge}
                    </td>
                  </tr>
                </table>
                ` : ''}

                ${title ? `
                <h1 class="h1-title" style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; line-height: 1.3;">
                  ${safeTitle}
                </h1>
                ` : ''}

                ${subtitle ? `
                <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #64748b; line-height: 1.6;">
                  ${safeSubtitle}
                </p>
                ` : ''}
              </div>
              ` : ''}

              <!-- Body Injection -->
              ${contentHtml}

              <!-- Call To Action Button (if provided) -->
              ${ctaText && ctaUrl ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 32px auto 16px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #2563eb; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%); box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                    <a href="${ctaUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.02em;">
                      ${escapeHtml(ctaText)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="padding: 28px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #334155;">
                ${escapeHtml(platformName)} &bull; Modern Tech Platform
              </p>
              <p style="margin: 0 0 14px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b;">
                <a href="${platformUrl}" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 600; margin: 0 8px;">Home</a> &bull;
                <a href="${platformUrl}/blog" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 600; margin: 0 8px;">Articles</a> &bull;
                <a href="${platformUrl}/categories" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 600; margin: 0 8px;">Categories</a> &bull;
                <a href="${platformUrl}/contact" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 600; margin: 0 8px;">Contact</a>
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                ${footerNote ? escapeHtml(footerNote) : `This email was sent by ${escapeHtml(platformName)}. For assistance, reply directly or reach us at <a href="mailto:${supportEmail}" style="color: #6366f1; text-decoration: none;">${escapeHtml(supportEmail)}</a>.`}
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const emailTemplates = {
  // 1. Contact Acknowledgement Template (User confirmation on form submission)
  contactAcknowledgement: (data) => {
    const platform = data.platformName || getPlatformName();
    const url = data.platformUrl || getPlatformUrl();
    const supportEmail = data.supportEmail || process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@techblog.com';
    const firstName = data.name?.split(' ')[0] || 'there';
    const cleanSubject = data.subject || 'General Inquiry';

    const contentHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; margin: 0 0 24px 0;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Message Subject
        </div>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
          ${escapeHtml(cleanSubject)}
        </div>

        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Your Submitted Message
        </div>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 8px; padding: 14px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
${escapeHtml(data.message)}
        </div>
      </div>

      <!-- Email-safe 2-Column Metrics Table -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 24px 0;">
        <tr>
          <td width="48%" class="stat-cell" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; vertical-align: middle;">
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; color: #2563eb;">&lt; 24 Hours</div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Target Response Time</div>
          </td>
          <td width="4%" class="stat-spacer"></td>
          <td width="48%" class="stat-cell" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; vertical-align: middle;">
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; color: #10b981;">Queued &amp; Logged</div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Ticket Status</div>
          </td>
        </tr>
      </table>

      <!-- Helpful Reassurance Card -->
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; margin: 0 0 8px 0;">
        <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #1e40af; line-height: 1.5;">
          <strong>Have additional details to add?</strong> Simply reply directly to this email or reach us at <a href="mailto:${escapeHtml(supportEmail)}" style="color: #2563eb; font-weight: 600; text-decoration: underline;">${escapeHtml(supportEmail)}</a>.
        </p>
      </div>
    `;

    const html = renderBaseEmail({
      platformName: platform,
      platformUrl: url,
      preheader: `Thanks ${firstName}, we received your message and our team will get back to you shortly.`,
      heroBadge: '✓ MESSAGE RECEIVED',
      heroBadgeColor: '#059669',
      heroBadgeBg: '#ecfdf5',
      heroBadgeBorder: '#a7f3d0',
      title: 'Message Received Successfully!',
      subtitle: `Hi ${firstName}, thanks for reaching out. We have safely logged your inquiry in our queue.`,
      contentHtml,
      ctaText: 'Explore TechBlog Articles',
      ctaUrl: `${url}/blog`,
      supportEmail,
    });

    const text = `Message Received — ${platform}

Hi ${firstName},

Thank you for reaching out to us! We have received your inquiry and our team is already reviewing it.

Your Message Details:
Subject: ${cleanSubject}
Message:
${data.message}

Turnaround: Under 24 hours.
While you wait, explore our latest tutorials and articles: ${url}/blog

If you need immediate assistance or have more details to add, reply directly to this email.

Best regards,
The ${platform} Team
---
${url}`;

    return { subject: `✅ Message Received — ${platform}`, html, text };
  },

  // 2. Contact Reply Template (Response from admin to user)
  contactReply: (data) => {
    const platform = data.platformName || getPlatformName();
    const url = data.platformUrl || getPlatformUrl();
    const cleanSubject = data.subject || 'your inquiry';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@techblog.com';

    const contentHtml = `
      <!-- Admin Reply Box -->
      <div style="background-color: #ffffff; border: 1px solid #c7d2fe; border-left: 4px solid #4f46e5; border-radius: 12px; padding: 22px; margin: 0 0 24px 0; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.05);">
        ${data.greeting ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">
          ${escapeHtml(data.greeting)}
        </div>
        ` : ''}

        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14.5px; line-height: 1.65; color: #334155; white-space: pre-wrap;">
${escapeHtml(data.reply)}
        </div>

        ${data.signature ? `
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #e0e7ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; color: #4338ca;">
          ${escapeHtml(data.signature)}
        </div>
        ` : ''}
      </div>

      <!-- Original Message Reference -->
      ${data.originalMessage ? `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 0 0 20px 0;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
          Original Inquiry: ${escapeHtml(data.originalSubject || cleanSubject)}
        </div>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.55; color: #64748b; white-space: pre-wrap;">
${escapeHtml(data.originalMessage)}
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #64748b; margin-top: 20px;">
        Have additional questions? Simply reply directly to this email to continue the thread.
      </div>
    `;

    const html = renderBaseEmail({
      platformName: platform,
      platformUrl: url,
      preheader: `Response from ${platform} team regarding: ${cleanSubject}`,
      heroBadge: '💬 TEAM RESPONSE',
      heroBadgeColor: '#4f46e5',
      heroBadgeBg: '#eef2ff',
      heroBadgeBorder: '#c7d2fe',
      title: 'Response to Your Inquiry',
      subtitle: `Our team has reviewed your message regarding "${cleanSubject}".`,
      contentHtml,
      ctaText: 'Visit TechBlog',
      ctaUrl: url,
      supportEmail,
    });

    const text = `Response to Your Inquiry — ${platform}

Regarding: ${cleanSubject}

${data.greeting ? `${data.greeting}\n\n` : ''}${data.reply}
${data.signature ? `\n— ${data.signature}\n` : ''}

---
Your Original Message:
${data.originalSubject ? `Subject: ${data.originalSubject}\n` : ''}${data.originalMessage || ''}

You can reply directly to this email if you have any follow-up questions.
Visit us at: ${url}`;

    return { subject: `Re: ${cleanSubject} — ${platform}`, html, text };
  },

  // 3. Admin Notification Template (New inquiry alert for admins)
  adminContactNotification: (data) => {
    const platform = data.platformName || getPlatformName();
    const url = data.platformUrl || getPlatformUrl();
    const safeSubject = data.subject || 'General Inquiry';

    // Priority color mapping matching blog badge styles
    const priority = (data.priority || 'MEDIUM').toUpperCase();
    const priorityConfig = {
      URGENT: { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', label: 'URGENT' },
      HIGH: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'HIGH' },
      MEDIUM: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'MEDIUM' },
      LOW: { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', label: 'LOW' },
    }[priority] || { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: priority };

    const contentHtml = `
      <!-- Contact Info Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 12px; vertical-align: top;">
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">Sender Name</span>
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #0f172a;">${escapeHtml(data.name)}</span>
            </td>
            <td style="padding-bottom: 12px; vertical-align: top;">
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">Email Address</span>
              <a href="mailto:${escapeHtml(data.email)}" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #2563eb; text-decoration: none;">${escapeHtml(data.email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 6px; vertical-align: top;">
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Category</span>
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; color: #334155;">${escapeHtml(data.category || 'General Inquiry')}</span>
            </td>
            <td style="padding-top: 6px; vertical-align: top;">
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Priority</span>
              <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; background-color: ${priorityConfig.bg}; color: ${priorityConfig.color}; border: 1px solid ${priorityConfig.border};">
                ${priorityConfig.label}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Message Content Box -->
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 12px; padding: 18px 20px; margin: 0 0 20px 0;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Subject: ${escapeHtml(safeSubject)}
        </div>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
${escapeHtml(data.message)}
        </div>
      </div>

      ${data.spamScore && data.spamScore > 30 ? `
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #92400e;">
        <strong>⚠️ Automated Spam Score:</strong> ${data.spamScore}% (Automated heuristic screening)
      </div>
      ` : ''}
    `;

    const html = renderBaseEmail({
      platformName: platform,
      platformUrl: url,
      preheader: `[New Contact] ${safeSubject} from ${data.name}`,
      heroBadge: '📬 ADMIN ALERT',
      heroBadgeColor: '#4338ca',
      heroBadgeBg: '#eef2ff',
      heroBadgeBorder: '#c7d2fe',
      title: 'New Contact Form Submission',
      subtitle: `Received a new message from ${escapeHtml(data.name)} awaiting review.`,
      contentHtml,
      ctaText: 'Open in Admin Dashboard',
      ctaUrl: `${url}/admin/contacts`,
    });

    const text = `New Contact Form Submission — ${platform}

From: ${data.name} (${data.email})
Category: ${data.category || 'General Inquiry'}
Priority: ${priority}
Subject: ${safeSubject}

Message:
${data.message}

Manage in dashboard: ${url}/admin/contacts`;

    return { subject: `📬 [Contact] ${safeSubject} — ${data.name}`, html, text };
  },

  // 4. Contact Reminder Template
  contactReminder: (data) => {
    const platform = data.platformName || getPlatformName();
    const url = data.platformUrl || getPlatformUrl();
    const firstName = data.name?.split(' ')[0] || 'there';

    const contentHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 20px 0;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
          Original Inquiry: ${escapeHtml(data.subject || 'General Inquiry')}
        </div>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
${escapeHtml(data.message)}
        </div>
      </div>

      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1e40af; line-height: 1.55;">
        Our team is actively researching your inquiry. Thank you for your patience while we gather the best information for you!
      </div>
    `;

    const html = renderBaseEmail({
      platformName: platform,
      platformUrl: url,
      preheader: `Update regarding your message to ${platform}`,
      heroBadge: '⏰ STILL ON IT',
      heroBadgeColor: '#d97706',
      heroBadgeBg: '#fffbeb',
      heroBadgeBorder: '#fde68a',
      title: "We Haven't Forgotten You!",
      subtitle: `Hi ${firstName}, we are still working on your inquiry submitted ${data.daysSinceSubmission || 1} day(s) ago.`,
      contentHtml,
      ctaText: 'Visit TechBlog',
      ctaUrl: url,
    });

    const text = `Update on Your Inquiry — ${platform}

Hi ${firstName},

We haven't forgotten about your inquiry! Our team is still reviewing your message regarding:
"${data.subject || 'General Inquiry'}"

Thank you for your patience while we gather the information for you.

Best regards,
The ${platform} Team
${url}`;

    return { subject: `⏰ Update on Your Inquiry: ${data.subject || 'General Inquiry'} — ${platform}`, html, text };
  },

  // 5. Email Verification Template
  verificationEmail: (data) => {
    const platform = data.platformName || getPlatformName();
    const url = data.platformUrl || getPlatformUrl();
    const fullName = data.fullName || 'there';

    const contentHtml = `
      <p style="margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #334155; line-height: 1.6;">
        Welcome to <strong>${escapeHtml(platform)}</strong>! To finalize your registration and protect your account security, please verify your email address.
      </p>

      <!-- Security Callout Box -->
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 10px; padding: 16px 18px; margin: 24px 0;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 6px;">
          Security Notice:
        </div>
        <ul style="margin: 0; padding-left: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; color: #78350f; line-height: 1.6;">
          <li>This link is valid for <strong>24 hours</strong></li>
          <li>If you didn't create an account, you can safely ignore this email</li>
          <li>Never share this verification link with anyone</li>
        </ul>
      </div>

      <!-- Fallback plain URL -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; line-height: 1.5;">
        Button not working? Copy and paste this link into your browser:
        <div style="margin-top: 6px; word-break: break-all; color: #2563eb; font-weight: 600;">
          ${escapeHtml(data.verificationUrl)}
        </div>
      </div>
    `;

    const html = renderBaseEmail({
      platformName: platform,
      platformUrl: url,
      preheader: `Verify your email to complete your ${platform} account setup.`,
      heroBadge: '✉️ EMAIL VERIFICATION',
      heroBadgeColor: '#2563eb',
      heroBadgeBg: '#eff6ff',
      heroBadgeBorder: '#bfdbfe',
      title: 'Verify Your Email Address',
      subtitle: `Hello ${escapeHtml(fullName)}, let's activate your TechBlog account.`,
      contentHtml,
      ctaText: 'Verify Email Address',
      ctaUrl: data.verificationUrl,
    });

    const text = `Verify Your Email Address — ${platform}

Hello ${fullName},

Thank you for signing up for ${platform}! To complete your registration, please verify your email address by visiting:
${data.verificationUrl}

Security Notice:
- This link will expire in 24 hours.
- If you didn't create this account, you can ignore this email.

Best regards,
The ${platform} Team
${url}`;

    return { subject: `Verify Your Email — ${platform}`, html, text };
  },

  // 6. Password Reset Template
  passwordReset: (data) => {
    const platform = data.platformName || getPlatformName();
    const url = data.platformUrl || getPlatformUrl();
    const fullName = data.fullName || 'there';

    const contentHtml = `
      <p style="margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #334155; line-height: 1.6;">
        We received a request to reset the password for your <strong>${escapeHtml(platform)}</strong> account. Click the button below to choose a new password.
      </p>

      <!-- Security Callout Box -->
      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 10px; padding: 16px 18px; margin: 24px 0;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #9f1239; margin-bottom: 6px;">
          Security Alert:
        </div>
        <ul style="margin: 0; padding-left: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; color: #881337; line-height: 1.6;">
          <li>This reset link will expire in <strong>24 hours</strong></li>
          <li>If you didn't request a password reset, no action is needed — your account remains secure</li>
          <li>Our staff will never ask for your password or reset link</li>
        </ul>
      </div>

      <!-- Fallback plain URL -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; line-height: 1.5;">
        If the button above does not work, copy and paste this link into your browser:
        <div style="margin-top: 6px; word-break: break-all; color: #2563eb; font-weight: 600;">
          ${escapeHtml(data.resetUrl)}
        </div>
      </div>
    `;

    const html = renderBaseEmail({
      platformName: platform,
      platformUrl: url,
      preheader: `Reset your ${platform} password safely.`,
      heroBadge: '🔐 SECURITY REQUEST',
      heroBadgeColor: '#e11d48',
      heroBadgeBg: '#fff1f2',
      heroBadgeBorder: '#fecdd3',
      title: 'Reset Your Password',
      subtitle: `Hello ${escapeHtml(fullName)}, let's get you safely back into your account.`,
      contentHtml,
      ctaText: 'Reset My Password',
      ctaUrl: data.resetUrl,
    });

    const text = `Reset Your Password — ${platform}

Hello ${fullName},

We received a request to reset your password for ${platform}.
To reset your password, visit this link:
${data.resetUrl}

Notice:
- This link expires in 24 hours.
- If you didn't request this, you can safely ignore this email.

Best regards,
The ${platform} Team
${url}`;

    return { subject: `Reset Your Password — ${platform}`, html, text };
  },

  // 7. User Invitation Template
  userInvitation: (data) => {
    const platform = data.platformName || getPlatformName();
    const url = data.platformUrl || getPlatformUrl();
    const fullName = data.fullName || 'there';
    const role = data.role || 'USER';

    const contentHtml = `
      <p style="margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #334155; line-height: 1.6;">
        You've been invited to join <strong>${escapeHtml(platform)}</strong> as an official team member with role:
        <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; background-color: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; margin-left: 4px;">${escapeHtml(role)}</span>
      </p>

      <!-- Account Details Box -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
          Assigned Account Credentials:
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #64748b;" width="35%">Username:</td>
            <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; font-weight: 700; color: #0f172a;">${escapeHtml(data.username)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #64748b;">Email:</td>
            <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; font-weight: 700; color: #0f172a;">${escapeHtml(data.email)}</td>
          </tr>
        </table>
      </div>

      ${data.customMessage ? `
      <div style="background-color: #ffffff; border: 1px solid #e0e7ff; border-left: 4px solid #6366f1; border-radius: 10px; padding: 16px 18px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #3730a3; font-style: italic;">
        &ldquo;${escapeHtml(data.customMessage)}&rdquo;
      </div>
      ` : ''}

      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #64748b; line-height: 1.5; margin: 16px 0;">
        Click below to set your password and access your new account:
      </div>
    `;

    const html = renderBaseEmail({
      platformName: platform,
      platformUrl: url,
      preheader: `You've been invited to join ${platform}!`,
      heroBadge: '🎉 INVITATION',
      heroBadgeColor: '#7c3aed',
      heroBadgeBg: '#f5f3ff',
      heroBadgeBorder: '#ddd6fe',
      title: 'Welcome to the Team!',
      subtitle: `Hello ${escapeHtml(fullName)}, your invitation to join ${platform} is ready.`,
      contentHtml,
      ctaText: 'Set Password & Get Started',
      ctaUrl: data.resetUrl,
    });

    const text = `Welcome to ${platform} — You're Invited!

Hello ${fullName},

You have been invited to join ${platform} as a ${role}.
Username: ${data.username}
Email: ${data.email}

${data.customMessage ? `Personal Note: "${data.customMessage}"\n` : ''}
To set your password and activate your account, visit:
${data.resetUrl}

This link is valid for 24 hours.

Best regards,
The ${platform} Team
${url}`;

    return { subject: `Welcome to ${platform} — Set Your Password`, html, text };
  },

  // 8. Welcome Email Template
  welcomeEmail: (data) => {
    const platform = data.platformName || getPlatformName();
    const url = data.platformUrl || getPlatformUrl();
    const fullName = data.fullName || 'there';

    const contentHtml = `
      <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #334155; line-height: 1.6;">
        Your account on <strong>${escapeHtml(platform)}</strong> has been activated. Here is what you can explore right now:
      </p>

      <!-- Highlights List -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 24px 0;">
        <tr>
          <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="32" style="font-size: 20px; vertical-align: top;">📚</td>
                <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #1e293b; line-height: 1.5;">
                  <strong>In-depth Tech Guides:</strong> Full-stack tutorials, system architecture, and modern best practices.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="32" style="font-size: 20px; vertical-align: top;">💬</td>
                <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #1e293b; line-height: 1.5;">
                  <strong>Engage in Community:</strong> Leave comments, start discussions, and exchange ideas with developers.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const html = renderBaseEmail({
      platformName: platform,
      platformUrl: url,
      preheader: `Welcome to ${platform}! Your account is active.`,
      heroBadge: '🚀 WELCOME ABOARD',
      heroBadgeColor: '#059669',
      heroBadgeBg: '#ecfdf5',
      heroBadgeBorder: '#a7f3d0',
      title: 'Your Account is Active!',
      subtitle: `Hi ${escapeHtml(fullName)}, we are thrilled to have you in our tech community.`,
      contentHtml,
      ctaText: 'Start Reading Articles',
      ctaUrl: data.loginUrl || `${url}/blog`,
    });

    const text = `Welcome to ${platform}!

Hello ${fullName},

Your account has been created and is active.
Explore our articles and discussions at: ${url}/blog

Best regards,
The ${platform} Team
${url}`;

    return { subject: `Welcome to ${platform}! 🚀`, html, text };
  },
};
