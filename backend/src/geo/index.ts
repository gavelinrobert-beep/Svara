import { prisma } from '../lib/prisma';

export interface GeoInfo {
  postalCode: string;
  kommun: string;
  lan: string;
}

/**
 * GeoResolver maps Swedish postnummer to kommun/lan.
 * MVP uses a small seed table. Replace with full Postnummer dataset (SCB) for production.
 */
export interface GeoResolver {
  resolve(postalCode: string): Promise<GeoInfo | null>;
}

export class DatabaseGeoResolver implements GeoResolver {
  async resolve(postalCode: string): Promise<GeoInfo | null> {
    const cleaned = postalCode.replace(/\s/g, '');
    const result = await prisma.postnummerGeo.findUnique({
      where: { postalCode: cleaned },
    });
    return result;
  }
}

export const geoResolver = new DatabaseGeoResolver();
