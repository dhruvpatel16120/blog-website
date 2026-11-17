import SignInForm from '@/components/auth/SignInForm';

export const metadata = {
  title: 'Sign In - TechBlog',
  description: 'Sign in to your TechBlog account to participate, comment, and read personalized stories.',
};

export default function SignInPage() {
  return <SignInForm />;
}
