/**
 * Ballpark Swedish price ranges per category (SEK, labor included).
 * Sources: typical Swedish market rates. Tune here.
 * Note: ROT deduction halves effective cost for eligible jobs.
 */
export interface PriceRange {
  min: number;
  max: number;
  unit?: string;
  notes?: string;
}

export const CATEGORY_RATES: Record<string, PriceRange> = {
  'badrumsrenovering': { min: 50000, max: 150000, notes: 'Komplett renovering, 5-10 m2' },
  'koksrenovering': { min: 30000, max: 120000, notes: 'Byte av luckor till hel renovering' },
  'malning': { min: 3000, max: 20000, notes: 'Rum till lagenhet' },
  'snickeri': { min: 5000, max: 40000, notes: 'Enklare till avancerat' },
  'el-arbete': { min: 2500, max: 25000, notes: 'Elinstallation, per arbetsdag' },
  'vvs-rormokeri': { min: 3000, max: 30000, notes: 'Byte/installation' },
  'golvlaggning': { min: 4000, max: 25000, notes: 'Parkett/klinker, per rum' },
  'takarbete': { min: 10000, max: 80000, notes: 'Taktackning, per tak' },
  'tradgardsarbete': { min: 2000, max: 15000, notes: 'Underhall till anlaggning' },
  'flytt-stadning': { min: 2500, max: 6000, notes: 'Lagenhet 2-4 rok' },
  'hemstadning': { min: 800, max: 2500, notes: 'Per tillfalle, 2-5 rok' },
  'fonster-puts': { min: 500, max: 3000, notes: 'Per tillfalle' },
  'flytthjalp': { min: 3000, max: 12000, notes: 'Lokal flytt' },
  'ovrigt': { min: 1000, max: 50000, notes: 'Varierar beroende pa uppdrag' },
};
