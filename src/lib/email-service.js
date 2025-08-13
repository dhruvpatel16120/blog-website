import nodemailer from 'nodemailer';
import { emailTemplates, getPlatformName, getPlatformUrl } from './email-templates';
import { prisma } from './db';
import crypto from 'crypto';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  initializeTransporter() {
    // Only initialize if we're in a server environment with email config
    if (typeof window !== 'undefined' || !process.env.EMAIL_SERVER_USER) {
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(to, subject, html, text) {
    if (!this.transporter) {
      this.initializeTransporter();
    }

    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@techblog.com',
        to,
        subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
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
    const template = emailTemplates.contactAcknowledgement({
      name: contactData.name,
      subject: contactData.subject,
      message: contactData.message,
      platformName: getPlatformName(),
      platformUrl: getPlatformUrl(),
      supportEmail: process.env.SUPPORT_EMAIL
    });

    return this.sendEmail(
      contactData.email,
      template.subject,
      template.html,
      template.text
    );
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
  const subject = `New comment on "${post.title}"`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Comment Notification</h2>
      <p>A new comment has been posted on your blog post.</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Post: ${post.title}</h3>
        <p><strong>Comment by:</strong> ${comment.author.fullName || comment.author.username}</p>
        <p><strong>Comment:</strong></p>
        <p style="background: white; padding: 10px; border-left: 3px solid #007bff; margin: 10px 0;">
          ${comment.content}
        </p>
        <p><small>Posted on: ${new Date(comment.createdAt).toLocaleString()}</small></p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}" 
           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          View Post
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        You can manage comments in your admin panel.
      </p>
    </div>
  `;

  return await emailService.sendEmail(recipient.email, subject, html);
}

// Comment approval notification
export async function sendCommentApprovalEmail(comment, post, author) {
  const subject = `Your comment has been approved`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Comment Approved</h2>
      <p>Your comment has been approved and is now visible on the blog.</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Post: ${post.title}</h3>
        <p><strong>Your comment:</strong></p>
        <p style="background: white; padding: 10px; border-left: 3px solid #28a745; margin: 10px 0;">
          ${comment.content}
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}" 
           style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          View Post
        </a>
      </div>
    </div>
  `;

  return await emailService.sendEmail(author.email, subject, html);
}
