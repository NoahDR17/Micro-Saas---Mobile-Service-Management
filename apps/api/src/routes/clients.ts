import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { CreateClientRequest, UpdateClientRequest, ClientsQuery } from '@msm/shared';

const createClientSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  identifierValue: z.string().optional(),
  notes: z.string().optional(),
  doNotContact: z.boolean().optional(),
}).refine((data) => data.phone || data.email, {
  message: 'Either phone or email must be provided',
});

const updateClientSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  identifierValue: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  doNotContact: z.boolean().optional(),
});

const clientsRoutes: FastifyPluginAsync = async (fastify) => {
  // All routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // List clients
  fastify.get<{ Querystring: ClientsQuery }>('/', async (request, reply) => {
    const { search = '', archived = 'false' } = request.query;
    const businessId = request.businessId!;
    const isArchived = archived === 'true';

    const where: any = {
      businessId,
      archivedAt: isArchived ? { not: null } : null,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clients = await fastify.prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return clients;
  });

  // Create client
  fastify.post<{ Body: CreateClientRequest }>('/', async (request, reply) => {
    try {
      const body = createClientSchema.parse(request.body);
      const businessId = request.businessId!;

      const client = await fastify.prisma.client.create({
        data: {
          businessId,
          fullName: body.fullName,
          phone: body.phone || null,
          email: body.email || null,
          address: body.address || null,
          identifierValue: body.identifierValue || null,
          notes: body.notes || null,
          doNotContact: body.doNotContact || false,
        },
      });

      return reply.status(201).send(client);
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

  // Get client by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const businessId = request.businessId!;

    const client = await fastify.prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!client) {
      return reply.status(404).send({
        error: {
          message: 'Client not found',
          code: 'CLIENT_NOT_FOUND',
        },
      });
    }

    return client;
  });

  // Update client
  fastify.patch<{ Params: { id: string }; Body: UpdateClientRequest }>(
    '/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const body = updateClientSchema.parse(request.body);
        const businessId = request.businessId!;

        // Check if client exists and belongs to business
        const existingClient = await fastify.prisma.client.findFirst({
          where: {
            id,
            businessId,
          },
        });

        if (!existingClient) {
          return reply.status(404).send({
            error: {
              message: 'Client not found',
              code: 'CLIENT_NOT_FOUND',
            },
          });
        }

        const client = await fastify.prisma.client.update({
          where: { id },
          data: {
            ...(body.fullName !== undefined && { fullName: body.fullName }),
            ...(body.phone !== undefined && { phone: body.phone }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.address !== undefined && { address: body.address }),
            ...(body.identifierValue !== undefined && { identifierValue: body.identifierValue }),
            ...(body.notes !== undefined && { notes: body.notes }),
            ...(body.doNotContact !== undefined && { doNotContact: body.doNotContact }),
          },
        });

        return client;
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
    }
  );

  // Archive client
  fastify.post<{ Params: { id: string } }>('/:id/archive', async (request, reply) => {
    const { id } = request.params;
    const businessId = request.businessId!;

    // Check if client exists and belongs to business
    const existingClient = await fastify.prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!existingClient) {
      return reply.status(404).send({
        error: {
          message: 'Client not found',
          code: 'CLIENT_NOT_FOUND',
        },
      });
    }

    const client = await fastify.prisma.client.update({
      where: { id },
      data: {
        archivedAt: new Date(),
      },
    });

    return client;
  });

  // Unarchive client
  fastify.post<{ Params: { id: string } }>('/:id/unarchive', async (request, reply) => {
    const { id } = request.params;
    const businessId = request.businessId!;

    // Check if client exists and belongs to business
    const existingClient = await fastify.prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!existingClient) {
      return reply.status(404).send({
        error: {
          message: 'Client not found',
          code: 'CLIENT_NOT_FOUND',
        },
      });
    }

    const client = await fastify.prisma.client.update({
      where: { id },
      data: {
        archivedAt: null,
      },
    });

    return client;
  });

  // Delete client
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const businessId = request.businessId!;

    // Check if client exists and belongs to business
    const existingClient = await fastify.prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!existingClient) {
      return reply.status(404).send({
        error: {
          message: 'Client not found',
          code: 'CLIENT_NOT_FOUND',
        },
      });
    }

    // Check if client has any bookings
    const bookingCount = await fastify.prisma.booking.count({
      where: { clientId: id },
    });

    if (bookingCount > 0) {
      return reply.status(400).send({
        error: {
          message: 'Cannot delete client with existing bookings. Archive instead.',
          code: 'CLIENT_HAS_BOOKINGS',
        },
      });
    }

    await fastify.prisma.client.delete({
      where: { id },
    });

    return reply.status(204).send();
  });
};

export default clientsRoutes;
