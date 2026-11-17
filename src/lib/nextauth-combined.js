import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { generateAvatarUrl } from './utils';

export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    // User credentials provider (Email + Password)
    CredentialsProvider({
      id: 'user-credentials',
      name: 'user-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              username: true,
              fullName: true,
              password: true,
              avatar: true,
              role: true,
              isActive: true,
              emailVerified: true,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          // Requirement 3: Check if user is active / verified
          if (!user.isActive || !user.emailVerified) {
            throw new Error(`EMAIL_NOT_VERIFIED:${user.email}`);
          }

          // Asynchronously update last login
          prisma.user
            .update({
              where: { id: user.id },
              data: { lastLogin: new Date() },
            })
            .catch((err) => console.error('Failed to update user lastLogin:', err));

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive,
            type: 'user',
          };
        } catch (e) {
          if (e.message?.startsWith('EMAIL_NOT_VERIFIED')) {
            throw e;
          }
          console.error('User auth error:', e);
          return null;
        }
      },
    }),

    // Admin credentials provider (Email + Password)
    // Requirement 2: Admin authentication uses Email
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'admin-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const identifier = (credentials?.email || credentials?.username || '').trim().toLowerCase();
        if (!identifier || !credentials?.password) return null;

        try {
          // Allow login by admin email or username
          const admin = await prisma.admin.findFirst({
            where: {
              OR: [
                { email: identifier },
                { username: identifier },
              ],
            },
          });

          if (!admin || !admin.password || !admin.isActive) return null;

          // Check if account is temporarily locked
          if (admin.lockedUntil && admin.lockedUntil > new Date()) {
            console.warn(`Admin account locked: ${identifier}`);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, admin.password);

          if (!isValid) {
            const nextAttempts = (admin.loginAttempts || 0) + 1;
            const updatePayload = { loginAttempts: nextAttempts };
            if (nextAttempts >= 5) {
              updatePayload.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            }

            await prisma.admin.update({
              where: { id: admin.id },
              data: updatePayload,
            }).catch((err) => console.error('Failed to record failed admin login:', err));

            return null;
          }

          // Reset attempts on success
          await prisma.admin.update({
            where: { id: admin.id },
            data: {
              lastLogin: new Date(),
              loginAttempts: 0,
              lockedUntil: null,
            },
          }).catch((err) => console.error('Failed to update admin login state:', err));

          return {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            fullName: admin.fullName,
            avatar: admin.avatar,
            role: admin.role,
            permissions: admin.permissions,
            isActive: admin.isActive,
            type: 'admin',
          };
        } catch (e) {
          console.error('Admin auth error:', e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = user.type;
        token.id = user.id;
        token.username = user.username;
        token.fullName = user.fullName;
        token.avatar = user.avatar || generateAvatarUrl(user.fullName, user.username);
        token.role = user.role;
        token.permissions = user.permissions;
        token.isActive = user.isActive;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          type: token.type,
          id: token.id,
          username: token.username,
          fullName: token.fullName,
          avatar: token.avatar,
          role: token.role,
          permissions: token.permissions,
          isActive: token.isActive,
          email: token.email,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
