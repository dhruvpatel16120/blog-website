// Email templates for the blog platform

export const emailTemplates = {
  // Email verification template
  verificationEmail: (data) => ({
    subject: `Verify Your Email - ${data.platformName || 'Blog Platform'}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #0056b3; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verify Your Email</h1>
            <p>${data.platformName || 'Blog Platform'}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.fullName},</h2>
            
            <p>Thank you for signing up for <strong>${data.platformName || 'our blog platform'}</strong>! To complete your registration, please verify your email address.</p>
            
            <div style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <div class="warning">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This verification link will expire in 24 hours</li>
                <li>If you didn't create this account, please ignore this email</li>
                <li>For security reasons, never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${data.verificationUrl}</p>
            
            <p>Once verified, you'll be able to access all features of our platform.</p>
            
            <p>Best regards,<br><strong>The ${data.platformName || 'Blog'} Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Verify Your Email - ${data.platformName || 'Blog Platform'}

Hello ${data.fullName},

Thank you for signing up for ${data.platformName || 'our blog platform'}! To complete your registration, please verify your email address.

To verify your email, visit this link:
${data.verificationUrl}

Important:
- This verification link will expire in 24 hours
- If you didn't create this account, please ignore this email
- For security reasons, never share this link with anyone

If the link above doesn't work, you can copy and paste it into your browser.

Once verified, you'll be able to access all features of our platform.

Best regards,
The ${data.platformName || 'Blog'} Team

---
This is an automated message. Please do not reply to this email.
    `
  }),

  // Contact acknowledgement template (enhanced professional design)
  contactAcknowledgement: (data) => {
    const platform = data.platformName || 'Our Blog';
    const url = data.platformUrl || 'https://example.com';
    const logoUrl = process.env.BRAND_LOGO_URL || '';
    const brandPrimary = process.env.BRAND_PRIMARY_COLOR || '#2563eb';
    const brandPrimaryDark = process.env.BRAND_PRIMARY_DARK || '#1e40af';
    const brandSecondary = process.env.BRAND_SECONDARY_COLOR || '#10b981';
    const preheader = `Thanks ${data.name?.split(' ')[0] || ''}, we received your message and will reply soon.`;
    const safe = (s) => String(s || '').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${platform} – Message received</title>
    <style>
      body{margin:0;padding:0;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6}
      a{color:${brandPrimary};text-decoration:none}
      .container{width:100%;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);padding:32px 16px}
      .table{max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)}
      .header{padding:32px 24px;background:linear-gradient(135deg,${brandPrimary} 0%,${brandPrimaryDark} 100%);color:#fff;text-align:center}
      .brand{font-weight:800;font-size:24px;margin:0;letter-spacing:-0.025em}
      .brand-subtitle{font-size:14px;opacity:0.9;margin:8px 0 0 0;font-weight:400}
      .content{padding:32px 24px}
      .h1{font-size:24px;line-height:1.3;margin:0 0 16px 0;color:#111827;font-weight:700}
      .muted{color:#6b7280;font-size:15px}
      .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0}
      .box-header{font-weight:600;color:#374151;margin-bottom:12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em}
      .cta{display:inline-block;background:linear-gradient(135deg,${brandPrimary} 0%,${brandPrimaryDark} 100%);color:#fff;border-radius:12px;padding:16px 24px;font-weight:600;text-decoration:none;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);transition:all 0.2s}
      .cta:hover{transform:translateY(-1px);box-shadow:0 10px 15px -3px rgba(0,0,0,0.1)}
      .footer{padding:24px;color:#9ca3af;text-align:center;font-size:13px;background:#f9fafb;border-top:1px solid #e5e7eb}
      .preheader{display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all}
      .success-icon{font-size:48px;margin-bottom:16px}
      .message-preview{background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;font-family:monospace;font-size:13px;line-height:1.5;color:#374151}
      .stats{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
      .stat{text-align:center;padding:16px;background:#f3f4f6;border-radius:8px}
      .stat-value{font-size:20px;font-weight:700;color:${brandPrimary}}
      .stat-label{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em}
    </style>
  </head>
  <body>
    <span class="preheader">${safe(preheader)}</span>
    <div class="container">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="table">
        <tr>
          <td class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="${platform}" height="32" style="margin-bottom:8px"/>` : ''}
            <h1 class="brand">${platform}</h1>
            <p class="brand-subtitle">Professional Blog & Tech Community</p>
          </td>
        </tr>
        <tr>
          <td class="content">
            <div style="text-align:center;margin-bottom:24px">
              <div class="success-icon">✅</div>
              <h2 class="h1">Message Received Successfully!</h2>
              <p class="muted">Hi ${safe(data.name?.split(' ')[0] || 'there')}, thank you for reaching out to us. We've received your message and our team will get back to you as soon as possible.</p>
            </div>
            
            <div class="box">
              <div class="box-header">Your Message Details</div>
              <div style="margin-bottom:16px">
                <strong>Subject:</strong> ${safe(data.subject || 'General inquiry')}
              </div>
              <div>
                <strong>Message:</strong>
                <div class="message-preview">${safe(data.message)}</div>
              </div>
            </div>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">24-48h</div>
                <div class="stat-label">Response Time</div>
              </div>
              <div class="stat">
                <div class="stat-value">100%</div>
                <div class="stat-label">Response Rate</div>
              </div>
            </div>

            <div style="text-align:center;margin:32px 0">
              <p style="margin-bottom:20px;color:#374151">While you wait, explore our latest content:</p>
              <a class="cta" href="${url}">Visit ${platform}</a>
            </div>

            ${data.supportEmail ? `
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin:24px 0">
              <p style="margin:0;color:#0c4a6e;font-size:14px">
                <strong>Need immediate assistance?</strong> You can also reach us directly at 
                <a href="mailto:${data.supportEmail}" style="color:#0369a1;font-weight:600">${data.supportEmail}</a>
              </p>
            </div>
            ` : ''}
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p style="margin:0 0 8px">This is an automated confirmation from ${platform}</p>
            <p style="margin:0;font-size:12px">If you didn't submit this request, please ignore this email</p>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

    const text = `Message Received - ${platform}

Hi ${data.name?.split(' ')[0] || 'there'},

Thank you for reaching out to us! We've received your message and our team will get back to you within 24-48 hours.

Your Message Details:
Subject: ${data.subject || 'General inquiry'}
Message: ${data.message}

While you wait, visit us at: ${url}

${data.supportEmail ? `For immediate assistance, contact: ${data.supportEmail}` : ''}

---
This is an automated confirmation from ${platform}
If you didn't submit this request, please ignore this email`;

    return { subject: `✅ Message Received — ${platform}`, html, text };
  },

  // Contact reply template (enhanced professional design)
  contactReply: (data) => {
    const platform = data.platformName || 'Our Blog';
    const url = data.platformUrl || 'https://example.com';
    const logoUrl = process.env.BRAND_LOGO_URL || '';
    const brandPrimary = process.env.BRAND_PRIMARY_COLOR || '#2563eb';
    const brandPrimaryDark = process.env.BRAND_PRIMARY_DARK || '#1e40af';
    const brandSecondary = process.env.BRAND_SECONDARY_COLOR || '#10b981';
    const preheader = `A response from ${platform} regarding: ${data.subject || 'your inquiry'}`;
    const safe = (s) => String(s || '').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${platform} – Our Response</title>
    <style>
      body{margin:0;padding:0;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6}
      a{color:${brandPrimary};text-decoration:none}
      .container{width:100%;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);padding:32px 16px}
      .table{max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)}
      .header{padding:32px 24px;background:linear-gradient(135deg,${brandPrimary} 0%,${brandPrimaryDark} 100%);color:#fff;text-align:center}
      .brand{font-weight:800;font-size:24px;margin:0;letter-spacing:-0.025em}
      .brand-subtitle{font-size:14px;opacity:0.9;margin:8px 0 0 0;font-weight:400}
      .content{padding:32px 24px}
      .h1{font-size:24px;line-height:1.3;margin:0 0 16px 0;color:#111827;font-weight:700}
      .muted{color:#6b7280;font-size:15px}
      .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0}
      .box-header{font-weight:600;color:#374151;margin-bottom:12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em}
      .reply{background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:16px 0;font-family:inherit;line-height:1.6;color:#374151}
      .cta{display:inline-block;background:linear-gradient(135deg,${brandPrimary} 0%,${brandPrimaryDark} 100%);color:#fff;border-radius:12px;padding:16px 24px;font-weight:600;text-decoration:none;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);transition:all 0.2s}
      .cta:hover{transform:translateY(-1px);box-shadow:0 10px 15px -3px rgba(0,0,0,0.1)}
      .footer{padding:24px;color:#9ca3af;text-align:center;font-size:13px;background:#f9fafb;border-top:1px solid #e5e7eb}
      .preheader{display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all}
      .response-icon{font-size:48px;margin-bottom:16px}
      .original-message{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;font-family:monospace;font-size:13px;line-height:1.5;color:#475569}
    </style>
  </head>
  <body>
    <span class="preheader">${safe(preheader)}</span>
    <div class="container">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="table">
        <tr>
          <td class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="${platform}" height="32" style="margin-bottom:8px"/>` : ''}
            <h1 class="brand">${platform}</h1>
            <p class="brand-subtitle">Professional Blog & Tech Community</p>
          </td>
        </tr>
        <tr>
          <td class="content">
            <div style="text-align:center;margin-bottom:24px">
              <div class="response-icon">💬</div>
              <h2 class="h1">Response to Your Inquiry</h2>
              <p class="muted">Hi there! We've reviewed your message and here's our response.</p>
            </div>
            
            ${data.greeting ? `<p style="font-size:16px;color:#374151;margin-bottom:16px">${safe(data.greeting)}</p>` : ''}
            
            <div class="reply">
              <div style="white-space:pre-wrap">${safe(data.reply)}</div>
            </div>
            
            ${data.signature ? `<p style="margin:16px 0 0;color:#6b7280;font-style:italic">${safe(data.signature)}</p>` : ''}

            <div class="box">
              <div class="box-header">Your Original Message</div>
              <div style="margin-bottom:16px">
                <strong>Subject:</strong> ${safe(data.originalSubject || 'General inquiry')}
              </div>
              <div class="original-message">${safe(data.originalMessage || '')}</div>
            </div>

            <div style="text-align:center;margin:32px 0">
              <p style="margin-bottom:20px;color:#374151">Have more questions? Visit our platform:</p>
              <a class="cta" href="${url}">Visit ${platform}</a>
            </div>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p style="margin:0 0 8px">This response was sent by the ${platform} team</p>
            <p style="margin:0;font-size:12px">You can reply to this email for follow-up questions</p>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

    const text = `Response to Your Inquiry - ${platform}

Hi there! We've reviewed your message and here's our response.

${data.greeting ? `${data.greeting}\n\n` : ''}${data.reply}

${data.signature ? `\n${data.signature}\n` : ''}
---
Your Original Message:
Subject: ${data.originalSubject || 'General inquiry'}
Message: ${data.originalMessage || ''}

Have more questions? Visit us at: ${url}

---
This response was sent by the ${platform} team
You can reply to this email for follow-up questions`;

    return { subject: `Re: ${data.subject || 'your inquiry'} — ${platform}`, html, text };
  },

  // Admin notification template for new contacts
  adminContactNotification: (data) => {
    const platform = data.platformName || 'Our Blog';
    const url = data.platformUrl || 'https://example.com';
    const logoUrl = process.env.BRAND_LOGO_URL || '';
    const brandPrimary = process.env.BRAND_PRIMARY_COLOR || '#2563eb';
    const brandPrimaryDark = process.env.BRAND_PRIMARY_DARK || '#1e40af';
    const brandWarning = process.env.BRAND_WARNING_COLOR || '#f59e0b';
    const preheader = `New contact form submission from ${data.name} - ${data.subject || 'General inquiry'}`;
    const safe = (s) => String(s || '').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    const getPriorityColor = (priority) => {
      const colors = {
        'LOW': '#6b7280',
        'MEDIUM': '#3b82f6',
        'HIGH': '#f59e0b',
        'URGENT': '#ef4444'
      };
      return colors[priority] || colors.MEDIUM;
    };

    const getPriorityLabel = (priority) => {
      const labels = {
        'LOW': 'Low Priority',
        'MEDIUM': 'Medium Priority',
        'HIGH': 'High Priority',
        'URGENT': 'URGENT'
      };
      return labels[priority] || 'Medium Priority';
    };

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New Contact Form Submission - ${platform}</title>
    <style>
      body{margin:0;padding:0;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6}
      a{color:${brandPrimary};text-decoration:none}
      .container{width:100%;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);padding:32px 16px}
      .table{max-width:720px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)}
      .header{padding:32px 24px;background:linear-gradient(135deg,${brandPrimary} 0%,${brandPrimaryDark} 100%);color:#fff;text-align:center}
      .brand{font-weight:800;font-size:24px;margin:0;letter-spacing:-0.025em}
      .brand-subtitle{font-size:14px;opacity:0.9;margin:8px 0 0 0;font-weight:400}
      .content{padding:32px 24px}
      .h1{font-size:24px;line-height:1.3;margin:0 0 16px 0;color:#111827;font-weight:700}
      .muted{color:#6b7280;font-size:15px}
      .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0}
      .box-header{font-weight:600;color:#374151;margin-bottom:16px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em}
      .priority-badge{display:inline-block;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.05em}
      .spam-warning{background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:16px 0}
      .cta{display:inline-block;background:linear-gradient(135deg,${brandPrimary} 0%,${brandPrimaryDark} 100%);color:#fff;border-radius:12px;padding:16px 24px;font-weight:600;text-decoration:none;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);transition:all 0.2s}
      .cta:hover{transform:translateY(-1px);box-shadow:0 10px 15px -3px rgba(0,0,0,0.1)}
      .footer{padding:24px;color:#9ca3af;text-align:center;font-size:13px;background:#f9fafb;border-top:1px solid #e5e7eb}
      .preheader{display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all}
      .notification-icon{font-size:48px;margin-bottom:16px}
      .contact-details{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}
      .detail-item{background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center}
      .detail-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px}
      .detail-value{font-size:14px;color:#111827;font-weight:600}
      .message-content{background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;font-family:monospace;font-size:13px;line-height:1.5;color:#374151;white-space:pre-wrap}
    </style>
  </head>
  <body>
    <span class="preheader">${safe(preheader)}</span>
    <div class="container">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="table">
        <tr>
          <td class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="${platform}" height="32" style="margin-bottom:8px"/>` : ''}
            <h1 class="brand">${platform}</h1>
            <p class="brand-subtitle">Admin Notification</p>
          </td>
        </tr>
        <tr>
          <td class="content">
            <div style="text-align:center;margin-bottom:24px">
              <div class="notification-icon">📧</div>
              <h2 class="h1">New Contact Form Submission</h2>
              <p class="muted">A new contact form has been submitted and requires your attention.</p>
            </div>
            
            <div class="box">
              <div class="box-header">Contact Information</div>
              <div class="contact-details">
                <div class="detail-item">
                  <div class="detail-label">Name</div>
                  <div class="detail-value">${safe(data.name)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Email</div>
                  <div class="detail-value">${safe(data.email)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Category</div>
                  <div class="detail-value">${safe(data.category || 'General')}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Priority</div>
                  <div class="detail-value">
                    <span class="priority-badge" style="background:${getPriorityColor(data.priority)}">
                      ${getPriorityLabel(data.priority)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="box">
              <div class="box-header">Message Details</div>
              <div style="margin-bottom:16px">
                <strong>Subject:</strong> ${safe(data.subject || 'General inquiry')}
              </div>
              ${data.source ? `<div style="margin-bottom:16px"><strong>Source:</strong> ${safe(data.source)}</div>` : ''}
              <div class="message-content">${safe(data.message)}</div>
            </div>

            ${data.spamScore > 50 ? `
            <div class="spam-warning">
              <p style="margin:0;color:#92400e;font-size:14px">
                <strong>⚠️ Spam Warning:</strong> This message has a spam score of ${data.spamScore}%. Please review carefully before responding.
              </p>
            </div>
            ` : ''}

            <div style="text-align:center;margin:32px 0">
              <p style="margin-bottom:20px;color:#374151">Manage this contact in your admin panel:</p>
              <a class="cta" href="${url}/admin/contacts">View in Admin Panel</a>
            </div>

            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin:24px 0">
              <p style="margin:0;color:#0c4a6e;font-size:14px">
                <strong>Quick Actions:</strong> You can mark as spam, archive, or respond directly from the admin panel.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p style="margin:0 0 8px">This is an automated notification from ${platform}</p>
            <p style="margin:0;font-size:12px">Contact ID: ${data.contactId}</p>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

    const text = `New Contact Form Submission - ${platform}

A new contact form has been submitted and requires your attention.

Contact Information:
- Name: ${data.name}
- Email: ${data.email}
- Category: ${data.category || 'General'}
- Priority: ${getPriorityLabel(data.priority)}
- Source: ${data.source || 'Unknown'}

Message Details:
Subject: ${data.subject || 'General inquiry'}
Message: ${data.message}

${data.spamScore > 50 ? `⚠️ Spam Warning: This message has a spam score of ${data.spamScore}%. Please review carefully.\n` : ''}
Manage this contact in your admin panel: ${url}/admin/contacts

---
This is an automated notification from ${platform}
Contact ID: ${data.contactId}`;

    return { subject: `📧 New Contact: ${data.subject || 'General inquiry'} - ${platform}`, html, text };
  },

  // Contact reminder template
  contactReminder: (data) => {
    const platform = data.platformName || 'Our Blog';
    const url = data.platformUrl || 'https://example.com';
    const logoUrl = process.env.BRAND_LOGO_URL || '';
    const brandPrimary = process.env.BRAND_PRIMARY_COLOR || '#2563eb';
    const brandPrimaryDark = process.env.BRAND_PRIMARY_DARK || '#1e40af';
    const preheader = `Friendly reminder about your inquiry to ${platform}`;
    const safe = (s) => String(s || '').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${platform} – Reminder</title>
    <style>
      body{margin:0;padding:0;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6}
      a{color:${brandPrimary};text-decoration:none}
      .container{width:100%;background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);padding:32px 16px}
      .table{max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)}
      .header{padding:32px 24px;background:linear-gradient(135deg,${brandPrimary} 0%,${brandPrimaryDark} 100%);color:#fff;text-align:center}
      .brand{font-weight:800;font-size:24px;margin:0;letter-spacing:-0.025em}
      .brand-subtitle{font-size:14px;opacity:0.9;margin:8px 0 0 0;font-weight:400}
      .content{padding:32px 24px}
      .h1{font-size:24px;line-height:1.3;margin:0 0 16px 0;color:#111827;font-weight:700}
      .muted{color:#6b7280;font-size:15px}
      .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0}
      .box-header{font-weight:600;color:#374151;margin-bottom:12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em}
      .cta{display:inline-block;background:linear-gradient(135deg,${brandPrimary} 0%,${brandPrimaryDark} 100%);color:#fff;border-radius:12px;padding:16px 24px;font-weight:600;text-decoration:none;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);transition:all 0.2s}
      .cta:hover{transform:translateY(-1px);box-shadow:0 10px 15px -3px rgba(0,0,0,0.1)}
      .footer{padding:24px;color:#9ca3af;text-align:center;font-size:13px;background:#f9fafb;border-top:1px solid #e5e7eb}
      .preheader{display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all}
      .reminder-icon{font-size:48px;margin-bottom:16px}
      .message-preview{background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;font-family:monospace;font-size:13px;line-height:1.5;color:#374151}
    </style>
  </head>
  <body>
    <span class="preheader">${safe(preheader)}</span>
    <div class="container">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="table">
        <tr>
          <td class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="${platform}" height="32" style="margin-bottom:8px"/>` : ''}
            <h1 class="brand">${platform}</h1>
            <p class="brand-subtitle">Professional Blog & Tech Community</p>
          </td>
        </tr>
        <tr>
          <td class="content">
            <div style="text-align:center;margin-bottom:24px">
              <div class="reminder-icon">⏰</div>
              <h2 class="h1">Friendly Reminder</h2>
              <p class="muted">Hi ${safe(data.name?.split(' ')[0] || 'there')}, we haven't forgotten about your inquiry!</p>
            </div>
            
            <div class="box">
              <div class="box-header">Your Inquiry Details</div>
              <div style="margin-bottom:16px">
                <strong>Subject:</strong> ${safe(data.subject || 'General inquiry')}
              </div>
              <div>
                <strong>Submitted:</strong> ${data.daysSinceSubmission} day${data.daysSinceSubmission !== 1 ? 's' : ''} ago
              </div>
              <div class="message-preview">${safe(data.message)}</div>
            </div>

            <p style="margin:24px 0;color:#374151;font-size:16px">
              We're still working on your request and will get back to you as soon as possible. 
              Thank you for your patience!
            </p>

            <div style="text-align:center;margin:32px 0">
              <p style="margin-bottom:20px;color:#374151">While you wait, explore our latest content:</p>
              <a class="cta" href="${url}">Visit ${platform}</a>
            </div>

            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin:24px 0">
              <p style="margin:0;color:#0c4a6e;font-size:14px">
                <strong>Need immediate assistance?</strong> You can also reach us directly at our support email.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p style="margin:0 0 8px">This is a friendly reminder from ${platform}</p>
            <p style="margin:0;font-size:12px">If you no longer need assistance, please let us know</p>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

    const text = `Friendly Reminder - ${platform}

Hi ${data.name?.split(' ')[0] || 'there'},

We haven't forgotten about your inquiry! We're still working on your request and will get back to you as soon as possible.

Your Inquiry Details:
Subject: ${data.subject || 'General inquiry'}
Submitted: ${data.daysSinceSubmission} day${data.daysSinceSubmission !== 1 ? 's' : ''} ago
Message: ${data.message}

Thank you for your patience! While you wait, visit us at: ${url}

---
This is a friendly reminder from ${platform}
If you no longer need assistance, please let us know`;

    return { subject: `⏰ Reminder: ${data.subject || 'your inquiry'} — ${platform}`, html, text };
  },
  // User invitation template
  userInvitation: (data) => ({
    subject: `Welcome to ${data.platformName || 'Our Blog Platform'} - Set Your Password`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${data.platformName || 'Our Blog Platform'}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #0056b3; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
          .role-badge { display: inline-block; background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${data.platformName || 'Our Blog Platform'}!</h1>
            <p>You've been invited to join our community</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.fullName},</h2>
            
            <p>Great news! You've been invited to join <strong>${data.platformName || 'our blog platform'}</strong> as a <span class="role-badge">${data.role}</span>.</p>
            
            <div class="info-box">
              <h3>Your Account Details:</h3>
              <p><strong>Username:</strong> ${data.username}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Role:</strong> ${data.role}</p>
            </div>
            
            ${data.customMessage ? `<div class="info-box"><h3>Personal Message:</h3><p><em>"${data.customMessage}"</em></p></div>` : ''}
            
            <p>To get started, please set your password by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Set Your Password</a>
            </div>
            
            <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
            
            <div class="info-box">
              <h3>What you can do as a ${data.role}:</h3>
              ${data.role === 'USER' ? '<p>• Read and comment on blog posts<br>• Like and interact with content<br>• Update your profile</p>' : ''}
              ${data.role === 'MODERATOR' ? '<p>• All user permissions<br>• Moderate comments and content<br>• Manage user accounts</p>' : ''}
              ${data.role === 'ADMIN' ? '<p>• All moderator permissions<br>• Full administrative access<br>• Manage the entire platform</p>' : ''}
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>We're excited to have you on board!</p>
            
            <p>Best regards,<br><strong>The ${data.platformName || 'Blog'} Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>If you didn't request this invitation, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to ${data.platformName || 'Our Blog Platform'}!

Hello ${data.fullName},

Great news! You've been invited to join ${data.platformName || 'our blog platform'} as a ${data.role}.

Your Account Details:
- Username: ${data.username}
- Email: ${data.email}
- Role: ${data.role}

${data.customMessage ? `Personal Message: "${data.customMessage}"\n` : ''}To get started, please set your password by visiting this link:
${data.resetUrl}

Important: This link will expire in 24 hours for security reasons.

What you can do as a ${data.role}:
${data.role === 'USER' ? '- Read and comment on blog posts\n- Like and interact with content\n- Update your profile' : ''}
${data.role === 'MODERATOR' ? '- All user permissions\n- Moderate comments and content\n- Manage user accounts' : ''}
${data.role === 'ADMIN' ? '- All moderator permissions\n- Full administrative access\n- Manage the entire platform' : ''}

If you have any questions or need assistance, please contact our support team.

We're excited to have you on board!

Best regards,
The ${data.platformName || 'Blog'} Team

---
This is an automated message. Please do not reply to this email.
If you didn't request this invitation, please ignore this email.
    `
  }),

  // Password reset template
  passwordReset: (data) => ({
    subject: `Reset Your Password - ${data.platformName || 'Blog Platform'}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #c82333; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
            <p>${data.platformName || 'Blog Platform'}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.fullName},</h2>
            
            <p>We received a request to reset your password for your account on <strong>${data.platformName || 'our blog platform'}</strong>.</p>
            
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <ul>
                <li>This link will expire in 24 hours</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${data.resetUrl}</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br><strong>The ${data.platformName || 'Blog'} Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Reset Your Password - ${data.platformName || 'Blog Platform'}

Hello ${data.fullName},

We received a request to reset your password for your account on ${data.platformName || 'our blog platform'}.

To reset your password, visit this link:
${data.resetUrl}

Security Notice:
- This link will expire in 24 hours
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If the link above doesn't work, you can copy and paste it into your browser.

If you have any questions, please contact our support team.

Best regards,
The ${data.platformName || 'Blog'} Team

---
This is an automated message. Please do not reply to this email.
    `
  }),

  // Welcome email template
  welcomeEmail: (data) => ({
    subject: `Welcome to ${data.platformName || 'Our Blog Platform'}!`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #218838; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Welcome Aboard!</h1>
            <p>Your account is now active</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.fullName},</h2>
            
            <p>Welcome to <strong>${data.platformName || 'our blog platform'}</strong>! Your account has been successfully created and is now active.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Log in to your account</li>
              <li>Read and comment on blog posts</li>
              <li>Update your profile</li>
              <li>Explore our community</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Get Started</a>
            </div>
            
            <p>If you have any questions or need help getting started, please don't hesitate to reach out to our support team.</p>
            
            <p>We're excited to have you as part of our community!</p>
            
            <p>Best regards,<br><strong>The ${data.platformName || 'Blog'} Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to ${data.platformName || 'Our Blog Platform'}!

Hello ${data.fullName},

Welcome to ${data.platformName || 'our blog platform'}! Your account has been successfully created and is now active.

You can now:
- Log in to your account
- Read and comment on blog posts
- Update your profile
- Explore our community

Get started by visiting: ${data.loginUrl}

If you have any questions or need help getting started, please don't hesitate to reach out to our support team.

We're excited to have you as part of our community!

Best regards,
The ${data.platformName || 'Blog'} Team

---
This is an automated message. Please do not reply to this email.
    `
  })
};

// Helper function to get platform name from environment
export const getPlatformName = () => {
  return process.env.PLATFORM_NAME || 'Our Blog Platform';
};

// Helper function to get platform URL from environment
export const getPlatformUrl = () => {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};
