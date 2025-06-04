'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface UseAuthReturn {
  user: Session['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: 'user' | 'admin' | 'moderator') => boolean;
  isEmailVerified: boolean;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;
  const user = session?.user || null;

  const hasRole = (role: 'user' | 'admin' | 'moderator'): boolean => {
    if (!user) return false;
    return user.role === role || user.role === 'admin';
  };

  const isAdmin = hasRole('admin');
  const isEmailVerified = !!user?.emailVerified;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    hasRole,
    isEmailVerified,
  };
}
