import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '../../../../lib/services/content';
import type { GenerationRequest, CampaignStrategy } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🎯 [CAMPAIGN STRATEGY] Request started at:', new Date().toISOString());
  
  try {
    const body: GenerationRequest = await request.json();
    const { prompt, platforms, frequency, duration, enhancePrompt, contentType } = body;
    
    console.log('📋 [CAMPAIGN STRATEGY] Request details:', {
      prompt: prompt.substring(0, 50) + '...',
      platforms,
      frequency,
      duration,
      contentType,
      enhancePrompt,
      timestamp: new Date().toISOString()
    });

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
        },
        { status: 400 }
      );
    }

    // Set a timeout for strategy generation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Strategy generation timeout')), 15000); // 15 second timeout
    });

    const strategyPromise = (async () => {
      // Enhance prompt if requested
      let finalPrompt = prompt;
      if (enhancePrompt) {
        try {
          finalPrompt = await contentService.enhancePrompt(
            prompt,
            platforms[0],
            contentType === 'video' ? 'video' : 'image'
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

      return { strategy, enhancedPrompt: enhancePrompt ? finalPrompt : undefined };
    })();

    // Race between strategy generation and timeout
    const result = await Promise.race([strategyPromise, timeoutPromise]) as any;
    
    const executionTime = Date.now() - startTime;
    console.log('✅ [CAMPAIGN STRATEGY] Request completed in:', executionTime + 'ms');
    console.log('📊 [CAMPAIGN STRATEGY] Result:', {
      success: result.success,
      hasStrategy: !!result.strategy,
      duration: executionTime + 'ms'
    });

    return NextResponse.json({ 
      ...result,
      success: true
    });

  } catch (error: any) {
    console.error('Strategy generation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Strategy generation failed',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
