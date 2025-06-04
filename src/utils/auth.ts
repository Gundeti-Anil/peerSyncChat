import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<Session['user']> {
  const session = await getSession();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return session.user;
}

export async function requireRole(role: 'user' | 'admin' | 'moderator'): Promise<Session['user']> {
  const user = await getCurrentUser();

  if (user.role !== role && user.role !== 'admin') {
    redirect('/auth/unauthorized');
  }

  return user;
}

export async function requireAdmin(): Promise<Session['user']> {
  return await requireRole('admin');
}

export async function requireVerifiedEmail(): Promise<Session['user']> {
  const user = await getCurrentUser();

  if (!user.emailVerified) {
    redirect('/auth/verify-email');
  }

  return user;
}
