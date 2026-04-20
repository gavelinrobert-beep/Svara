import { describe, it, expect } from 'vitest';
import { normalizeSwedishPhone, validatePostalCode, normalizePostalCode } from '../lib/validation';

describe('normalizeSwedishPhone', () => {
  it('normalizes 070-123 45 67 to +46701234567', () => {
    expect(normalizeSwedishPhone('070-123 45 67')).toBe('+46701234567');
  });

  it('normalizes 0701234567 to +46701234567', () => {
    expect(normalizeSwedishPhone('0701234567')).toBe('+46701234567');
  });

  it('accepts +46701234567 unchanged', () => {
    expect(normalizeSwedishPhone('+46701234567')).toBe('+46701234567');
  });

  it('normalizes 0046701234567 to +46701234567', () => {
    expect(normalizeSwedishPhone('0046701234567')).toBe('+46701234567');
  });

  it('returns null for invalid numbers', () => {
    expect(normalizeSwedishPhone('abc')).toBeNull();
    expect(normalizeSwedishPhone('12345')).toBeNull();
  });
});

describe('validatePostalCode', () => {
  it('accepts 5-digit postal codes', () => {
    expect(validatePostalCode('12345')).toBe(true);
    expect(validatePostalCode('123 45')).toBe(true);
  });

  it('rejects invalid codes', () => {
    expect(validatePostalCode('1234')).toBe(false);
    expect(validatePostalCode('123456')).toBe(false);
    expect(validatePostalCode('abcde')).toBe(false);
  });
});

describe('normalizePostalCode', () => {
  it('formats 12345 to 123 45', () => {
    expect(normalizePostalCode('12345')).toBe('123 45');
  });

  it('leaves already formatted code unchanged', () => {
    expect(normalizePostalCode('123 45')).toBe('123 45');
  });
});
