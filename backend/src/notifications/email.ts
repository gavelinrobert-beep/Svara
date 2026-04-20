import nodemailer from 'nodemailer';
import { NotificationPayload, NotificationProvider } from './index';

export class EmailProvider implements NotificationProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }

  async send(payload: NotificationPayload): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@svara.se',
      to: payload.to,
      subject: payload.subject || 'Meddelande fran Svara',
      text: payload.bodyText,
      html: payload.bodyHtml || payload.bodyText,
    });
  }
}
