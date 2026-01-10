import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().min(0).default(0),
  durationMinutes: z.number().int().min(1).default(60),
  active: z.boolean().optional(),
});

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(1).optional(),
  active: z.boolean().optional(),
});

const listQuerySchema = z.object({
  search: z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
});

const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // List services
  fastify.get('/', async (request, reply) => {
    const parse = listQuerySchema.safeParse(request.query);
    if (!parse.success) {
      return reply.status(400).send({
        error: { message: 'Invalid query', code: 'VALIDATION_ERROR', details: parse.error.errors },
      });
    }
    const { search = '', active } = parse.data;
    const businessId = request.businessId!;

    const where: any = { businessId };
    if (active) where.active = active === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const services = await fastify.prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return services;
  });

  // Create service
  fastify.post('/', async (request, reply) => {
    const parse = createServiceSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors },
      });
    }
    const body = parse.data;
    const businessId = request.businessId!;

    const created = await fastify.prisma.service.create({
      data: {
        businessId,
        name: body.name,
        description: body.description ?? null,
        priceCents: body.priceCents ?? 0,
        durationMinutes: body.durationMinutes ?? 60,
        active: body.active ?? true,
      },
    });
    return reply.status(201).send(created);
  });

  // Get service
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;
    const service = await fastify.prisma.service.findFirst({ where: { id, businessId } });
    if (!service) {
      return reply.status(404).send({ error: { message: 'Service not found', code: 'SERVICE_NOT_FOUND' } });
    }
    return service;
  });

  // Update service
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = updateServiceSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors },
      });
    }
    const body = parse.data;
    const businessId = request.businessId!;

    const existing = await fastify.prisma.service.findFirst({ where: { id, businessId } });
    if (!existing) {
      return reply.status(404).send({ error: { message: 'Service not found', code: 'SERVICE_NOT_FOUND' } });
    }

    const updated = await fastify.prisma.service.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.priceCents !== undefined && { priceCents: body.priceCents }),
        ...(body.durationMinutes !== undefined && { durationMinutes: body.durationMinutes }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });
    return updated;
  });

  // Delete service
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;

    const existing = await fastify.prisma.service.findFirst({ where: { id, businessId } });
    if (!existing) {
      return reply.status(404).send({ error: { message: 'Service not found', code: 'SERVICE_NOT_FOUND' } });
    }

    // Check if service is used in any bookings
    const bookingCount = await fastify.prisma.booking.count({ where: { serviceId: id } });
    if (bookingCount > 0) {
      return reply.status(400).send({
        error: {
          message: 'Cannot delete service with existing bookings. Set to inactive instead.',
          code: 'SERVICE_HAS_BOOKINGS',
        },
      });
    }

    await fastify.prisma.service.delete({ where: { id } });
    return reply.status(204).send();
  });
};

export default servicesRoutes;
