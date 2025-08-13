import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { prisma } from '@/lib/db';
import emailService from '@/lib/email-service';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId, replyData } = await request.json();

    if (!contactId || !replyData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Send the reply email
    const emailResult = await emailService.sendContactReply(contact, replyData);

    if (!emailResult) {
      return NextResponse.json({ 
        error: 'Failed to send email',
        warning: 'Reply was saved but email could not be sent'
      }, { status: 500 });
    }

    // Update the contact record to mark email as sent
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        emailSent: true,
        emailSentAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Reply email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending reply email:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
