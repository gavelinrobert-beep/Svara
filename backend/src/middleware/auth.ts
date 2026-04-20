import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  businessId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Ej autentiserad' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { businessId: string };
    req.businessId = payload.businessId;
    next();
  } catch {
    res.status(401).json({ error: 'Ogiltig eller utgången session' });
  }
}
