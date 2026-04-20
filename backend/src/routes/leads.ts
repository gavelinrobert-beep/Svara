import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLead,
  addMessage,
  generateDraft,
} from '../controllers/leads';

export const leadsRouter = Router();

// Public: create lead
leadsRouter.post(
  '/',
  upload.array('images', 10),
  [
    body('name').notEmpty().withMessage('Namn ar obligatoriskt'),
    body('phone').notEmpty().withMessage('Telefonnummer ar obligatoriskt'),
    body('email').isEmail().withMessage('Ogiltig e-postadress'),
    body('description').notEmpty().withMessage('Beskrivning ar obligatorisk'),
    body('postalCode').notEmpty().withMessage('Postnummer ar obligatoriskt'),
    body('city').notEmpty().withMessage('Ort ar obligatorisk'),
    body('consent').equals('true').withMessage('Du maste godkanna integritetspolicyn'),
  ],
  createLead
);

// Auth protected
leadsRouter.get('/', requireAuth, getLeads);
leadsRouter.get('/:id', requireAuth, getLeadById);
leadsRouter.patch('/:id', requireAuth, updateLead);
leadsRouter.delete('/:id', requireAuth, deleteLead);
leadsRouter.get('/:id/export', requireAuth, exportLead);
leadsRouter.post('/:id/messages', requireAuth, addMessage);
leadsRouter.post('/:id/ai-draft', requireAuth, generateDraft);
