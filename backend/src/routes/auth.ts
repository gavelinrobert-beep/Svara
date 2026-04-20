import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, me } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

authRouter.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Ogiltig e-postadress'),
    body('password').notEmpty().withMessage('Losenord saknas'),
  ],
  login
);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
