import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000/api/chat';
    
    console.log(`Proxying request to backend at: ${backendUrl}`);
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Backend server responded with status: ${response.status}`);
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in API route:', error);
    
    return NextResponse.json(
      { 
        message: { role: 'assistant', content: '' },
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}