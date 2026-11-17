import nodemailer from 'nodemailer';
import { emailTemplates, getPlatformName, getPlatformUrl, renderBaseEmail } from './email-templates.js';
import { prisma } from './db.js';
import crypto from 'crypto';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  initializeTransporter() {
    // Only initialize if we're in a server environment with email config
    if (typeof window !== 'undefined') {
      return;
    }
    
    try {
      // Check if we have email configuration
      const hasEmailConfig = process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD;
      
      if (!hasEmailConfig) {
        console.warn('Email configuration not found. Using test account for development.');
        // For development, we can use a test account or just log that emails would be sent
        this.transporter = {
          sendMail: async (options) => {
            console.log('📧 EMAIL WOULD BE SENT (Development Mode):', {
              to: options.to,
              subject: options.subject,
              from: options.from
            });
            return { messageId: 'dev-' + Date.now() };
          }
        };
        return;
      }
      
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_SERVER_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Test the connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email transporter verification failed:', error);
        } else {
          console.log('Email transporter ready');
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(toOrOptions, subject, html, text) {
    let to, from, subj, bodyHtml, bodyText;
    if (typeof toOrOptions === 'object' && toOrOptions !== null) {
      to = toOrOptions.to;
      from = toOrOptions.from;
      subj = toOrOptions.subject;
      bodyHtml = toOrOptions.html;
      bodyText = toOrOptions.text;
    } else {
      to = toOrOptions;
      subj = subject;
      bodyHtml = html;
      bodyText = text;
    }

    if (!this.transporter) {
      this.initializeTransporter();
    }

    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    // Validate recipient email
    if (!to || typeof to !== 'string' || to.trim() === '') {
      console.error('Invalid recipient email:', to);
      return false;
    }

    try {
      const mailOptions = {
        from: from || process.env.EMAIL_FROM || 'noreply@techblog.com',
        to: to.trim(),
        subject: subj,
        html: bodyHtml,
        text: bodyText,
      };

      console.log('📧 Sending email to:', to, 'Subject:', subj);
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      console.error('Email details:', { to, subject, from: process.env.EMAIL_FROM });
      return false;
    }
  }

  // Send verification email
  async sendVerificationEmail(email, token) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const verificationUrl = `${getPlatformUrl()}/auth/verify?token=${token}`;
    const template = emailTemplates.verificationEmail({
      fullName: user.fullName,
      platformName: getPlatformName(),
      verificationUrl,
      platformUrl: getPlatformUrl()
    });

    return this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const resetUrl = `${getPlatformUrl()}/auth/reset-password?token=${token}`;
    const template = emailTemplates.passwordReset({
      fullName: user.fullName,
      platformName: getPlatformName(),
      resetUrl,
      platformUrl: getPlatformUrl()
    });

    return this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  // Send welcome email
  async sendWelcomeEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const loginUrl = `${getPlatformUrl()}/auth/signin`;
    const template = emailTemplates.welcomeEmail({
      fullName: user.fullName,
      platformName: getPlatformName(),
      loginUrl,
      platformUrl: getPlatformUrl()
    });

    return this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  // Send invitation email
  async sendInvitationEmail(email, invitationData) {
    const template = emailTemplates.userInvitation({
      fullName: invitationData.fullName,
      username: invitationData.username,
      email: invitationData.email,
      role: invitationData.role,
      platformName: getPlatformName(),
      resetUrl: invitationData.resetUrl,
      customMessage: invitationData.customMessage,
      platformUrl: getPlatformUrl()
    });

    return this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  // Send contact acknowledgement
  async sendContactAcknowledgement(contactData) {
    try {
      console.log('📧 Preparing contact acknowledgement for:', contactData.email);
      
      const template = emailTemplates.contactAcknowledgement({
        name: contactData.name,
        subject: contactData.subject,
        message: contactData.message,
        platformName: getPlatformName(),
        platformUrl: getPlatformUrl(),
        supportEmail: process.env.SUPPORT_EMAIL
      });

      console.log('📧 Contact acknowledgement template prepared, sending email...');
      
      const result = await this.sendEmail(
        contactData.email,
        template.subject,
        template.html,
        template.text
      );
      
      console.log('📧 Contact acknowledgement result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in sendContactAcknowledgement:', error);
      return false;
    }
  }

  // Send contact reply
  async sendContactReply(contactData, replyData) {
    const template = emailTemplates.contactReply({
      subject: replyData.subject,
      reply: replyData.reply,
      greeting: replyData.greeting,
      signature: replyData.signature,
      originalSubject: contactData.subject,
      originalMessage: contactData.message,
      platformName: getPlatformName(),
      platformUrl: getPlatformUrl()
    });

    return this.sendEmail(
      contactData.email,
      template.subject,
      template.html,
      template.text
    );
  }

  // Send admin notification for new contact
  async sendAdminNotification(contactData) {
    try {
      console.log('📧 Preparing admin notification for contact:', contactData.contactId);
      
      // Check if the template exists
      if (!emailTemplates.adminContactNotification) {
        console.warn('Admin notification template not found, using fallback');
        // Fallback to a simple email
        const subject = `New Contact Form Submission - ${getPlatformName()}`;
        const html = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Subject:</strong> ${contactData.subject || 'General inquiry'}</p>
          <p><strong>Message:</strong> ${contactData.message}</p>
          <p><strong>Category:</strong> ${contactData.category || 'General'}</p>
          <p><strong>Priority:</strong> ${contactData.priority || 'MEDIUM'}</p>
          <p><strong>Spam Score:</strong> ${contactData.spamScore || 0}%</p>
        `;
        const text = `New Contact: ${contactData.name} (${contactData.email}) - ${contactData.subject || 'General inquiry'}`;
        
        // Send to admin email(s) - prioritize SUPPORT_EMAIL
        const adminEmails = process.env.SUPPORT_EMAIL ? 
          [process.env.SUPPORT_EMAIL] : 
          (process.env.ADMIN_EMAILS ? 
            process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : 
            [process.env.ADMIN_EMAIL || 'admin@techblog.com']);

        console.log('📧 Sending fallback admin notification to:', adminEmails);

        const results = await Promise.allSettled(
          adminEmails.map(email => 
            this.sendEmail(email, subject, html, text)
          )
        );

        return results.some(result => result.status === 'fulfilled' && result.value);
      }

      console.log('📧 Using adminContactNotification template');
      
      const template = emailTemplates.adminContactNotification({
        contactId: contactData.contactId,
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        category: contactData.category,
        priority: contactData.priority,
        source: contactData.source,
        spamScore: contactData.spamScore,
        platformName: getPlatformName(),
        platformUrl: getPlatformUrl()
      });

      // Send to admin email(s) - prioritize SUPPORT_EMAIL
      const adminEmails = process.env.SUPPORT_EMAIL ? 
        [process.env.SUPPORT_EMAIL] : 
        (process.env.ADMIN_EMAILS ? 
          process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : 
          [process.env.ADMIN_EMAIL || 'admin@techblog.com']);

      console.log('📧 Sending admin notification to:', adminEmails);

      const results = await Promise.allSettled(
        adminEmails.map(email => 
          this.sendEmail(email, template.subject, template.html, template.text)
        )
      );

      return results.some(result => result.status === 'fulfilled' && result.value);
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      return false;
    }
  }

  // Send contact reminder (for unresponded contacts)
  async sendContactReminder(contactData) {
    const template = emailTemplates.contactReminder({
      name: contactData.name,
      subject: contactData.subject,
      message: contactData.message,
      daysSinceSubmission: contactData.daysSinceSubmission,
      platformName: getPlatformName(),
      platformUrl: getPlatformUrl()
    });

    return this.sendEmail(
      contactData.email,
      template.subject,
      template.html,
      template.text
    );
  }

  // Generate verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate password reset token
  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create verification token in database
  async createVerificationToken(email, token, type = 'email') {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to create verification token:', error);
      return false;
    }
  }

  // Verify token from database
  async verifyToken(email, token, type = 'email') {
    try {
      const verificationToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          token,
          expires: {
            gt: new Date(),
          },
        },
      });

      if (verificationToken) {
        // Delete the used token
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: email,
              token,
            },
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to verify token:', error);
      return false;
    }
  }

  // Clean up expired tokens
  async cleanupExpiredTokens() {
    try {
      await prisma.verificationToken.deleteMany({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error);
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;

// Comment notification email
export async function sendCommentNotificationEmail(comment, post, recipient) {
  const platform = getPlatformName();
  const url = getPlatformUrl();
  const subject = `💬 New comment on "${post.title}" — ${platform}`;
  const authorName = comment.author?.fullName || comment.author?.username || 'A reader';

  const contentHtml = `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 20px 0;">
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
        Article Title
      </div>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
        ${post.title}
      </div>

      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
        Comment by ${authorName}
      </div>
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 8px; padding: 14px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
${comment.content}
      </div>
      <div style="margin-top: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #94a3b8;">
        Posted on ${new Date(comment.createdAt || Date.now()).toLocaleString()}
      </div>
    </div>
  `;

  const html = renderBaseEmail({
    platformName: platform,
    platformUrl: url,
    preheader: `New comment by ${authorName} on "${post.title}"`,
    heroBadge: '💬 NEW COMMENT',
    heroBadgeColor: '#2563eb',
    heroBadgeBg: '#eff6ff',
    heroBadgeBorder: '#bfdbfe',
    title: 'New Discussion Comment',
    subtitle: `${authorName} joined the discussion on your article.`,
    contentHtml,
    ctaText: 'View Comment on Article',
    ctaUrl: `${url}/blog/${post.slug}`,
  });

  return await emailService.sendEmail(recipient.email, subject, html);
}

// Comment approval notification
export async function sendCommentApprovalEmail(comment, post, author) {
  const platform = getPlatformName();
  const url = getPlatformUrl();
  const subject = `✅ Your comment has been approved — ${platform}`;

  const contentHtml = `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 20px 0;">
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
        Article Title
      </div>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
        ${post.title}
      </div>

      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
        Approved Comment
      </div>
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #10b981; border-radius: 8px; padding: 14px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
${comment.content}
      </div>
    </div>
  `;

  const html = renderBaseEmail({
    platformName: platform,
    platformUrl: url,
    preheader: `Your comment on "${post.title}" is now published and visible to everyone.`,
    heroBadge: '✓ APPROVED & PUBLISHED',
    heroBadgeColor: '#059669',
    heroBadgeBg: '#ecfdf5',
    heroBadgeBorder: '#a7f3d0',
    title: 'Your Comment is Live!',
    subtitle: `Your comment on "${post.title}" was approved and is now published.`,
    contentHtml,
    ctaText: 'View Live Discussion',
    ctaUrl: `${url}/blog/${post.slug}`,
  });

  return await emailService.sendEmail(author.email, subject, html);
}
