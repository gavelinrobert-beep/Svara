import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { normalizeSwedishPhone, validatePostalCode, normalizePostalCode } from '../lib/validation';
import { enqueueLeadProcessing } from '../services/leadQueue';
import { generateLeadReply } from '../ai';
import { AuthRequest } from '../middleware/auth';

export async function createLead(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, phone, email, description, postalCode, city } = req.body;
  
  // Validate and normalize phone
  const phoneE164 = normalizeSwedishPhone(phone);
  if (!phoneE164) {
    res.status(400).json({ errors: [{ msg: 'Ogiltigt svenskt telefonnummer. Ange t.ex. 070-123 45 67.' }] });
    return;
  }

  // Validate postal code
  if (!validatePostalCode(postalCode)) {
    res.status(400).json({ errors: [{ msg: 'Ogiltigt postnummer. Ange 5 siffror, t.ex. 123 45.' }] });
    return;
  }

  // Handle images
  const files = req.files as Express.Multer.File[];
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3001';
  const imageUrls = files?.map((f) => `${baseUrl}/uploads/${f.filename}`) || [];

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        phoneE164,
        email,
        description,
        postalCode: normalizePostalCode(postalCode),
        city,
        consentAt: new Date(),
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
    });

    // Audit log (no PII beyond lead id)
    await prisma.auditLog.create({
      data: {
        actorType: 'CUSTOMER',
        action: 'LEAD_CREATED',
        metadata: { leadId: lead.id },
      },
    });

    // Enqueue AI processing
    enqueueLeadProcessing(lead.id);

    res.status(201).json({
      success: true,
      message: 'Tack! Din forfragan har tagits emot. Vi aterkommer inom kort.',
      id: lead.id,
    });
  } catch (err) {
    console.error('[Leads] createLead error:', err);
    res.status(500).json({ error: 'Serverfel. Forsok igen senare.' });
  }
}

export async function getLeads(req: AuthRequest, res: Response): Promise<void> {
  const { status, categoryId, page = '1', limit = '20' } = req.query as Record<string, string>;
  
  const where: Record<string, unknown> = {};
  if (req.businessId) where.businessId = req.businessId;
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          category: true,
          messages: {
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({ leads, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Leads] getLeads error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}

export async function getLeadById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        ...(req.businessId ? { businessId: req.businessId } : {}),
      },
      include: {
        category: true,
        messages: { orderBy: { sentAt: 'asc' } },
        images: true,
      },
    });

    if (!lead) {
      res.status(404).json({ error: 'Forfragan hittades inte.' });
      return;
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorType: 'BUSINESS',
        actorId: req.businessId,
        action: 'LEAD_READ',
        metadata: { leadId: id },
      },
    });

    res.json(lead);
  } catch (err) {
    console.error('[Leads] getLeadById error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}

export async function updateLead(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, categoryId, priceEstimateMin, priceEstimateMax } = req.body;

  const validStatuses = ['NY', 'PAGAENDE', 'VUNNEN', 'FORLORAD'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Ogiltig status.' });
    return;
  }

  try {
    const lead = await prisma.lead.findFirst({
      where: { id, businessId: req.businessId },
    });
    if (!lead) {
      res.status(404).json({ error: 'Forfragan hittades inte.' });
      return;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(priceEstimateMin !== undefined ? { priceEstimateMin } : {}),
        ...(priceEstimateMax !== undefined ? { priceEstimateMax } : {}),
      },
      include: { category: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('[Leads] updateLead error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}

export async function deleteLead(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const lead = await prisma.lead.findFirst({
      where: { id, businessId: req.businessId },
      include: { images: true },
    });
    if (!lead) {
      res.status(404).json({ error: 'Forfragan hittades inte.' });
      return;
    }

    // Delete image files
    const { LocalStorageProvider } = await import('../storage');
    const storage = new LocalStorageProvider(process.env.APP_BASE_URL || 'http://localhost:3001');
    for (const img of lead.images) {
      await storage.deleteFile(img.url);
    }

    // Cascade delete (messages, images via Prisma cascade)
    await prisma.lead.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorType: 'BUSINESS',
        actorId: req.businessId,
        action: 'LEAD_DELETED',
        metadata: { leadId: id },
      },
    });

    res.json({ success: true, message: 'Forfragan raderad.' });
  } catch (err) {
    console.error('[Leads] deleteLead error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}

export async function exportLead(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const lead = await prisma.lead.findFirst({
      where: { id, businessId: req.businessId },
      include: {
        category: true,
        messages: { orderBy: { sentAt: 'asc' } },
        images: true,
      },
    });
    if (!lead) {
      res.status(404).json({ error: 'Forfragan hittades inte.' });
      return;
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorType: 'BUSINESS',
        actorId: req.businessId,
        action: 'LEAD_EXPORTED',
        metadata: { leadId: id },
      },
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="lead-${id}.json"`);
    res.json(lead);
  } catch (err) {
    console.error('[Leads] exportLead error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}

export async function addMessage(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { content, editedFromMessageId } = req.body;

  if (!content?.trim()) {
    res.status(400).json({ error: 'Meddelandeinnehall saknas.' });
    return;
  }

  try {
    const lead = await prisma.lead.findFirst({
      where: { id, businessId: req.businessId },
    });
    if (!lead) {
      res.status(404).json({ error: 'Forfragan hittades inte.' });
      return;
    }

    // If editing an existing AI draft
    if (editedFromMessageId) {
      const original = await prisma.message.findUnique({ where: { id: editedFromMessageId } });
      if (original) {
        const updated = await prisma.message.update({
          where: { id: editedFromMessageId },
          data: {
            content,
            edited: true,
            originalContent: original.originalContent || original.content,
            sender: 'BUSINESS',
          },
        });
        res.json(updated);
        return;
      }
    }

    const message = await prisma.message.create({
      data: {
        leadId: id,
        sender: 'BUSINESS',
        content,
        deliveryChannel: 'EMAIL',
      },
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('[Leads] addMessage error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}

export async function generateDraft(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const lead = await prisma.lead.findFirst({
      where: { id, businessId: req.businessId },
      include: { category: true },
    });
    if (!lead) {
      res.status(404).json({ error: 'Forfragan hittades inte.' });
      return;
    }

    const aiResponse = await generateLeadReply({
      name: lead.name,
      description: lead.description,
      city: lead.city,
      postalCode: lead.postalCode,
      categorySlug: lead.category?.slug,
    });

    const message = await prisma.message.create({
      data: {
        leadId: id,
        sender: 'AI',
        content: aiResponse.replySv,
        deliveryChannel: 'INTERNAL',
      },
    });

    res.status(201).json({ message, aiResponse });
  } catch (err) {
    console.error('[Leads] generateDraft error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}
