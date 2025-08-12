import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// activity/audit removed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { response } = await request.json();

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

    // activity removed

    // Here you would typically send an email to the contact
    // For now, we'll just log it
    console.log(`Response sent to ${contact.email}:`, response);

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
