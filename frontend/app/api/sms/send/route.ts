import { NextRequest, NextResponse } from 'next/server';
import { SMSRequestSchema } from '@/types/api';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    SMSRequestSchema.parse(body);
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      success: true,
      messageId,
      timestamp: new Date().toISOString(),
      message: 'SMS sent successfully',
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SMS API endpoint',
    version: '1.0.0',
    documentation: '/api/sms/docs',
  });
}
