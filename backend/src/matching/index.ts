import { prisma } from '../lib/prisma';

export interface MatchResult {
  businessId: string;
}

/**
 * LeadMatcher: determines which business(es) should receive a lead.
 * MVP: routes to the single configured business (BUSINESS_ID env var or first business in DB).
 */
export interface LeadMatcher {
  match(leadId: string, categorySlug?: string, postalCode?: string): Promise<MatchResult[]>;
}

export class SingleTenantMatcher implements LeadMatcher {
  async match(_leadId: string, _categorySlug?: string, _postalCode?: string): Promise<MatchResult[]> {
    const businessId = process.env.BUSINESS_ID;
    if (businessId) {
      return [{ businessId }];
    }
    // Fallback: use first business in DB
    const business = await prisma.business.findFirst({ select: { id: true } });
    if (!business) return [];
    return [{ businessId: business.id }];
  }
}

export const leadMatcher = new SingleTenantMatcher();
