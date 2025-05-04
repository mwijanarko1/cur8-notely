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

export async function POST(request: NextRequest) {
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
    
    // Parse the request body
    const body = await request.json();
    const { message, notes } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Configure the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Create a prompt with context
    const prompt = `
You are an advanced AI writing assistant for a note-taking app. Be thoughtful, helpful, and provide valuable writing assistance. Your capabilities include:

- Drafting new content based on user requests
- Editing and improving existing notes
- Suggesting better phrasing or structure
- Summarizing lengthy content
- Expanding on brief ideas or outlines
- Organizing information more effectively
- Providing creative writing suggestions
- Helping with research organization

By default, you'll only reference the current note the user is working on.

User's writing request: ${message}

User's current note (reference material):
${notes?.currentNote || 'No notes available'}
`;

    try {
      // Generate content
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Return response with rate limit headers
      return NextResponse.json(
        { response },
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
      
      // Provide a detailed error response
      return NextResponse.json(
        { 
          error: 'AI model error', 
          details: genAiError.message || 'Unknown Gemini API error'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
} 