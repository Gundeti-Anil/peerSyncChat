'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
          <p className="mt-2 text-gray-600">
            {error || 'An error occurred during authentication'}
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}