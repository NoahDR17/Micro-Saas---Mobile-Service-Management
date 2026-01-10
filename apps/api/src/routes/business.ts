import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { UpdateBusinessRequest } from '@msm/shared';

const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
  identifierLabel: z.string().nullable().optional(),
  defaultRebookIntervalDays: z.number().int().min(1).max(365).optional(),
  defaultChannel: z.enum(['EMAIL', 'SMS']).optional(),
  setupCompleted: z.boolean().optional(),
});

const businessRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // Get current business
  fastify.get('/me', async (request, reply) => {
    const businessId = request.businessId!;

    const business = await fastify.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return reply.status(404).send({
        error: {
          message: 'Business not found',
          code: 'BUSINESS_NOT_FOUND',
        },
      });
    }

    return business;
  });

  // Update business settings
  fastify.patch<{ Body: UpdateBusinessRequest }>('/me', async (request, reply) => {
    try {
      const body = updateBusinessSchema.parse(request.body);
      const businessId = request.businessId!;

      const updated = await fastify.prisma.business.update({
        where: { id: businessId },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.timezone !== undefined && { timezone: body.timezone }),
          ...(body.identifierLabel !== undefined && { identifierLabel: body.identifierLabel }),
          ...(body.defaultRebookIntervalDays !== undefined && {
            defaultRebookIntervalDays: body.defaultRebookIntervalDays,
          }),
          ...(body.defaultChannel !== undefined && { defaultChannel: body.defaultChannel }),
          ...(body.setupCompleted !== undefined && { setupCompleted: body.setupCompleted }),
        },
      });

      return updated;
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
};

export default businessRoutes;
