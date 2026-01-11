import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import authPlugin from './plugins/auth.js';
import prismaPlugin from './plugins/prisma.js';
import authRoutes from './routes/auth.js';
import clientsRoutes from './routes/clients.js';
import usersRoutes from './routes/users.js';
import servicesRoutes from './routes/services.js';
import addOnsRoutes from './routes/addons.js';
import bookingsRoutes from './routes/bookings.js';
import businessRoutes from './routes/business.js';
import dashboardRoutes from './routes/dashboard.js';
import templatesRoutes from './routes/templates.js';
import messageLogsRoutes from './routes/messageLogs.js';
import automationRoutes from './routes/automations.js';

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
  await fastify.register(servicesRoutes, { prefix: '/services' });
  await fastify.register(addOnsRoutes, { prefix: '/addons' });
  await fastify.register(bookingsRoutes, { prefix: '/bookings' });
  await fastify.register(businessRoutes, { prefix: '/businesses' });
  await fastify.register(dashboardRoutes, { prefix: '' });
  await fastify.register(templatesRoutes, { prefix: '/templates' });
  await fastify.register(messageLogsRoutes, { prefix: '/message-logs' });
  await fastify.register(automationRoutes, { prefix: '/automations' });

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
