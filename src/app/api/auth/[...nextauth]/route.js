import { userAuthOptions } from '@/lib/auth';
import NextAuth from 'next-auth';

const handler = NextAuth(userAuthOptions);

export { handler as GET, handler as POST };
