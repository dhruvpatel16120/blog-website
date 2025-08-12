import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import nodemailer from 'nodemailer';
import { emailTemplates, getPlatformName, getPlatformUrl } from '@/lib/email-templates';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { response, subject, greeting, signature } = await request.json();

    if (!response) {
      return NextResponse.json(
        { error: 'Response is required' },
        { status: 400 }
      );
    }

    // Update the contact with response
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        status: 'RESPONDED',
        response,
        respondedAt: new Date(),
        respondedBy: session.user.id
      }
    });

    // Send email reply (non-blocking errors)
    try {
      const host = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
      const port = Number(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || 587);
      const user = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
      const pass = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;
      const secure = (process.env.EMAIL_SERVER_SECURE || process.env.SMTP_SECURE) === 'true' || port === 465;
      let transporter;
      if (host) {
        transporter = nodemailer.createTransport({ host, port, secure, auth: user && pass ? { user, pass } : undefined });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
      }

      const platformName = getPlatformName();
      const baseUrl = getPlatformUrl();
      const tmpl = emailTemplates.contactReply({
        platformName,
        platformUrl: baseUrl,
        subject: subject || contact.subject,
        greeting,
        reply: response,
        signature,
        originalSubject: contact.subject,
        originalMessage: contact.message
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_FROM || `no-reply@${new URL(baseUrl).hostname}`,
        to: contact.email,
        subject: tmpl.subject,
        html: tmpl.html,
        text: tmpl.text
      });
    } catch (e) {
      console.warn('Failed to send reply email:', e?.message || e);
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        status: contact.status,
        response: contact.response,
        respondedAt: contact.respondedAt
      }
    });

  } catch (error) {
    console.error('Error responding to contact:', error);
    return NextResponse.json(
      { error: 'Failed to send response' },
      { status: 500 }
    );
  }
}
