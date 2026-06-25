import { SMSApiRequest, SMSApiResponse } from '@/types';

export class SMSService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl = '/api/sms') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async sendSMS(request: SMSApiRequest): Promise<SMSApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to send SMS',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        messageId: data.messageId,
        timestamp: data.timestamp,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    const response = await fetch(`${this.baseUrl}/balance`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }

    return response.json();
  }
}
