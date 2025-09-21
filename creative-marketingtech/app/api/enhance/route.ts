import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '../../lib/services/content';
import type { PromptEnhancementRequest, PromptEnhancementResponse } from '../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: PromptEnhancementRequest = await request.json();
    const { prompt, platform, contentType } = body;

    // Validate input
    if (!prompt || !platform || !contentType) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: prompt, platform, contentType' 
        } as PromptEnhancementResponse,
        { status: 400 }
      );
    }

    if (prompt.length < 10) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Prompt must be at least 10 characters long' 
        } as PromptEnhancementResponse,
        { status: 400 }
      );
    }

    // Enhance prompt
    const enhancedPrompt = await contentService.enhancePrompt(
      prompt,
      platform,
      contentType
    );

    return NextResponse.json({ 
      success: true,
      enhancedPrompt
    } as PromptEnhancementResponse);

  } catch (error: any) {
    console.error('Prompt enhancement error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Prompt enhancement failed' 
      } as PromptEnhancementResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use POST to enhance prompts.' 
    },
    { status: 405 }
  );
}
