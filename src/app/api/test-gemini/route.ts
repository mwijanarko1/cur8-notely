import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerRuntimeConfig } from '@/lib/utils/config';

// Initialize the Google Generative AI client with API key from server config
const serverConfig = getServerRuntimeConfig();
const apiKey = serverConfig.geminiApiKey;
const genAI = new GoogleGenerativeAI(apiKey);

export async function GET(request: NextRequest) {
  try {
    // Configure the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    try {
      // Generate content with a simple prompt
      const result = await model.generateContent('Hello, what is your name?');
      const response = result.response.text();
      
      return NextResponse.json({ 
        success: true,
        response,
        message: 'Gemini API test successful'
      });
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