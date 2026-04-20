import { NotificationPayload, NotificationProvider } from './index';

/**
 * SMS provider stub. Replace with Twilio or 46elks implementation.
 */
export class SmsProvider implements NotificationProvider {
  async send(payload: NotificationPayload): Promise<void> {
    const provider = process.env.SMS_PROVIDER;
    if (!provider) {
      console.log(`[SMS stub] Skickar till ${payload.to}: ${payload.bodyText.slice(0, 80)}`);
      return;
    }
    // TODO: Implement Twilio/46elks
    console.warn(`[SMS] Provider ${provider} ej implementerad annu.`);
  }
}
