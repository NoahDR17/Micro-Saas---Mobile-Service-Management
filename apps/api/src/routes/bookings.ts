import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createBookingSchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1).optional(),
  addOnIds: z.array(z.string().min(1)).optional(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

const updateBookingSchema = z.object({
  clientId: z.string().min(1).optional(),
  serviceId: z.string().min(1).nullable().optional(),
  addOnIds: z.array(z.string().min(1)).optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().nullable().optional(),
});

const statusSchema = z.object({ status: z.enum(['BOOKED', 'COMPLETED', 'CANCELLED']) });

const listQuerySchema = z.object({
  status: z.enum(['BOOKED', 'COMPLETED', 'CANCELLED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const bookingsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // Helper function to calculate total cost
  const calculateTotalCents = async (
    serviceId: string | null | undefined,
    addOnIds: string[],
    businessId: string
  ): Promise<number> => {
    let total = 0;

    // Add service price
    if (serviceId) {
      const service = await fastify.prisma.service.findFirst({
        where: { id: serviceId, businessId },
      });
      if (service) {
        total += service.priceCents;
      }
    }

    // Add add-on prices
    if (addOnIds.length > 0) {
      const addOns = await fastify.prisma.addOn.findMany({
        where: { id: { in: addOnIds }, businessId },
      });
      total += addOns.reduce((sum, addOn) => sum + addOn.priceCents, 0);
    }

    return total;
  };

  // List bookings
  fastify.get('/', async (request, reply) => {
    const parse = listQuerySchema.safeParse(request.query);
    if (!parse.success) {
      return reply.status(400).send({ error: { message: 'Invalid query', code: 'VALIDATION_ERROR', details: parse.error.errors } });
    }
    const { status, from, to } = parse.data;
    const businessId = request.businessId!;

    const where: any = { businessId };
    if (status) where.status = status;
    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt.gte = new Date(from);
      if (to) where.scheduledAt.lte = new Date(to);
    }

    const bookings = await fastify.prisma.booking.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        client: true,
        service: true,
        addOns: { include: { addOn: true } },
      },
    });
    return bookings.map((b) => ({
      ...b,
      addOns: b.addOns.map((ba) => ba.addOn),
    }));
  });

  // Create booking
  fastify.post('/', async (request, reply) => {
    const parse = createBookingSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors } });
    }
    const body = parse.data;
    const businessId = request.businessId!;

    // Ensure client belongs to business
    const client = await fastify.prisma.client.findFirst({ where: { id: body.clientId, businessId } });
    if (!client) return reply.status(400).send({ error: { message: 'Invalid client', code: 'INVALID_CLIENT' } });

    // Optional service check
    if (body.serviceId) {
      const service = await fastify.prisma.service.findFirst({ where: { id: body.serviceId, businessId } });
      if (!service) return reply.status(400).send({ error: { message: 'Invalid service', code: 'INVALID_SERVICE' } });
    }

    // Optional add-ons validation
    const addOnIds = body.addOnIds ?? [];
    if (addOnIds.length) {
      const count = await fastify.prisma.addOn.count({ where: { id: { in: addOnIds }, businessId } });
      if (count !== addOnIds.length) {
        return reply.status(400).send({ error: { message: 'Invalid add-ons provided', code: 'INVALID_ADDONS' } });
      }
    }

    // Calculate total cost
    const totalCents = await calculateTotalCents(body.serviceId, addOnIds, businessId);

    const created = await fastify.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          businessId,
          clientId: body.clientId,
          serviceId: body.serviceId ?? null,
          scheduledAt: new Date(body.scheduledAt),
          notes: body.notes ?? null,
          totalCents,
        },
      });

      if (addOnIds.length) {
        await tx.bookingAddOn.createMany({
          data: addOnIds.map((addOnId) => ({ bookingId: booking.id, addOnId })),
          skipDuplicates: true,
        });
      }

      return booking;
    });

    const withRels = await fastify.prisma.booking.findUnique({
      where: { id: created.id },
      include: { client: true, service: true, addOns: { include: { addOn: true } } },
    });
    return reply.status(201).send({
      ...withRels!,
      addOns: (withRels?.addOns ?? []).map((ba) => ba.addOn),
    });
  });

  // Get booking
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;
    const booking = await fastify.prisma.booking.findFirst({
      where: { id, businessId },
      include: { client: true, service: true, addOns: { include: { addOn: true } } },
    });
    if (!booking) return reply.status(404).send({ error: { message: 'Booking not found', code: 'BOOKING_NOT_FOUND' } });
    return { ...booking, addOns: booking.addOns.map((ba) => ba.addOn) };
  });

  // Update booking
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = updateBookingSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors } });
    }
    const body = parse.data;
    const businessId = request.businessId!;

    const existing = await fastify.prisma.booking.findFirst({ where: { id, businessId } });
    if (!existing) return reply.status(404).send({ error: { message: 'Booking not found', code: 'BOOKING_NOT_FOUND' } });

    if (body.clientId) {
      const ok = await fastify.prisma.client.findFirst({ where: { id: body.clientId, businessId } });
      if (!ok) return reply.status(400).send({ error: { message: 'Invalid client', code: 'INVALID_CLIENT' } });
    }
    if (body.serviceId !== undefined && body.serviceId !== null) {
      const ok = await fastify.prisma.service.findFirst({ where: { id: body.serviceId, businessId } });
      if (!ok) return reply.status(400).send({ error: { message: 'Invalid service', code: 'INVALID_SERVICE' } });
    }
    if (body.addOnIds) {
      const count = await fastify.prisma.addOn.count({ where: { id: { in: body.addOnIds }, businessId } });
      if (count !== body.addOnIds.length) {
        return reply.status(400).send({ error: { message: 'Invalid add-ons provided', code: 'INVALID_ADDONS' } });
      }
    }

    // Recalculate total if service or add-ons changed
    let totalCents: number | undefined;
    if (body.serviceId !== undefined || body.addOnIds !== undefined) {
      const finalServiceId = body.serviceId !== undefined ? body.serviceId : existing.serviceId;
      let finalAddOnIds: string[] = [];
      
      if (body.addOnIds !== undefined) {
        finalAddOnIds = body.addOnIds;
      } else {
        // Keep existing add-ons
        const existingAddOns = await fastify.prisma.bookingAddOn.findMany({
          where: { bookingId: id },
        });
        finalAddOnIds = existingAddOns.map((ba) => ba.addOnId);
      }
      
      totalCents = await calculateTotalCents(finalServiceId, finalAddOnIds, businessId);
    }

    const updated = await fastify.prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          ...(body.clientId !== undefined && { clientId: body.clientId }),
          ...(body.serviceId !== undefined && { serviceId: body.serviceId }),
          ...(body.scheduledAt !== undefined && { scheduledAt: new Date(body.scheduledAt) }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(totalCents !== undefined && { totalCents }),
        },
      });

      if (body.addOnIds) {
        // Replace add-ons set
        await tx.bookingAddOn.deleteMany({ where: { bookingId: id } });
        if (body.addOnIds.length) {
          await tx.bookingAddOn.createMany({
            data: body.addOnIds.map((addOnId) => ({ bookingId: id, addOnId })),
            skipDuplicates: true,
          });
        }
      }

      return b;
    });

    const withRels = await fastify.prisma.booking.findUnique({
      where: { id: updated.id },
      include: { client: true, service: true, addOns: { include: { addOn: true } } },
    });
    return { ...withRels!, addOns: (withRels?.addOns ?? []).map((ba) => ba.addOn) };
  });

  // Status changes
  fastify.post('/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = statusSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors } });
    }
    const { status } = parse.data;
    const businessId = request.businessId!;

    const existing = await fastify.prisma.booking.findFirst({ where: { id, businessId } });
    if (!existing) return reply.status(404).send({ error: { message: 'Booking not found', code: 'BOOKING_NOT_FOUND' } });

    const updated = await fastify.prisma.booking.update({ where: { id }, data: { status } });
    return updated;
  });

  // Delete booking
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;

    const existing = await fastify.prisma.booking.findFirst({ where: { id, businessId } });
    if (!existing) {
      return reply.status(404).send({ error: { message: 'Booking not found', code: 'BOOKING_NOT_FOUND' } });
    }

    // Delete booking add-ons first (due to foreign key constraint)
    await fastify.prisma.bookingAddOn.deleteMany({ where: { bookingId: id } });

    // Delete booking
    await fastify.prisma.booking.delete({ where: { id } });

    return reply.status(204).send();
  });
};

export default bookingsRoutes;
