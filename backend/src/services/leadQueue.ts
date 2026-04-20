import PQueue from 'p-queue';
import { prisma } from '../lib/prisma';
import { generateLeadReply } from '../ai';
import { notifyBusinessNewLead } from '../notifications/notifier';
import { leadMatcher } from '../matching';

// TODO: Replace with Redis/BullMQ for production
const queue = new PQueue({ concurrency: 2 });

export function enqueueLeadProcessing(leadId: string): void {
  queue.add(async () => {
    await processLead(leadId);
  }).catch((err) => {
    console.error(`[Queue] Fel vid bearbetning av lead ${leadId}:`, err);
  });
}

async function processLead(leadId: string): Promise<void> {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { category: true },
    });
    if (!lead) return;

    // Generate AI reply
    const aiResponse = await generateLeadReply({
      name: lead.name,
      description: lead.description,
      city: lead.city,
      postalCode: lead.postalCode,
      categorySlug: lead.category?.slug,
    });

    // Find or update category
    let categoryId = lead.categoryId;
    if (aiResponse.categorySlug && aiResponse.categorySlug !== lead.category?.slug) {
      const cat = await prisma.category.findUnique({ where: { slug: aiResponse.categorySlug } });
      if (cat) categoryId = cat.id;
    }

    // Update lead with category and price estimate
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        categoryId,
        priceEstimateMin: aiResponse.priceMin || undefined,
        priceEstimateMax: aiResponse.priceMax || undefined,
      },
    });

    // Save AI message
    await prisma.message.create({
      data: {
        leadId,
        sender: 'AI',
        content: aiResponse.replySv,
        deliveryChannel: 'EMAIL',
      },
    });

    // Match to business and notify
    const matches = await leadMatcher.match(leadId, aiResponse.categorySlug, lead.postalCode);
    for (const match of matches) {
      const business = await prisma.business.findUnique({ where: { id: match.businessId } });
      if (!business) continue;

      // Assign lead to business
      await prisma.lead.update({
        where: { id: leadId },
        data: { businessId: match.businessId },
      });

      // Create distribution record
      await prisma.leadDistribution.upsert({
        where: { leadId_businessId: { leadId, businessId: match.businessId } },
        update: {},
        create: { leadId, businessId: match.businessId },
      });

      // Notify business
      const category = categoryId
        ? (await prisma.category.findUnique({ where: { id: categoryId } }))?.nameSv || 'Ovrigt'
        : 'Ovrigt';

      if (business.notificationEmail) {
        await notifyBusinessNewLead({
          businessEmail: business.notificationEmail,
          businessPhone: business.notificationPhone,
          leadName: lead.name,
          leadCity: lead.city,
          leadCategory: category,
          leadId,
        });
      }

      // Audit log
      await prisma.auditLog.create({
        data: {
          actorType: 'SYSTEM',
          action: 'LEAD_PROCESSED',
          metadata: { leadId },
        },
      });
    }
  } catch (err) {
    console.error(`[Queue] processLead error for ${leadId}:`, err);
  }
}
