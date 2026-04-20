import { CATEGORY_RATES } from './rates';

export interface PriceEstimate {
  min: number;
  max: number;
  needsMoreInfo: boolean;
  hintSv: string;
}

export interface PriceEstimator {
  estimate(categorySlug: string, description: string): PriceEstimate;
}

/**
 * RuleBasedPriceEstimator: uses CATEGORY_RATES to produce ranges.
 */
export class RuleBasedPriceEstimator implements PriceEstimator {
  estimate(categorySlug: string, _description: string): PriceEstimate {
    const rate = CATEGORY_RATES[categorySlug] || CATEGORY_RATES['ovrigt'];
    return {
      min: rate.min,
      max: rate.max,
      needsMoreInfo: false,
      hintSv: `Typiskt prisintervall for ${categorySlug}: ${rate.min.toLocaleString('sv-SE')}-${rate.max.toLocaleString('sv-SE')} kr. ${rate.notes || ''}`,
    };
  }
}

export const priceEstimator = new RuleBasedPriceEstimator();

export function formatPriceSEK(min: number, max: number): string {
  const fmt = (n: number) => n.toLocaleString('sv-SE');
  if (min === max) return `${fmt(min)} kr`;
  return `${fmt(min)}-${fmt(max)} kr`;
}
