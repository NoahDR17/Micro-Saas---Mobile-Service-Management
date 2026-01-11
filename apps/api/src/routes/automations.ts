import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { 
  CreateAutomationRuleRequest, 
  UpdateAutomationRuleRequest,
  TriggerType
} from '@msm/shared';

const TriggerTypeSchema = z.enum([
  'BOOKING_CREATED',
  'HOURS_BEFORE_BOOKING',
  'JOB_COMPLETED',
  'DAYS_SINCE_LAST_BOOKING'
]);

const CreateAutomationRuleSchema = z.object({
  name: z.string().min(1).max(255),
  triggerType: TriggerTypeSchema,
  templateId: z.string(),
  enabled: z.boolean().optional().default(true),
  hoursOrDays: z.number().int().positive().optional(),
}).refine((data) => {
  // HOURS_BEFORE_BOOKING and DAYS_SINCE_LAST_BOOKING require hoursOrDays
  if (
    (data.triggerType === 'HOURS_BEFORE_BOOKING' || 
     data.triggerType === 'DAYS_SINCE_LAST_BOOKING') &&
    !data.hoursOrDays
  ) {
    return false;
  }
  return true;
}, {
  message: 'hoursOrDays is required for HOURS_BEFORE_BOOKING and DAYS_SINCE_LAST_BOOKING triggers',
  path: ['hoursOrDays']
});

const UpdateAutomationRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  triggerType: TriggerTypeSchema.optional(),
  templateId: z.string().optional(),
  enabled: z.boolean().optional(),
  hoursOrDays: z.number().int().positive().nullable().optional(),
});

const automationRoutes = async (fastify: FastifyInstance) => {
  // Get all automation rules for the business
  fastify.get('/', async (request, reply) => {
    const businessId = request.user.businessId;

    const rules = await fastify.prisma.automationRule.findMany({
      where: { businessId },
      include: {
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(rules);
  });

  // Get a single automation rule
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.user.businessId;

    const rule = await fastify.prisma.automationRule.findFirst({
      where: { id, businessId },
      include: {
        template: true,
      },
    });

    if (!rule) {
      return reply.status(404).send({ error: 'Automation rule not found' });
    }

    return reply.send(rule);
  });

  // Create a new automation rule
  fastify.post('/', async (request, reply) => {
    const businessId = request.user.businessId;
    const parsed = CreateAutomationRuleSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.format() });
    }

    const data: CreateAutomationRuleRequest = parsed.data;

    // Verify template exists and belongs to business
    const template = await fastify.prisma.messageTemplate.findFirst({
      where: {
        id: data.templateId,
        businessId,
      },
    });

    if (!template) {
      return reply.status(400).send({ error: 'Template not found or does not belong to your business' });
    }

    const rule = await fastify.prisma.automationRule.create({
      data: {
        businessId,
        name: data.name,
        triggerType: data.triggerType,
        templateId: data.templateId,
        enabled: data.enabled ?? true,
        hoursOrDays: data.hoursOrDays ?? null,
      },
      include: {
        template: true,
      },
    });

    return reply.status(201).send(rule);
  });

  // Update an automation rule
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.user.businessId;
    const parsed = UpdateAutomationRuleSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.format() });
    }

    const data: UpdateAutomationRuleRequest = parsed.data;

    // Check if rule exists and belongs to business
    const existing = await fastify.prisma.automationRule.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Automation rule not found' });
    }

    // If updating templateId, verify it exists and belongs to business
    if (data.templateId) {
      const template = await fastify.prisma.messageTemplate.findFirst({
        where: {
          id: data.templateId,
          businessId,
        },
      });

      if (!template) {
        return reply.status(400).send({ error: 'Template not found or does not belong to your business' });
      }
    }

    // Validate hoursOrDays requirement if triggerType is being updated
    const triggerType = data.triggerType || existing.triggerType;
    if (
      (triggerType === 'HOURS_BEFORE_BOOKING' || triggerType === 'DAYS_SINCE_LAST_BOOKING') &&
      data.hoursOrDays === null
    ) {
      return reply.status(400).send({ 
        error: 'hoursOrDays is required for HOURS_BEFORE_BOOKING and DAYS_SINCE_LAST_BOOKING triggers' 
      });
    }

    const rule = await fastify.prisma.automationRule.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.triggerType && { triggerType: data.triggerType }),
        ...(data.templateId && { templateId: data.templateId }),
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.hoursOrDays !== undefined && { hoursOrDays: data.hoursOrDays }),
      },
      include: {
        template: true,
      },
    });

    return reply.send(rule);
  });

  // Delete an automation rule
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const businessId = request.user.businessId;

    const rule = await fastify.prisma.automationRule.findFirst({
      where: { id, businessId },
    });

    if (!rule) {
      return reply.status(404).send({ error: 'Automation rule not found' });
    }

    await fastify.prisma.automationRule.delete({ where: { id } });
    return reply.status(204).send();
  });
};

export default automationRoutes;
