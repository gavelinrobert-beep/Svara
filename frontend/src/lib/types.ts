export type LeadStatus = 'NY' | 'PAGAENDE' | 'VUNNEN' | 'FORLORAD';
export type MessageSender = 'AI' | 'CUSTOMER' | 'BUSINESS';
export type DeliveryChannel = 'EMAIL' | 'SMS' | 'INTERNAL';

export interface Category {
  id: string;
  slug: string;
  nameSv: string;
  rotEligible: boolean;
  rutEligible: boolean;
}

export interface Message {
  id: string;
  leadId: string;
  sender: MessageSender;
  content: string;
  edited: boolean;
  originalContent?: string;
  sentAt: string;
  deliveryChannel: DeliveryChannel;
}

export interface LeadImage {
  id: string;
  url: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phoneE164: string;
  email: string;
  description: string;
  postalCode: string;
  city: string;
  status: LeadStatus;
  priceEstimateMin?: number;
  priceEstimateMax?: number;
  consentAt: string;
  createdAt: string;
  category?: Category;
  messages?: Message[];
  images?: LeadImage[];
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NY: 'Ny',
  PAGAENDE: 'Pågående',
  VUNNEN: 'Vunnen',
  FORLORAD: 'Förlorad',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  NY: 'bg-blue-100 text-blue-800',
  PAGAENDE: 'bg-yellow-100 text-yellow-800',
  VUNNEN: 'bg-green-100 text-green-800',
  FORLORAD: 'bg-red-100 text-red-800',
};
