import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt | respondedAt | status | name | email
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.contact.count({ where });

    // Sorting
    const orderBy = (() => {
      if (sortBy === 'respondedAt') return [{ respondedAt: order }, { createdAt: 'desc' }];
      if (sortBy === 'status') return [{ status: order }, { createdAt: 'desc' }];
      if (sortBy === 'name') return [{ name: order }];
      if (sortBy === 'email') return [{ email: order }];
      return [{ createdAt: order }];
    })();

    // Get contacts with pagination
    const contacts = await prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy
    });

    // Summary cards data
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const [pendingCount, respondedCount, spamCount, archivedCount, respondedToday] = await Promise.all([
      prisma.contact.count({ where: { status: 'PENDING' } }),
      prisma.contact.count({ where: { status: 'RESPONDED' } }),
      prisma.contact.count({ where: { status: 'SPAM' } }),
      prisma.contact.count({ where: { status: 'ARCHIVED' } }),
      prisma.contact.count({ where: { status: 'RESPONDED', respondedAt: { gte: startOfToday } } })
    ]);

    return NextResponse.json({
      contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        total,
        pending: pendingCount,
        responded: respondedCount,
        spam: spamCount,
        archived: archivedCount,
        respondedToday
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
