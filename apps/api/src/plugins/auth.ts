import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import { config } from '../config.js';
import { verifyToken, JwtPayload } from '../utils/jwt.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      businessId: string;
      email: string;
      name: string;
    };
    businessId?: string;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cookie);

  // Auth middleware decorator
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.cookies[config.cookieName];

      if (!token) {
        return reply.status(401).send({
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        });
      }

      const payload: JwtPayload = verifyToken(token);

      // Load user from database
      const user = await fastify.prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          businessId: true,
          email: true,
          name: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        });
      }

      request.user = user;
      request.businessId = user.businessId;
    } catch (error) {
      return reply.status(401).send({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }
  });
};

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin);
