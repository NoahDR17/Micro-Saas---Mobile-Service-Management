import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const listQuerySchema = z.object({
  status: z.enum(['QUEUED', 'SENT', 'FAILED', 'SKIPPED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const messageLogsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // List message logs
  fastify.get('/', async (request, reply) => {
    const parse = listQuerySchema.safeParse(request.query);
    if (!parse.success) {
      return reply.status(400).send({
        error: { message: 'Invalid query', code: 'VALIDATION_ERROR', details: parse.error.errors },
      });
    }

    const { status, from, to } = parse.data;
    const businessId = request.businessId!;

    const where: any = { businessId };
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const logs = await fastify.prisma.messageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100
    });

    return logs;
  });

  // Get single message log
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;

    const log = await fastify.prisma.messageLog.findFirst({
      where: { id, businessId },
    });

    if (!log) {
      return reply.status(404).send({
        error: { message: 'Message log not found', code: 'LOG_NOT_FOUND' },
      });
    }

    return log;
  });
};

export default messageLogsRoutes;
