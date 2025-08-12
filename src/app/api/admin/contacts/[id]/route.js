import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// Return a single contact
export async function GET(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: { status }
    });

    // Create admin notification for status change
    try {
      await prisma.notification.create({
        data: {
          type: 'info',
          message: `Contact status updated to ${String(status)} for ${contact.name}`,
          adminId: session.user.id,
          read: false
        }
      });
    } catch (e) {
      console.warn('Notification create failed (status update):', e?.message || e);
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        status: contact.status
      }
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!['SPAM', 'ARCHIVED'].includes(String(existing.status))) {
      return NextResponse.json({ error: 'Only contacts marked as SPAM or ARCHIVED can be deleted' }, { status: 400 });
    }

    await prisma.contact.delete({ where: { id } });

    // Create admin notification for deletion
    try {
      await prisma.notification.create({
        data: {
          type: 'warning',
          message: `Contact deleted: ${existing.name} (${existing.email})`,
          adminId: session.user.id,
          read: false
        }
      });
    } catch (e) {
      console.warn('Notification create failed (delete):', e?.message || e);
    }

    return NextResponse.json({ success: true, message: 'Contact deleted successfully' });

  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
