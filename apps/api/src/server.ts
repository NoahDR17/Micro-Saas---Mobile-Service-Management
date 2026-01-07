import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import authPlugin from './plugins/auth.js';
import prismaPlugin from './plugins/prisma.js';
import authRoutes from './routes/auth.js';
import clientsRoutes from './routes/clients.js';
import usersRoutes from './routes/users.js';

export async function createServer() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins
  await fastify.register(corsPlugin);
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);

  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(clientsRoutes, { prefix: '/clients' });
  await fastify.register(usersRoutes, { prefix: '/users' });

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.status(error.statusCode || 500).send({
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
      },
    });
  });

  return fastify;
}
