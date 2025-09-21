import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '../../../lib/services/content';
import type { GenerationRequest, GenerationResponse } from '../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { prompt, platforms, frequency, duration, enhancePrompt, contentMix, contentType } = body;

    // Validate input
    const validation = contentService.validateRequest({
      ...body,
      mode: 'campaign'
    });

    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: validation.errors 
        } as GenerationResponse,
        { status: 400 }
      );
    }

    // Set a timeout for the entire campaign generation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Campaign generation timeout')), 30000); // 30 second timeout
    });

    const campaignPromise = (async () => {
      // Enhance prompt if requested
      let finalPrompt = prompt;
      if (enhancePrompt) {
        try {
          finalPrompt = await contentService.enhancePrompt(
            prompt,
            platforms[0],
            contentMix === 'video-heavy' ? 'video' : 'image'
          );
        } catch (error) {
          console.error('Prompt enhancement failed:', error);
          // Continue with original prompt if enhancement fails
        }
      }

      // Generate campaign strategy
      const strategy = await contentService.generateCampaignStrategy(
        finalPrompt,
        platforms,
        frequency!,
        duration!,
        contentType
      );

      // Generate campaign posts
      const posts = await contentService.generateCampaignPosts(
        strategy,
        platforms
      );

      return { strategy, posts, enhancedPrompt: enhancePrompt ? finalPrompt : undefined };
    })();

    // Race between campaign generation and timeout
    const result = await Promise.race([campaignPromise, timeoutPromise]) as any;

    return NextResponse.json({ 
      ...result,
      success: true
    } as GenerationResponse);

  } catch (error: any) {
    console.error('Campaign generation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Campaign generation failed',
        details: error.stack
      } as GenerationResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use POST to generate campaigns.' 
    },
    { status: 405 }
  );
}
