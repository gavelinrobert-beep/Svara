/**
 * Normalizes a Swedish phone number to E.164 format (+46...)
 * Accepts: 07X-XXX XX XX, 07XXXXXXXX, +467XXXXXXXX, 07X XXX XX XX
 */
export function normalizeSwedishPhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-]/g, '');
  
  // Already E.164 with +46
  if (/^\+46\d{8,10}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Starts with 0046
  if (/^0046\d{8,10}$/.test(cleaned)) {
    return '+46' + cleaned.slice(4);
  }
  
  // Swedish local format starting with 0
  if (/^0\d{8,10}$/.test(cleaned)) {
    return '+46' + cleaned.slice(1);
  }
  
  return null;
}

/**
 * Validates Swedish postal code (5 digits, optionally with space: "123 45")
 */
export function validatePostalCode(input: string): boolean {
  const cleaned = input.replace(/\s/g, '');
  return /^\d{5}$/.test(cleaned);
}

/**
 * Normalizes postal code to format "123 45"
 */
export function normalizePostalCode(input: string): string {
  const cleaned = input.replace(/\s/g, '');
  if (cleaned.length === 5) {
    return cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
  }
  return input;
}
