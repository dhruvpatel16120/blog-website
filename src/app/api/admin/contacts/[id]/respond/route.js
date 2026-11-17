import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { enqueueEmail } from '@/lib/email-queue';
import { emailTemplates, getPlatformName, getPlatformUrl } from '@/lib/email-templates';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
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

    // Enqueue response email asynchronously via Email Queue
    try {
      const platformName = getPlatformName();
      const baseUrl = getPlatformUrl();
      const tmpl = emailTemplates.contactReply({
        platformName,
        platformUrl: baseUrl,
        subject: subject || contact.subject || 'Response to your inquiry',
        greeting,
        reply: response,
        signature,
        originalSubject: contact.subject,
        originalMessage: contact.message
      });

      await enqueueEmail({
        to: contact.email,
        subject: tmpl.subject,
        body: tmpl.html,
        type: 'CONTACT_REPLY',
        metadata: {
          contactId: contact.id,
          name: contact.name,
          adminId: session.user.id,
        },
      });
    } catch (e) {
      console.warn('Failed to enqueue reply email:', e?.message || e);
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
