import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';
import { emailTemplates, getPlatformName, getPlatformUrl } from '@/lib/email-templates';

// Ensure Node runtime for nodemailer
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save contact
    const contact = await prisma.contact.create({
      data: { name, email, subject: subject || null, message, status: 'PENDING' }
    });

    // Create admin notification
    try {
      await prisma.notification.create({
        data: {
          type: 'info',
          message: `New contact from ${name} <${email}>${subject ? ` — ${subject}` : ''}`,
          adminId: null,
          read: false
        }
      });
    } catch (e) {
      console.warn('Failed to create admin notification for contact:', e?.message || e);
    }

    // Send acknowledgement email to user (do not fail request if email cannot be sent)
    try {
      await sendAcknowledgementEmail({ name, email, subject, message });
    } catch (e) {
      console.warn('Contact acknowledgement email failed:', e?.message || e);
    }

    return NextResponse.json({ success: true, id: contact.id });
  } catch (error) {
    console.error('Contact submit error:', error);
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
  }
}

async function sendAcknowledgementEmail({ name, email, subject, message }) {
  let transporter;
  const host = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;
  const secure = (process.env.EMAIL_SERVER_SECURE || process.env.SMTP_SECURE) === 'true' || port === 465;

  if (host) {
    transporter = nodemailer.createTransport({ host, port, secure, auth: user && pass ? { user, pass } : undefined });
  } else {
    // Development fallback: use Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
  }

  const platformName = getPlatformName();
  const baseUrl = getPlatformUrl();

  const tmpl = emailTemplates.contactAcknowledgement({
    name,
    subject,
    message,
    platformName,
    platformUrl: baseUrl,
    supportEmail: process.env.SMTP_FROM
  });

  const fromAddr = process.env.EMAIL_FROM || process.env.SMTP_FROM || `no-reply@${new URL(baseUrl).hostname}`;
  const info = await transporter.sendMail({
    from: fromAddr,
    to: email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text
  });

  // Log preview URL in development
  try {
    const preview = nodemailer.getTestMessageUrl?.(info);
    if (preview) console.log('Ethereal preview URL:', preview);
  } catch {}
}


