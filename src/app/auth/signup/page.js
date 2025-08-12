import SignUpForm from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'Sign Up - Tech Blog',
  description: 'Create your account on Tech Blog',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <SignUpForm />
    </div>
  );
}
