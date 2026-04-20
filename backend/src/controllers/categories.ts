import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await prisma.category.findMany({ orderBy: { nameSv: 'asc' } });
    res.json(categories);
  } catch (err) {
    console.error('[Categories] error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}
