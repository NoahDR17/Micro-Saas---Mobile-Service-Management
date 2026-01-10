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
          },
        });

        return { business, user };
      });

      // Generate JWT token
      const token = signToken({
        userId: result.user.id,
        businessId: result.business.id,
        role: result.user.role,
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
          id: result.user.id,
          businessId: result.user.businessId,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        business: {
          id: result.business.id,
          name: result.business.name,
          timezone: result.business.timezone,
          identifierLabel: result.business.identifierLabel,
          defaultRebookIntervalDays: result.business.defaultRebookIntervalDays,
          defaultChannel: result.business.defaultChannel,
          setupCompleted: result.business.setupCompleted,
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
};

export default authRoutes;
