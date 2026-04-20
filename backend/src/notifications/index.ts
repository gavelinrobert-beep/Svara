export interface NotificationPayload {
  to: string;
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<void>;
}
