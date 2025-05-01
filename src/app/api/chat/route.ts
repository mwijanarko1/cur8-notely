import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerRuntimeConfig } from '@/lib/utils/config';

// Initialize the Google Generative AI client with API key from server config
const serverConfig = getServerRuntimeConfig();
const apiKey = serverConfig.geminiApiKey;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
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
You are a helpful AI assistant for a note-taking app. Help the user with their notes.
Be concise but helpful. Respond to queries about their notes with relevant information.

When formatting your responses, please follow these guidelines:
- Use markdown formatting for better readability
- Use headings (# Heading) for section titles
- Use bullet points (* item) or numbered lists (1. item) when listing items
- Use **bold** for emphasis on important points
- Use \`code\` formatting for any technical terms or code references
- Structure longer responses with clear sections
- For note summaries, highlight key points in **bold**

User's question: ${message}

User's notes:
${notes || 'No notes available'}
`;

    try {
      // Generate content
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return NextResponse.json({ response });
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