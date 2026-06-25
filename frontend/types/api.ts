import { z } from 'zod';

export const SMSRequestSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  message: z.string().min(1).max(1600),
  from: z.string().optional(),
});

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  service: z.string().optional(),
});

export type SMSRequest = z.infer<typeof SMSRequestSchema>;
export type ContactForm = z.infer<typeof ContactFormSchema>;

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
