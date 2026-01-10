import { FastifyPluginAsync } from 'fastify';

interface DashboardStats {
  todayBookings: number;
  upcomingBookings: number;
  dueToRebookCount: number;
  automationActivityToday: number;
  weeklyIncomeEstimate: number;
}

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // Get dashboard summary stats
  fastify.get('/dashboard', async (request, reply) => {
    const businessId = request.businessId!;

    // Get today's bookings (status = BOOKED, scheduled today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await fastify.prisma.booking.count({
      where: {
        businessId,
        status: 'BOOKED',
        scheduledAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get upcoming bookings (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingBookings = await fastify.prisma.booking.count({
      where: {
        businessId,
        status: 'BOOKED',
        scheduledAt: {
          gte: tomorrow,
          lt: nextWeek,
        },
      },
    });

    // Get "due to rebook" count
    // Clients where days since last completed job > defaultRebookIntervalDays
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

    // Get all clients
    const clients = await fastify.prisma.client.findMany({
      where: { businessId, archivedAt: null, doNotContact: false },
      include: {
        bookings: {
          where: { status: 'COMPLETED' },
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();
    const dueToRebookCount = clients.filter((client) => {
      if (client.bookings.length === 0) {
        return false; // No completed bookings yet
      }
      const lastCompletedDate = client.bookings[0]!.scheduledAt;
      const daysSinceLastBooking = Math.floor(
        (now.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastBooking > business.defaultRebookIntervalDays;
    }).length;

    // Get automation activity (messages sent/queued today - for now just return 0 placeholder)
    // This will be populated once we build EPIC 7 (message logging)
    const automationActivityToday = 0;

    // Get weekly income estimate from all booked jobs this week
    const weeklyBookings = await fastify.prisma.booking.findMany({
      where: {
        businessId,
        status: 'BOOKED',
        scheduledAt: {
          gte: today,
          lt: nextWeek,
        },
      },
    });

    const weeklyIncomeEstimate = weeklyBookings.reduce((sum, booking) => {
      return sum + (booking.totalCents || 0);
    }, 0);

    return {
      todayBookings,
      upcomingBookings,
      dueToRebookCount,
      automationActivityToday,
      weeklyIncomeEstimate,
    } as DashboardStats;
  });

  // Get upcoming bookings with details (for dashboard display)
  fastify.get('/dashboard/bookings', async (request, reply) => {
    const businessId = request.businessId!;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bookings = await fastify.prisma.booking.findMany({
      where: {
        businessId,
        status: 'BOOKED',
        scheduledAt: {
          gte: today,
          lt: nextWeek,
        },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });

    return bookings;
  });

  // Get clients due to rebook
  fastify.get('/dashboard/due-to-rebook', async (request, reply) => {
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

    const clients = await fastify.prisma.client.findMany({
      where: { businessId, archivedAt: null, doNotContact: false },
      include: {
        bookings: {
          where: { status: 'COMPLETED' },
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();
    const dueToRebook = clients.filter((client) => {
      if (client.bookings.length === 0) {
        return false;
      }
      const lastCompletedDate = client.bookings[0]!.scheduledAt;
      const daysSinceLastBooking = Math.floor(
        (now.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastBooking > business.defaultRebookIntervalDays;
    });

    return dueToRebook;
  });
};

export default dashboardRoutes;
