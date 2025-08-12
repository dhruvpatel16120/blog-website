import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  providers: [
    // User credentials provider
    CredentialsProvider({
      id: 'user-credentials',
      name: 'user-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user || !user.password || !user.isActive) return null
          const ok = await bcrypt.compare(credentials.password, user.password)
          if (!ok) return null
          await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive,
            type: 'user'
          }
        } catch (e) {
          console.error('User auth error:', e)
          return null
        }
      }
    }),
    // Admin credentials provider
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'admin-credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        try {
          const admin = await prisma.admin.findUnique({ where: { username: credentials.username } })
          if (!admin || !admin.password || !admin.isActive) return null
          if (admin.lockedUntil && admin.lockedUntil > new Date()) return null
          const ok = await bcrypt.compare(credentials.password, admin.password)
          if (!ok) return null
          await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date(), loginAttempts: 0, lockedUntil: null }
          })
          return {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            fullName: admin.fullName,
            avatar: admin.avatar,
            role: admin.role,
            permissions: admin.permissions,
            isActive: admin.isActive,
            type: 'admin'
          }
        } catch (e) {
          console.error('Admin auth error:', e)
          return null
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.type = user.type
          token.id = user.id
          token.username = user.username
          token.fullName = user.fullName
          token.avatar = user.avatar
          token.role = user.role
          token.permissions = user.permissions
          token.isActive = user.isActive
          token.email = user.email
        }
        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.type = token.type
          session.user.id = token.id
          session.user.username = token.username
          session.user.fullName = token.fullName
          session.user.avatar = token.avatar
          session.user.role = token.role
          session.user.permissions = token.permissions
          session.user.isActive = token.isActive
          session.user.email = token.email
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


