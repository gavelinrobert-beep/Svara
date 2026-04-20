import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'd MMM yyyy', { locale: sv });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'd MMM yyyy HH:mm', { locale: sv });
}

export function formatSEK(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceRange(min?: number | null, max?: number | null): string {
  if (!min && !max) return '—';
  if (min && max) {
    if (min === max) return formatSEK(min);
    return `${new Intl.NumberFormat('sv-SE').format(min)}–${new Intl.NumberFormat('sv-SE').format(max)} kr`;
  }
  if (min) return `från ${formatSEK(min)}`;
  if (max) return `upp till ${formatSEK(max)}`;
  return '—';
}
