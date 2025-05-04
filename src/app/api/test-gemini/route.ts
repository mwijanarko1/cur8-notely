import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerRuntimeConfig } from '@/lib/utils/config';
import { checkRateLimit } from '@/lib/utils/rateLimiter';

// Initialize the Google Generative AI client with API key from server config
const serverConfig = getServerRuntimeConfig();
const apiKey = serverConfig.geminiApiKey;
const genAI = new GoogleGenerativeAI(apiKey);

// Rate limit configuration
const REQUESTS_PER_MINUTE = 5;
const REQUESTS_PER_DAY = 20;

export async function GET(request: NextRequest) {
  try {
    // Get client identifier (IP address or forwarded IP)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown-ip';
    
    // Check rate limits
    const rateLimitResult = checkRateLimit(
      ip.toString(),
      REQUESTS_PER_MINUTE,
      REQUESTS_PER_DAY
    );
    
    // If rate limited, return 429 Too Many Requests
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetAt: rateLimitResult.resetAt
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.floor(rateLimitResult.resetAt.getTime() / 1000).toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    // Configure the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    try {
      // Generate content with a simple prompt
      const result = await model.generateContent('Hello, what is your name?');
      const response = result.response.text();
      
      // Return response with rate limit headers
      return NextResponse.json(
        { 
          success: true,
          response,
          message: 'Gemini API test successful'
        },
        {
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.floor(rateLimitResult.resetAt.getTime() / 1000).toString()
          }
        }
      );
    } catch (genAiError: any) {
      console.error('Gemini API Error:', genAiError);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'AI model error', 
          details: genAiError.message || 'Unknown Gemini API error'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 