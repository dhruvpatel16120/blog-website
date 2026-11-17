import NextAuth from 'next-auth';
import { authOptions } from './nextauth-combined';

/**
 * Unified auth export for backward compatibility.
 * All route handlers and getServerSession calls use the same unified authOptions.
 */
export const userAuthOptions = authOptions;
export { authOptions };

export default NextAuth(authOptions);
