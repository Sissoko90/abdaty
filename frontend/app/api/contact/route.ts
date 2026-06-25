import { NextRequest, NextResponse } from 'next/server';
import { ContactFormSchema } from '@/types/api';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    ContactFormSchema.parse(body);
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      timestamp: new Date().toISOString(),
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
