import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { RegisterRequest, LoginRequest } from '@msm/shared';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { config } from '../config.js';

const registerSchema = z.object({
  businessName: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Helper to generate verification token
function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register
  fastify.post<{ Body: RegisterRequest }>('/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);

      // Check if user already exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        return reply.status(400).send({
          error: {
            message: 'Email already registered',
            code: 'EMAIL_EXISTS',
          },
        });
      }

      // Create business and user in a transaction
      const passwordHash = await hashPassword(body.password);

      const result = await fastify.prisma.$transaction(async (tx) => {
        const business = await tx.business.create({
          data: {
            name: body.businessName,
          },
        });

        const user = await tx.user.create({
          data: {
            businessId: business.id,
            email: body.email,
            name: body.name,
            passwordHash,
            role: 'ADMIN',
            emailVerificationToken: generateVerificationToken(),
            emailVerificationSentAt: new Date(),
          },
        });

        return { business, user };
      });

      // Don't log in yet - redirect to verification page
      return reply.status(201).send({
        message: 'Account created. Please verify your email.',
        requiresVerification: true,
        email: result.user.email,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });

  // Login
  fastify.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);

      // Find user
      const user = await fastify.prisma.user.findUnique({
        where: { email: body.email },
        include: { business: true },
      });

      if (!user) {
        return reply.status(401).send({
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      // Verify password
      const isValid = await verifyPassword(body.password, user.passwordHash);

      if (!isValid) {
        return reply.status(401).send({
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      // Generate JWT token
      const token = signToken({
        userId: user.id,
        businessId: user.businessId,
        role: user.role,
      });

      // Set cookie
      reply.setCookie(config.cookieName, token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        user: {
          id: user.id,
          businessId: user.businessId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        business: {
          id: user.business.id,
          name: user.business.name,
          timezone: user.business.timezone,
          identifierLabel: user.business.identifierLabel,
          defaultRebookIntervalDays: user.business.defaultRebookIntervalDays,
          defaultChannel: user.business.defaultChannel,
          setupCompleted: user.business.setupCompleted,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });

  // Logout
  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie(config.cookieName, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { success: true };
  });

  // Get current user (me)
  fastify.get('/me', {
    preHandler: fastify.authenticate,
  }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user!.id },
      include: { business: true },
    });

    if (!user) {
      return reply.status(404).send({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    return {
      user: {
        id: user.id,
        businessId: user.businessId,
        email: user.email,
        name: user.name,
          role: user.role,
      },
      business: {
        id: user.business.id,
        name: user.business.name,
        timezone: user.business.timezone,
        identifierLabel: user.business.identifierLabel,
        defaultRebookIntervalDays: user.business.defaultRebookIntervalDays,
        defaultChannel: user.business.defaultChannel,
        setupCompleted: user.business.setupCompleted,
      },
    };
  });

  // Verify email endpoint
  fastify.post<{ Body: { token: string } }>('/verify-email', async (request, reply) => {
    try {
      const { token } = request.body;

      if (!token) {
        return reply.status(400).send({
          error: {
            message: 'Verification token required',
            code: 'MISSING_TOKEN',
          },
        });
      }

      const user = await fastify.prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
        },
        include: { business: true },
      });

      if (!user) {
        return reply.status(400).send({
          error: {
            message: 'Invalid or expired verification token',
            code: 'INVALID_TOKEN',
          },
        });
      }

      // Check if token is older than 24 hours
      const tokenAge = Date.now() - (user.emailVerificationSentAt?.getTime() || 0);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return reply.status(400).send({
          error: {
            message: 'Verification token expired. Please request a new one.',
            code: 'EXPIRED_TOKEN',
          },
        });
      }

      // Mark email as verified
      const verifiedUser = await fastify.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationSentAt: null,
        },
      });

      // Generate JWT token
      const jwtToken = signToken({
        userId: verifiedUser.id,
        businessId: verifiedUser.businessId,
        role: verifiedUser.role,
      });

      // Set cookie
      reply.setCookie(config.cookieName, jwtToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        user: {
          id: verifiedUser.id,
          businessId: verifiedUser.businessId,
          email: verifiedUser.email,
          name: verifiedUser.name,
          role: verifiedUser.role,
        },
        business: {
          id: user.business.id,
          name: user.business.name,
          timezone: user.business.timezone,
          identifierLabel: user.business.identifierLabel,
          defaultRebookIntervalDays: user.business.defaultRebookIntervalDays,
          defaultChannel: user.business.defaultChannel,
          setupCompleted: user.business.setupCompleted,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: {
          message: 'Failed to verify email',
          code: 'VERIFICATION_ERROR',
        },
      });
    }
  });

  // Resend verification email endpoint
  fastify.post<{ Body: { email: string } }>('/resend-verification', async (request, reply) => {
    try {
      const { email } = request.body;

      if (!email) {
        return reply.status(400).send({
          error: {
            message: 'Email required',
            code: 'MISSING_EMAIL',
          },
        });
      }

      const user = await fastify.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists
        return reply.status(200).send({
          message: 'If an account exists with this email, a verification link has been sent.',
        });
      }

      if (user.emailVerified) {
        return reply.status(400).send({
          error: {
            message: 'Email already verified',
            code: 'ALREADY_VERIFIED',
          },
        });
      }

      // Generate new verification token
      const newToken = generateVerificationToken();
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: newToken,
          emailVerificationSentAt: new Date(),
        },
      });

      // In production, send actual email here
      console.log(`📧 Verification token for ${email}: ${newToken}`);

      return reply.status(200).send({
        message: 'Verification email sent. Check your inbox.',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: {
          message: 'Failed to resend verification email',
          code: 'RESEND_ERROR',
        },
      });
    }
  });
};

export default authRoutes;
