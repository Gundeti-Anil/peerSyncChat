import { DefaultSession, Profile } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';

export type UserRole = 'user' | 'admin' | 'moderator' ;

export interface AuthAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

export interface ExtendedUser extends AdapterUser {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
  emailVerified: Date | null;
  interestedIn?: string[] | null;
}

export interface ExtendedJWT extends JWT {
  id: string;
  role: UserRole;
  provider?: string;
  emailVerified: Date | null;
}

export interface ExtendedSession extends DefaultSession {
  user: {
    id: string;
    role: UserRole;
    emailVerified: Date | null;
    interestedIn: string[] | null;
  } & DefaultSession['user'];
}

export interface GoogleProfile extends Profile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified?: boolean;
}

export interface SignInEventData {
  userId: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  provider?: string;
  timestamp: Date;
}
