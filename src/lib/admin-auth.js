import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const adminAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'admin-credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: { username: credentials.username }
          });

          if (!admin || !admin.password || !admin.isActive) {
            return null;
          }

          // Check if account is locked
          if (admin.lockedUntil && admin.lockedUntil > new Date()) {
            throw new Error('Account is temporarily locked');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isPasswordValid) {
            // Increment login attempts
            const newAttempts = admin.loginAttempts + 1;
            const updateData = { loginAttempts: newAttempts };
            
            // Lock account after 5 failed attempts for 30 minutes
            if (newAttempts >= 5) {
              updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            }
            
            await prisma.admin.update({
              where: { id: admin.id },
              data: updateData
            });

            return null;
          }

          // Reset login attempts on successful login
          await prisma.admin.update({
            where: { id: admin.id },
            data: { 
              lastLogin: new Date(),
              loginAttempts: 0,
              lockedUntil: null
            }
          });

          return {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            fullName: admin.fullName,
            avatar: admin.avatar,
            role: admin.role,
            permissions: admin.permissions,
            type: 'admin'
          };
        } catch (error) {
          console.error('Admin auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours for admin sessions
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = user.type;
        token.id = user.id;
        token.username = user.username;
        token.fullName = user.fullName;
        token.avatar = user.avatar;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.type = token.type;
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.fullName = token.fullName;
        session.user.avatar = token.avatar;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(adminAuthOptions);

export { handler as GET, handler as POST };
