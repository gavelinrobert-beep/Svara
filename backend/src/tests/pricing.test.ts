import { describe, it, expect } from 'vitest';
import { RuleBasedPriceEstimator } from '../pricing';

describe('RuleBasedPriceEstimator', () => {
  const estimator = new RuleBasedPriceEstimator();

  it('returns price range for badrumsrenovering', () => {
    const result = estimator.estimate('badrumsrenovering', 'Byt kakel och golvklinker');
    expect(result.min).toBe(50000);
    expect(result.max).toBe(150000);
    expect(result.needsMoreInfo).toBe(false);
  });

  it('falls back to ovrigt for unknown category', () => {
    const result = estimator.estimate('unknown-category', 'Nagot jobb');
    expect(result.min).toBeGreaterThan(0);
    expect(result.max).toBeGreaterThan(result.min);
  });

  it('returns Swedish price hint', () => {
    const result = estimator.estimate('hemstadning', 'Stada 3 rok');
    expect(result.hintSv).toContain('kr');
  });
});
