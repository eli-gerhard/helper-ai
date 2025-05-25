// Database health check API endpoint
// chat-interface/app/api/database/health/route.ts

import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-service';
import { Config } from '@/lib/config';

export async function GET() {
  try {
    // First, validate Supabase configuration
    const configValidation = Config.validateSupabase();
    
    if (!configValidation.valid) {
      return NextResponse.json({
        healthy: false,
        error: 'Configuration error',
        details: {
          configuration: configValidation.errors,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }
    
    // Test database connection
    const healthCheck = await DatabaseService.healthCheck();
    
    return NextResponse.json({
      healthy: healthCheck.healthy,
      details: healthCheck.details
    }, { 
      status: healthCheck.healthy ? 200 : 500 
    });
    
  } catch (error) {
    console.error('Database health check error:', error);
    
    return NextResponse.json({
      healthy: false,
      error: 'Health check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}