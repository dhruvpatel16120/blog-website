"use client";

import { useSearchParams } from 'next/navigation';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!error) return null;

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return {
          title: 'Invalid Credentials',
          message: 'The email or password you entered is incorrect.',
          type: 'error',
          suggestion: 'Please check your credentials and try again.'
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this resource.',
          type: 'error',
          suggestion: 'Contact support if you believe this is a mistake.'
        };
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'There is an issue with the authentication configuration.',
          type: 'error',
          suggestion: 'Please contact the site administrator.'
        };
      default:
        return {
          title: 'Authentication Error',
          message: 'An unknown authentication error occurred.',
          type: 'error',
          suggestion: 'Please try again or contact support if the issue persists.'
        };
    }
  };

  const errorInfo = getErrorMessage(error);
  const isWarning = errorInfo.type === 'warning';

  return (
    <Card className={`p-4 mb-6 border ${isWarning 
      ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800' 
      : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
    }`}>
      <div className="flex items-start space-x-3">
        {isWarning ? (
          <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
        ) : (
          <InformationCircleIcon className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
        )}
        <div>
          <h3 className={`text-lg font-medium ${isWarning 
            ? 'text-orange-800 dark:text-orange-200' 
            : 'text-red-800 dark:text-red-200'
          }`}>
            {errorInfo.title}
          </h3>
          <p className={`mt-1 text-sm ${isWarning 
            ? 'text-orange-700 dark:text-orange-300' 
            : 'text-red-700 dark:text-red-300'
          }`}>
            {errorInfo.message}
          </p>
          {errorInfo.suggestion && (
            <p className={`mt-2 text-sm font-medium ${isWarning 
              ? 'text-orange-800 dark:text-orange-200' 
              : 'text-red-800 dark:text-red-200'
            }`}>
              💡 {errorInfo.suggestion}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
