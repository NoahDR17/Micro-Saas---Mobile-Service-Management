import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Template variable substitution
function substituteVariables(template: string, data: Record<string, string>): string {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return result;
}

// Format date in a human-readable way
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function evaluateAutomations() {
  console.log('🔍 Starting automation evaluation...');
  
  // Get all enabled automation rules with their templates
  const rules = await prisma.automationRule.findMany({
    where: { enabled: true },
    include: {
      template: true,
      business: true,
    },
  });

  console.log(`Found ${rules.length} active automation rules`);

  for (const rule of rules) {
    try {
      await processRule(rule);
    } catch (error) {
      console.error(`Error processing rule ${rule.id}:`, error);
    }
  }

  console.log('✅ Automation evaluation complete');
}

async function processRule(rule: any) {
  const businessId = rule.businessId;
  const template = rule.template;

  if (!template) {
    console.warn(`Rule ${rule.id}: No template found`);
    return;
  }

  switch (rule.triggerType) {
    case 'BOOKING_CREATED':
      await handleBookingCreated(rule, businessId, template);
      break;
    case 'HOURS_BEFORE_BOOKING':
      await handleHoursBeforeBooking(rule, businessId, template);
      break;
    case 'JOB_COMPLETED':
      await handleJobCompleted(rule, businessId, template);
      break;
    case 'DAYS_SINCE_LAST_BOOKING':
      await handleDaysSinceLastBooking(rule, businessId, template);
      break;
  }
}

// BOOKING_CREATED: Send message immediately when booking is created
async function handleBookingCreated(rule: any, businessId: string, template: any) {
  // Find bookings created in the last 5 minutes that haven't received this automation message yet
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      createdAt: { gte: fiveMinutesAgo },
    },
    include: { client: true },
  });

  for (const booking of bookings) {
    // Check if we've already sent this message for this booking
    const existing = await prisma.messageLog.findFirst({
      where: {
        bookingId: booking.id,
        templateType: template.type,
      },
    });

    if (existing) continue;

    // Check if client has opted out
    if (booking.client.doNotContact) continue;

    const recipient = template.channel === 'SMS' ? booking.client.phone : booking.client.email;
    if (!recipient) continue;

    const vars = {
      client_name: booking.client.fullName,
      booking_date: formatDate(booking.scheduledAt),
      booking_time: formatTime(booking.scheduledAt),
    };

    const body = substituteVariables(template.body, vars);
    const subject = template.subject ? substituteVariables(template.subject, vars) : null;

    await prisma.messageLog.create({
      data: {
        businessId,
        clientId: booking.client.id,
        bookingId: booking.id,
        templateType: template.type,
        channel: template.channel,
        recipient,
        subject,
        body,
        status: 'QUEUED',
      },
    });

    console.log(`📧 Queued BOOKING_CREATED message for ${booking.client.fullName}`);
  }
}

// HOURS_BEFORE_BOOKING: Send message X hours before the booking
async function handleHoursBeforeBooking(rule: any, businessId: string, template: any) {
  const hoursBeforeBooking = rule.hoursOrDays;
  
  // Find bookings that are exactly hoursBeforeBooking away (with 1-hour window)
  const now = new Date();
  const bookingTimeMin = new Date(now.getTime() + hoursBeforeBooking * 60 * 60 * 1000 - 30 * 60 * 1000);
  const bookingTimeMax = new Date(now.getTime() + hoursBeforeBooking * 60 * 60 * 1000 + 30 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: 'BOOKED',
      scheduledAt: {
        gte: bookingTimeMin,
        lte: bookingTimeMax,
      },
    },
    include: { client: true },
  });

  for (const booking of bookings) {
    // Check if we've already sent this message for this booking
    const existing = await prisma.messageLog.findFirst({
      where: {
        bookingId: booking.id,
        templateType: template.type,
      },
    });

    if (existing) continue;

    // Check if client has opted out
    if (booking.client.doNotContact) continue;

    const recipient = template.channel === 'SMS' ? booking.client.phone : booking.client.email;
    if (!recipient) continue;

    const vars = {
      client_name: booking.client.fullName,
      booking_date: formatDate(booking.scheduledAt),
      booking_time: formatTime(booking.scheduledAt),
      hours_until: hoursBeforeBooking.toString(),
    };

    const body = substituteVariables(template.body, vars);
    const subject = template.subject ? substituteVariables(template.subject, vars) : null;

    await prisma.messageLog.create({
      data: {
        businessId,
        clientId: booking.client.id,
        bookingId: booking.id,
        templateType: template.type,
        channel: template.channel,
        recipient,
        subject,
        body,
        status: 'QUEUED',
      },
    });

    console.log(`⏰ Queued HOURS_BEFORE_BOOKING message for ${booking.client.fullName} (${hoursBeforeBooking}h before)`);
  }
}

// JOB_COMPLETED: Send message when booking is marked completed
async function handleJobCompleted(rule: any, businessId: string, template: any) {
  // Find bookings completed in the last 5 minutes that haven't received this automation message yet
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: 'COMPLETED',
      updatedAt: { gte: fiveMinutesAgo },
    },
    include: { client: true },
  });

  for (const booking of bookings) {
    // Check if we've already sent this message for this booking
    const existing = await prisma.messageLog.findFirst({
      where: {
        bookingId: booking.id,
        templateType: template.type,
      },
    });

    if (existing) continue;

    // Check if client has opted out
    if (booking.client.doNotContact) continue;

    const recipient = template.channel === 'SMS' ? booking.client.phone : booking.client.email;
    if (!recipient) continue;

    const vars = {
      client_name: booking.client.fullName,
      completion_date: formatDate(booking.updatedAt),
      completion_time: formatTime(booking.updatedAt),
    };

    const body = substituteVariables(template.body, vars);
    const subject = template.subject ? substituteVariables(template.subject, vars) : null;

    await prisma.messageLog.create({
      data: {
        businessId,
        clientId: booking.client.id,
        bookingId: booking.id,
        templateType: template.type,
        channel: template.channel,
        recipient,
        subject,
        body,
        status: 'QUEUED',
      },
    });

    console.log(`✨ Queued JOB_COMPLETED message for ${booking.client.fullName}`);
  }
}

// DAYS_SINCE_LAST_BOOKING: Send re-engagement message X days after last booking
async function handleDaysSinceLastBooking(rule: any, businessId: string, template: any) {
  const daysSinceBooking = rule.hoursOrDays;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysSinceBooking);

  // Find clients who haven't had a booking since the cutoff date
  const clients = await prisma.client.findMany({
    where: {
      businessId,
      doNotContact: false,
    },
  });

  for (const client of clients) {
    // Get the client's most recent booking
    const lastBooking = await prisma.booking.findFirst({
      where: { clientId: client.id },
      orderBy: { scheduledAt: 'desc' },
    });

    // Skip if no bookings or if last booking is recent
    if (!lastBooking || lastBooking.scheduledAt > cutoffDate) {
      continue;
    }

    // Check if we've already sent this message to this client recently
    const recentMessage = await prisma.messageLog.findFirst({
      where: {
        clientId: client.id,
        templateType: template.type,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Don't send more than once per day
      },
    });

    if (recentMessage) continue;

    const recipient = template.channel === 'SMS' ? client.phone : client.email;
    if (!recipient) continue;

    const vars = {
      client_name: client.fullName,
      days_since: daysSinceBooking.toString(),
      last_booking_date: formatDate(lastBooking.scheduledAt),
    };

    const body = substituteVariables(template.body, vars);
    const subject = template.subject ? substituteVariables(template.subject, vars) : null;

    await prisma.messageLog.create({
      data: {
        businessId,
        clientId: client.id,
        templateType: template.type,
        channel: template.channel,
        recipient,
        subject,
        body,
        status: 'QUEUED',
      },
    });

    console.log(`🔄 Queued DAYS_SINCE_LAST_BOOKING message for ${client.fullName} (${daysSinceBooking}d since booking)`);
  }
}

// Main execution
async function main() {
  console.log('🚀 Worker started');
  
  // Run immediately
  await evaluateAutomations();

  // Run every minute (for testing/demo purposes - in production would be 5 minutes)
  setInterval(() => {
    evaluateAutomations().catch(console.error);
  }, 60 * 1000);

  console.log('⏱️  Automation checker running every minute');
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  await prisma.$disconnect();
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📛 SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📛 SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

export {};
