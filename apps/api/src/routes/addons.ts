import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createAddOnSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().min(0).default(0),
  active: z.boolean().optional(),
});

const updateAddOnSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

const listQuerySchema = z.object({
  search: z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
});

const addOnsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // List add-ons
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

    const addOns = await fastify.prisma.addOn.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return addOns;
  });

  // Create add-on
  fastify.post('/', async (request, reply) => {
    const parse = createAddOnSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors },
      });
    }
    const body = parse.data;
    const businessId = request.businessId!;

    const created = await fastify.prisma.addOn.create({
      data: {
        businessId,
        name: body.name,
        description: body.description ?? null,
        priceCents: body.priceCents ?? 0,
        active: body.active ?? true,
      },
    });
    return reply.status(201).send(created);
  });

  // Get add-on
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;
    const addOn = await fastify.prisma.addOn.findFirst({ where: { id, businessId } });
    if (!addOn) {
      return reply.status(404).send({ error: { message: 'Add-on not found', code: 'ADDON_NOT_FOUND' } });
    }
    return addOn;
  });

  // Update add-on
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = updateAddOnSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors },
      });
    }
    const body = parse.data;
    const businessId = request.businessId!;

    const existing = await fastify.prisma.addOn.findFirst({ where: { id, businessId } });
    if (!existing) {
      return reply.status(404).send({ error: { message: 'Add-on not found', code: 'ADDON_NOT_FOUND' } });
    }

    const updated = await fastify.prisma.addOn.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.priceCents !== undefined && { priceCents: body.priceCents }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });
    return updated;
  });
};

export default addOnsRoutes;
