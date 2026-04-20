import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '7d';

export async function login(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const business = await prisma.business.findUnique({ where: { email } });
    if (!business) {
      res.status(401).json({ error: 'Felaktig e-postadress eller losenord.' });
      return;
    }

    const valid = await bcrypt.compare(password, business.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Felaktig e-postadress eller losenord.' });
      return;
    }

    const token = jwt.sign({ businessId: business.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.json({
      token,
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
      },
    });
  } catch (err) {
    console.error('[Auth] login error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // JWT is stateless; client should discard token
  res.json({ success: true, message: 'Utloggad.' });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.businessId },
      select: { id: true, name: true, email: true, notificationEmail: true },
    });
    if (!business) {
      res.status(404).json({ error: 'Konto hittades inte.' });
      return;
    }
    res.json(business);
  } catch (err) {
    console.error('[Auth] me error:', err);
    res.status(500).json({ error: 'Serverfel.' });
  }
}
