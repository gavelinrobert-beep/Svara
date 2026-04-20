import { EmailProvider } from './email';
import { SmsProvider } from './sms';

export const emailNotifier = new EmailProvider();
export const smsNotifier = new SmsProvider();

export async function notifyBusinessNewLead(params: {
  businessEmail: string;
  businessPhone?: string | null;
  leadName: string;
  leadCity: string;
  leadCategory: string;
  leadId: string;
}): Promise<void> {
  const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
  const subject = `Ny forfragan fran ${params.leadName}`;
  const body = `Hej,\n\nEn ny forfragan har inkommit i Svara.\n\nKund: ${params.leadName}\nOrt: ${params.leadCity}\nKategori: ${params.leadCategory}\n\nSe forfragan: ${appUrl}/dashboard/leads/${params.leadId}\n\n// Svara`;
  
  try {
    await emailNotifier.send({
      to: params.businessEmail,
      subject,
      bodyText: body,
    });
  } catch (err) {
    console.error('[Notifier] E-postfel:', err);
  }

  if (params.businessPhone) {
    try {
      await smsNotifier.send({
        to: params.businessPhone,
        bodyText: `Ny forfragan fran ${params.leadName} i ${params.leadCity}. Se: ${appUrl}/dashboard/leads/${params.leadId}`,
      });
    } catch (err) {
      console.error('[Notifier] SMS-fel:', err);
    }
  }
}
