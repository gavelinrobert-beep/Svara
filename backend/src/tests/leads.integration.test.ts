/**
 * Integration test - requires DATABASE_URL to be set.
 * Excluded from default test run (see vitest.config.ts).
 * Run with: vitest run src/tests/leads.integration.test.ts
 */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';

// Mock OpenAI
vi.mock('../ai', () => ({
  generateLeadReply: vi.fn().mockResolvedValue({
    replySv: 'Tack for din forfragan! Vi aterkommer snart.',
    categorySlug: 'hemstadning',
    priceMin: 800,
    priceMax: 2500,
    needsMoreInfo: false,
    followUpQuestions: ['Hur stor ar bostaden?'],
  }),
}));

describe('POST /api/leads', () => {
  it('creates a lead and enqueues AI processing', async () => {
    const response = await request(app)
      .post('/api/leads')
      .field('name', 'Anna Svensson')
      .field('phone', '070-123 45 67')
      .field('email', 'anna@example.com')
      .field('description', 'Behover hemstadning varannan vecka')
      .field('postalCode', '11120')
      .field('city', 'Stockholm')
      .field('consent', 'true');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.id).toBeDefined();
    
    // Wait a bit for queue processing
    await new Promise((r) => setTimeout(r, 200));

    // Check message was created
    const messages = await prisma.message.findMany({
      where: { leadId: response.body.id },
    });
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].sender).toBe('AI');
  });
});
