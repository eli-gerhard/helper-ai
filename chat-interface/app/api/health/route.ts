// Health check endpoint

import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({ status: 'healthy' });
}