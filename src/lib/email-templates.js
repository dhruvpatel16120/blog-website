// Email templates for the blog platform

export const emailTemplates = {
  // Contact acknowledgement template (refined design)
  contactAcknowledgement: (data) => {
    const platform = data.platformName || 'Our Blog';
    const url = data.platformUrl || 'https://example.com';
    const logoUrl = process.env.BRAND_LOGO_URL || '';
    const brandPrimary = process.env.BRAND_PRIMARY_COLOR || '#2563eb';
    const brandPrimaryDark = process.env.BRAND_PRIMARY_DARK || '#1e40af';
    const preheader = `Thanks ${data.name?.split(' ')[0] || ''}, we received your message and will reply soon.`;
    const safe = (s) => String(s || '').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${platform} – Message received</title>
    <style>
      body{margin:0;padding:0;background:#f3f4f6;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;}
      a{color:${brandPrimary};text-decoration:none}
      .container{width:100%;background:#f3f4f6;padding:24px 12px}
      .table{max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}
      .header{padding:20px 24px;background:${brandPrimary};color:#fff}
      .brand{font-weight:700;font-size:18px;margin:0}
      .content{padding:24px}
      .h1{font-size:20px;line-height:1.4;margin:0 0 8px 0}
      .muted{color:#6b7280}
      .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px}
      .cta{display:inline-block;background:${brandPrimary};color:#fff;border-radius:8px;padding:12px 16px;font-weight:600}
      .cta:hover{background:${brandPrimaryDark}}
      .footer{padding:16px 24px;color:#9ca3af;text-align:center;font-size:12px}
      .preheader{display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all}
    </style>
  </head>
  <body>
    <span class="preheader">${safe(preheader)}</span>
    <div class="container">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="table">
        <tr>
          <td class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="${platform}" height="28"/>` : `<h1 class="brand">${platform}</h1>`}
          </td>
        </tr>
        <tr>
          <td class="content">
            <h2 class="h1">Thanks for reaching out${data.name ? `, ${safe(data.name.split(' ')[0])}` : ''}! 🎉</h2>
            <p class="muted">We've received your message and our team will respond as soon as possible. A copy of your submission is included below for your records.</p>
            <div class="box" style="margin:16px 0 20px;">
              <p style="margin:0 0 8px"><strong>Subject:</strong> ${safe(data.subject || 'General inquiry')}</p>
              <p style="margin:0 0 4px"><strong>Message:</strong></p>
              <p class="muted" style="white-space:pre-wrap;margin:0">${safe(data.message)}</p>
            </div>
            <p style="margin:0 0 20px">You can browse our latest posts and updates here:</p>
            <p><a class="cta" href="${url}">Visit ${platform}</a></p>
            ${data.supportEmail ? `<p class="muted" style="margin:16px 0 0">Need to update your request? Reply to this email or write to <a href="mailto:${data.supportEmail}">${data.supportEmail}</a>.</p>` : ''}
          </td>
        </tr>
        <tr>
          <td class="footer">This is an automated acknowledgement from ${platform}. If you didn't submit this request, you can safely ignore this email.</td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

    const text = `Thanks for contacting ${platform}!\n\nSubject: ${data.subject || 'General inquiry'}\n\n${data.message}\n\n${url}`;
    return { subject: `We received your message — ${platform}`, html, text };
  },

  // Contact reply template (admin response to user)
  contactReply: (data) => {
    const platform = data.platformName || 'Our Blog';
    const url = data.platformUrl || 'https://example.com';
    const logoUrl = process.env.BRAND_LOGO_URL || '';
    const brandPrimary = process.env.BRAND_PRIMARY_COLOR || '#2563eb';
    const brandPrimaryDark = process.env.BRAND_PRIMARY_DARK || '#1e40af';
    const preheader = `A response from ${platform} regarding: ${data.subject || 'your inquiry'}`;
    const safe = (s) => String(s || '').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${platform} – Our reply</title>
    <style>
      body{margin:0;padding:0;background:#f3f4f6;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;}
      a{color:${brandPrimary};text-decoration:none}
      .container{width:100%;background:#f3f4f6;padding:24px 12px}
      .table{max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}
      .header{padding:20px 24px;background:${brandPrimary};color:#fff}
      .brand{font-weight:700;font-size:18px;margin:0}
      .content{padding:24px}
      .h1{font-size:20px;line-height:1.4;margin:0 0 10px 0}
      .muted{color:#6b7280}
      .box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px}
      .reply{background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px}
      .cta{display:inline-block;background:${brandPrimary};color:#fff;border-radius:8px;padding:12px 16px;font-weight:600}
      .cta:hover{background:${brandPrimaryDark}}
      .footer{padding:16px 24px;color:#9ca3af;text-align:center;font-size:12px}
      .preheader{display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all}
    </style>
  </head>
  <body>
    <span class="preheader">${safe(preheader)}</span>
    <div class="container">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="table">
        <tr>
          <td class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="${platform}" height="28"/>` : `<h1 class="brand">${platform}</h1>`}
          </td>
        </tr>
        <tr>
          <td class="content">
            <h2 class="h1">Our reply regarding: ${safe(data.subject || 'your inquiry')}</h2>
            ${data.greeting ? `<p>${safe(data.greeting)}</p>` : ''}
            <div class="reply" style="margin:12px 0 16px;white-space:pre-wrap">${safe(data.reply)}</div>
            ${data.signature ? `<p class="muted" style="margin:12px 0 0">${safe(data.signature)}</p>` : ''}
            <p style="margin:16px 0 12px" class="muted">For reference, your original message:</p>
            <div class="box" style="margin:0 0 20px">
              <p style="margin:0 0 6px"><strong>Subject:</strong> ${safe(data.originalSubject || 'General inquiry')}</p>
              <p class="muted" style="white-space:pre-wrap;margin:0">${safe(data.originalMessage || '')}</p>
            </div>
            <p><a class="cta" href="${url}">Visit ${platform}</a></p>
          </td>
        </tr>
        <tr>
          <td class="footer">This message was sent by ${platform}. If you need more help, reply to this email.</td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

    const text = `Our reply regarding: ${data.subject || 'your inquiry'}\n\n${data.reply}\n\nOriginal message:\n${data.originalMessage || ''}\n\n${url}`;
    return { subject: `Re: ${data.subject || 'your inquiry'} — ${platform}`, html, text };
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
