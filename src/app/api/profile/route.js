import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { userAuthOptions } from '@/lib/auth';
// audit removed

export async function PATCH(request) {
  try {
    const session = await getServerSession(userAuthOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();

    const data = {
      fullName: body.fullName ?? undefined,
      username: body.username ?? undefined,
      bio: body.bio ?? undefined,
      website: body.website ?? undefined,
      location: body.location ?? undefined,
      avatar: body.avatar ?? undefined,
    };

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // audit removed
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(userAuthOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await request.json();
    if (id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Soft delete: anonymize and deactivate
    await prisma.user.update({
      where: { id },
      data: { isActive: false, email: `deleted_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`, username: `deleted_${Date.now()}` },
    });
    // audit removed
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}


