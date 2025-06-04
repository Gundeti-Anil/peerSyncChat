import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { env } from '@/env';
import { logger } from './logger';
import type {
  ExtendedUser,
  ExtendedJWT,
  ExtendedSession,
  GoogleProfile,
  SignInEventData,
  AuthAttempt,
  UserRole,
} from '@/types/auth';

const AUTH_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_DURATION: 30 * 60 * 1000,
  SESSION_MAX_AGE: 30 * 24 * 60 * 60,
  JWT_MAX_AGE: 30 * 24 * 60 * 60,
  UPDATE_AGE: 24 * 60 * 60,
} as const;

const ENVIRONMENT = {
  NEXTAUTH_SECRET: env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: env.AUTH_GOOGLE_ID,
  GOOGLE_CLIENT_SECRET: env.AUTH_GOOGLE_SECRET,
  LINKEDIN_CLIENT_ID: env.AUTH_LINKEDIN_ID,
  LINKEDIN_CLIENT_SECRET: env.AUTH_LINKEDIN_SECRET,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

const authAttempts = new Map<string, AuthAttempt>();

const cleanupExpiredAttempts = (): void => {
  const now = Date.now();
  for (const [key, attempt] of authAttempts.entries()) {
    if (attempt.lockedUntil && now > attempt.lockedUntil) {
      authAttempts.delete(key);
    }
  }
};

const isRateLimited = (identifier: string): boolean => {
  cleanupExpiredAttempts();
  const attempt = authAttempts.get(identifier);
  if (!attempt) return false;

  const now = Date.now();
  return (
    attempt.count >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS &&
    (attempt.lockedUntil ? now < attempt.lockedUntil : false)
  );
};

const recordFailedAttempt = (identifier: string): void => {
  const now = Date.now();
  const attempt = authAttempts.get(identifier) || { count: 0, lastAttempt: now };

  attempt.count += 1;
  attempt.lastAttempt = now;

  if (attempt.count >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = now + AUTH_CONFIG.LOCKOUT_DURATION;
  }

  authAttempts.set(identifier, attempt);
};

const clearAttempts = (identifier: string): void => {
  authAttempts.delete(identifier);
};

const getClientIpAddress = (headers: Record<string, string | string[] | undefined>): string => {
  const forwardedFor = headers['x-forwarded-for'];
  const realIp = headers['x-real-ip'];
  const clientIp = headers['x-client-ip'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() || '0.0.0.0';
  }

  if (typeof realIp === 'string') {
    return realIp;
  }

  if (typeof clientIp === 'string') {
    return clientIp;
  }

  return '0.0.0.0';
};

const getUserAgent = (headers: Record<string, string | string[] | undefined>): string => {
  const userAgent = headers['user-agent'];
  return typeof userAgent === 'string' ? userAgent : 'Unknown';
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCredentials = (
  credentials: Record<string, string> | undefined,
): { email: string; password: string } => {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Email and password are required');
  }

  const email = credentials.email.toLowerCase().trim();
  const password = credentials.password;

  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  return { email, password };
};

const logAuthEvent = async (event: SignInEventData): Promise<void> => {
  try {
    if (ENVIRONMENT.IS_PRODUCTION) {
      // await db.loginEvent.create({
      //   data: {
      //     userId: parseInt(event.userId, 10),
      //     success: event.success,
      //     ipAddress: event.ipAddress,
      //     userAgent: event.userAgent,
      //     provider: event.provider,
      //     timestamp: event.timestamp,
      //   },
      // });
    }

    logger.info('Authentication event', {
      userId: event.userId,
      success: event.success,
      provider: event.provider,
      ipAddress: event.ipAddress.replace(/\d+/g, 'XXX'),
    });
  } catch (error) {
    logger.error('Failed to log authentication event', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }
};

const extractRequestInfo = (req: string | unknown): { ipAddress: string; userAgent: string } => {
  if (!req) {
    return { ipAddress: '0.0.0.0', userAgent: 'Unknown' };
  }

  const headers =
    typeof req === 'object' && req !== null && 'headers' in req && typeof req.headers === 'object'
      ? (req as { headers: Record<string, string | string[] | undefined> }).headers
      : {};
  return {
    ipAddress: getClientIpAddress(headers),
    userAgent: getUserAgent(headers),
  };
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),

  providers: [
    GoogleProvider({
      clientId: ENVIRONMENT.GOOGLE_CLIENT_ID,
      clientSecret: ENVIRONMENT.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'user' as UserRole,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'email@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
        },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        try {
          const { email, password } = validateCredentials(credentials);
          console.log(email,password)

          if (isRateLimited(email)) {
            throw new Error('Too many login attempts. Please try again later.');
          }

          const user = await db.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              interestedIn: true,
              role: true,
              image: true,
              emailVerified: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          if (!user || !user.password) {
            recordFailedAttempt(email);
            throw new Error('Invalid email or password');
          }

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            recordFailedAttempt(email);
            throw new Error('Invalid email or password');
          }

          if (ENVIRONMENT.IS_PRODUCTION && !user.emailVerified) {
            throw new Error('Please verify your email before signing in');
          }

          clearAttempts(email);

          const { ...userWithoutPassword } = user;

          return {
            ...userWithoutPassword,
            id: user.id.toString(),
            role: user.role as UserRole,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          logger.error('Credentials authentication error', {
            error: error instanceof Error ? error : new Error('Unknown error'),
            email: credentials?.email,
          });
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }): Promise<boolean> {
      try {
        if (account?.provider !== 'credentials') {
          return true;
        }

        if (!user?.email) {
          return false;
        }

        const dbUser = await db.user.findUnique({
          where: { email: user.email },
          select: { emailVerified: true },
        });

        if (!dbUser) {
          return false;
        }

        if (ENVIRONMENT.IS_PRODUCTION && !dbUser.emailVerified) {
          return false;
        }

        return true;
      } catch (error) {
        logger.error('SignIn callback error', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
        return false;
      }
    },

    async jwt({ token, user, account, trigger, session }): Promise<ExtendedJWT> {
      try {
        if (user) {
          const extendedUser = user as ExtendedUser;
          token.id = extendedUser.id;
          token.role = extendedUser.role || 'user';
          token.provider = account?.provider;
          token.emailVerified = extendedUser.emailVerified;
          token.interestedIn = extendedUser.interestedIn;
        }

        if (trigger === 'update' && session) {
          if (session.name) token.name = session.name;
          if (session.email) token.email = session.email;
          if (session.image) token.picture = session.image;
          if (session.interestedIn) token.interestedIn = session.interestedIn;
          if (session.role && token.role === 'admin') {
            token.role = session.role;
          }
        }

        if (token.id) {
          const dbUser = await db.user.findUnique({
            where: { id: parseInt(token.id.toString(), 10) },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
              interestedIn: true,
              emailVerified: true,
            },
          });

          if (dbUser) {
            const updatedToken: ExtendedJWT = {
              ...token,
              id: dbUser.id.toString(),
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role as UserRole,
              picture: dbUser.image,
              interestedIn: dbUser.interestedIn,
              emailVerified: dbUser.emailVerified,
            };
            return updatedToken;
          }
        }

        return {
          ...token,
          id: token.id || '',
          role: token.role || 'user',
          emailVerified: token.emailVerified || null,
          interestedIn: token.interestedIn || null,
        } as ExtendedJWT;
      } catch (error) {
        logger.error('JWT callback error', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
        return {
          ...token,
          id: token.id || '',
          role: token.role || 'user',
          emailVerified: token.emailVerified || null,
          interestedIn: token.interestedIn || null,
        } as ExtendedJWT;
      }
    },

    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedJWT;

      if (extendedToken && session.user) {
        session.user.id = extendedToken.id;
        session.user.role = extendedToken.role;
        session.user.emailVerified = extendedToken.emailVerified;
        session.user.interestedIn = extendedToken.interestedIn;
        
      }

      return session as ExtendedSession;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome',
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      try {
        const timestamp = new Date();

        const requestInfo = extractRequestInfo((user as unknown & { req?: unknown }).req);

        await logAuthEvent({
          userId: user.id || '',
          success: true,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          provider: account?.provider,
          timestamp,
        });

        if (user.id) {
          await db.user.update({
            where: { id: parseInt(user.id, 10) },
            data: {
              updatedAt: timestamp,
            },
          });
        }

        logger.info('User signed in', {
          userId: user.id,
          provider: account?.provider,
          isNewUser,
        });
      } catch (error) {
        logger.error('SignIn event error', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },

    async signOut({ token }) {
      try {
        logger.info('User signed out', {
          userId: (token as ExtendedJWT)?.id,
        });
      } catch (error) {
        logger.error('SignOut event error', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },

    async linkAccount({ user, account }) {
      try {
        if (user.id) {
          await db.user.update({
            where: { id: parseInt(user.id, 10) },
            data: { updatedAt: new Date() },
          });
        }

        logger.info('Account linked', {
          userId: user.id,
          provider: account.provider,
        });
      } catch (error) {
        logger.error('LinkAccount event error', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },
  },

  secret: ENVIRONMENT.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: AUTH_CONFIG.SESSION_MAX_AGE,
    updateAge: AUTH_CONFIG.UPDATE_AGE,
  },

  jwt: {
    maxAge: AUTH_CONFIG.JWT_MAX_AGE,
  },

  cookies: {
    sessionToken: {
      name: ENVIRONMENT.IS_PRODUCTION
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: ENVIRONMENT.IS_PRODUCTION,
        domain: ENVIRONMENT.IS_PRODUCTION ? process.env.COOKIE_DOMAIN : undefined,
      },
    },
    callbackUrl: {
      name: ENVIRONMENT.IS_PRODUCTION
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: ENVIRONMENT.IS_PRODUCTION,
      },
    },
    csrfToken: {
      name: ENVIRONMENT.IS_PRODUCTION ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: ENVIRONMENT.IS_PRODUCTION,
      },
    },
  },

  debug: ENVIRONMENT.IS_DEVELOPMENT,
  useSecureCookies: ENVIRONMENT.IS_PRODUCTION,

  logger: {
    error: (code, metadata) => {
      logger.error(
        `NextAuth Error: ${code}`,
        metadata instanceof Error ? { error: metadata } : metadata,
      );
    },
    warn: (code) => {
      logger.warn(`NextAuth Warning: ${code}`);
    },
    debug: (code, metadata) => {
      if (ENVIRONMENT.IS_DEVELOPMENT) {
        logger.debug(
          `NextAuth Debug: ${code}`,
          metadata instanceof Error
            ? { error: metadata }
            : typeof metadata === 'object' && metadata !== null
              ? (metadata as Record<string, unknown>)
              : undefined,
        );
      }
    },
  },
};
