import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
    const q = searchParams.get('q')?.trim() || '';
    const status = searchParams.get('status') || 'all'; // all | active | inactive
    const role = searchParams.get('role') || 'all'; // all | USER | ADMIN
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt | lastLogin | fullName | role
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

    const where = {
      AND: [
        q
          ? {
              OR: [
                { username: { contains: q, mode: 'insensitive' } },
                { fullName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {},
        status === 'active' ? { isActive: true } : {},
        status === 'inactive' ? { isActive: false } : {},
        role !== 'all' ? { role } : {},
      ],
    };

    const orderBy = (() => {
      switch (sortBy) {
        case 'lastLogin':
          return { lastLogin: order };
        case 'fullName':
          return { fullName: order };
        case 'role':
          return { role: order };
        case 'createdAt':
        default:
          return { createdAt: order };
      }
    })();

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          avatar: true,
          bio: true,
          website: true,
          location: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    const data = users.map((user) => ({
      ...user,
      postCount: user._count.posts,
      commentCount: user._count.comments,
      _count: undefined,
    }));

    return NextResponse.json({
      data,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      sortBy,
      order,
      filters: { q, status, role },
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.type !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, role } = await request.json();
  if (!id || !role) return NextResponse.json({ error: 'id and role required' }, { status: 400 });
  const allowed = ['USER', 'ADMIN'];
  if (!allowed.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  // Only SUPER_ADMIN can elevate to ADMIN role for users
  // no SUPER_ADMIN distinction anymore
  await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ message: 'Updated' });
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role === 'MODERATOR') {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
    }

    const body = await request.json();
    const {
      username,
      email,
      fullName,
      password,
      role = 'USER',
      isActive = true,
      bio = '',
      website = '',
      location = '',
    } = body;

    if (!username || !email || !fullName || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters long' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const allowedRoles = ['USER', 'ADMIN'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    // admins can assign admin

    const [existingUsername, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { username } }),
      prisma.user.findUnique({ where: { email } }),
    ]);
    if (existingUsername) return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    if (existingEmail) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        password: hashedPassword,
        role,
        bio,
        website,
        location,
        isActive,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}


