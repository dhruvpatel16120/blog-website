// Email templates for the blog platform

export const emailTemplates = {
  // Contact acknowledgement template
  contactAcknowledgement: (data) => ({
    subject: `We received your message — ${data.platformName || 'Our Blog'}`,
    html: `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color:#111827; margin:0; background:#f9fafb; }
          .container { max-width:640px; margin:0 auto; padding:24px; }
          .card { background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
          .header { background:linear-gradient(135deg,#2563eb,#7c3aed); color:#fff; padding:28px 24px; }
          h1 { font-size:20px; margin:0; }
          .content { padding:24px; }
          .muted { color:#6b7280; }
          .box { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:16px; }
          .footer { text-align:center; color:#9ca3af; font-size:12px; padding:16px 24px 24px; }
          a.btn { display:inline-block; background:#2563eb; color:#ffffff!important; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <h1>Thanks for contacting ${data.platformName || 'our team'}!</h1>
              <p style="margin:8px 0 0; opacity:.9">We've received your message and will get back to you shortly.</p>
            </div>
            <div class="content">
              <p>Hi ${data.name?.split(' ')[0] || 'there'},</p>
              <p class="muted">Below is a copy of your submission for your records.</p>
              <div class="box" style="margin:16px 0">
                <p><strong>Subject:</strong> ${data.subject || 'General inquiry'}</p>
                <p><strong>Message:</strong></p>
                <p class="muted" style="white-space:pre-wrap">${(data.message || '').replace(/</g,'&lt;')}</p>
              </div>
              ${data.platformUrl ? `<p><a class="btn" href="${data.platformUrl}">Visit ${data.platformName || 'our site'}</a></p>` : ''}
              ${data.supportEmail ? `<p class="muted">Need to update anything? Reply to this email or write us at ${data.supportEmail}.</p>` : ''}
            </div>
            <div class="footer">This is an automated acknowledgement from ${data.platformName || 'our blog'}.</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Thanks for contacting ${data.platformName || 'our team'}!\n\nSubject: ${data.subject || 'General inquiry'}\n\n${data.message}\n\n${data.platformUrl || ''}`
  }),
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
