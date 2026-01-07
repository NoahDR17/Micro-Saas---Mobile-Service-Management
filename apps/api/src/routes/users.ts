import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { CreateUserRequest } from '@msm/shared';
import { hashPassword } from '../utils/password.js';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'USER']),
});

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // Admin-only guard
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.user?.role !== 'ADMIN') {
      return reply.status(403).send({
        error: {
          message: 'Forbidden',
          code: 'FORBIDDEN',
        },
      });
    }
  });

  fastify.post<{ Body: CreateUserRequest }>('/', async (request, reply) => {
    const body = createUserSchema.parse(request.body);

    // Prevent cross-business creation
    const businessId = request.businessId!;

    const existing = await fastify.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      return reply.status(400).send({
        error: {
          message: 'Email already registered',
          code: 'EMAIL_EXISTS',
        },
      });
    }

    const passwordHash = await hashPassword(body.password);

    const user = await fastify.prisma.user.create({
      data: {
        businessId,
        email: body.email,
        name: body.name,
        passwordHash,
        role: body.role,
      },
      select: {
        id: true,
        businessId: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return reply.status(201).send({ user });
  });
};

export default usersRoutes;
