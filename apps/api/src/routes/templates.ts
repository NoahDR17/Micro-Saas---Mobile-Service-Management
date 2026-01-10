import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createTemplateSchema = z.object({
  type: z.enum(['CONFIRMATION', 'REMINDER', 'REVIEW', 'REBOOK']),
  subject: z.string().optional(),
  body: z.string().min(1),
  channel: z.enum(['EMAIL', 'SMS']),
  enabled: z.boolean().optional(),
});

const updateTemplateSchema = z.object({
  subject: z.string().nullable().optional(),
  body: z.string().min(1).optional(),
  channel: z.enum(['EMAIL', 'SMS']).optional(),
  enabled: z.boolean().optional(),
});

const templatesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // List all templates
  fastify.get('/', async (request, reply) => {
    const businessId = request.businessId!;
    
    const templates = await fastify.prisma.messageTemplate.findMany({
      where: { businessId },
      orderBy: [{ type: 'asc' }, { channel: 'asc' }],
    });

    return templates;
  });

  // Get single template
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;

    const template = await fastify.prisma.messageTemplate.findFirst({
      where: { id, businessId },
    });

    if (!template) {
      return reply.status(404).send({
        error: { message: 'Template not found', code: 'TEMPLATE_NOT_FOUND' },
      });
    }

    return template;
  });

  // Create template
  fastify.post('/', async (request, reply) => {
    const parse = createTemplateSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors },
      });
    }

    const body = parse.data;
    const businessId = request.businessId!;

    // Check if template already exists for this type/channel combination
    const existing = await fastify.prisma.messageTemplate.findFirst({
      where: {
        businessId,
        type: body.type,
        channel: body.channel,
      },
    });

    if (existing) {
      return reply.status(400).send({
        error: {
          message: `Template for ${body.type} via ${body.channel} already exists`,
          code: 'TEMPLATE_EXISTS',
        },
      });
    }

    const template = await fastify.prisma.messageTemplate.create({
      data: {
        businessId,
        type: body.type,
        subject: body.subject || null,
        body: body.body,
        channel: body.channel,
        enabled: body.enabled ?? true,
      },
    });

    return reply.status(201).send(template);
  });

  // Update template
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = updateTemplateSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { message: 'Validation error', code: 'VALIDATION_ERROR', details: parse.error.errors },
      });
    }

    const body = parse.data;
    const businessId = request.businessId!;

    const existing = await fastify.prisma.messageTemplate.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return reply.status(404).send({
        error: { message: 'Template not found', code: 'TEMPLATE_NOT_FOUND' },
      });
    }

    const template = await fastify.prisma.messageTemplate.update({
      where: { id },
      data: {
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.body !== undefined && { body: body.body }),
        ...(body.channel !== undefined && { channel: body.channel }),
        ...(body.enabled !== undefined && { enabled: body.enabled }),
      },
    });

    return template;
  });

  // Delete template
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;

    const existing = await fastify.prisma.messageTemplate.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return reply.status(404).send({
        error: { message: 'Template not found', code: 'TEMPLATE_NOT_FOUND' },
      });
    }

    await fastify.prisma.messageTemplate.delete({
      where: { id },
    });

    return { success: true };
  });

  // Test/preview template with variable substitution
  fastify.post('/:id/preview', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.businessId!;
    const { variables } = request.body as { variables?: Record<string, string> };

    const template = await fastify.prisma.messageTemplate.findFirst({
      where: { id, businessId },
    });

    if (!template) {
      return reply.status(404).send({
        error: { message: 'Template not found', code: 'TEMPLATE_NOT_FOUND' },
      });
    }

    // Simple variable substitution
    const substituteVariables = (text: string, vars: Record<string, string> = {}) => {
      return text.replace(/\{(\w+)\}/g, (match, key) => {
        return vars[key] || match;
      });
    };

    const previewBody = substituteVariables(template.body, variables || {});
    const previewSubject = template.subject ? substituteVariables(template.subject, variables || {}) : null;

    return {
      subject: previewSubject,
      body: previewBody,
    };
  });
};

export default templatesRoutes;
