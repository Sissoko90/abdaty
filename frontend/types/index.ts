export type Locale = 'en' | 'fr';

export interface Service {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  features: string[];
}

export interface SMSPricing {
  country: string;
  countryCode: string;
  pricePerSMS: number;
  currency: string;
}

export interface SMSApiRequest {
  to: string;
  message: string;
  from?: string;
}

export interface SMSApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  service?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Project {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image: string;
  category: string;
  technologies: string[];
}
