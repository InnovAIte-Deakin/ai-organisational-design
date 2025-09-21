import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '../../../lib/services/content';
import type { GenerationRequest, GenerationResponse } from '../../../lib/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [SINGLE POST] Request started at:', new Date().toISOString());
  
  try {
    const body: GenerationRequest = await request.json();
    const { prompt, platforms, contentType, enhancePrompt } = body;
    
    console.log('📝 [SINGLE POST] Request details:', {
      prompt: prompt.substring(0, 50) + '...',
      platforms,
      contentType,
      enhancePrompt,
      timestamp: new Date().toISOString()
    });

    // Validate input
    const validation = contentService.validateRequest({
      ...body,
      mode: 'single'
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

    // Enhance prompt if requested
    let finalPrompt = prompt;
    if (enhancePrompt) {
      try {
        finalPrompt = await contentService.enhancePrompt(
          prompt,
          platforms[0],
          contentType
        );
      } catch (error) {
        console.error('Prompt enhancement failed:', error);
        // Continue with original prompt if enhancement fails
      }
    }

    // Set a timeout for single post generation
    const timeoutPromise = new Promise<GenerationResponse>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Single post generation timeout'));
      }, 20000); // 20 second timeout
    });

    const postsPromise = (async () => {
      // Generate content
      const posts = await contentService.generateSinglePost(
        finalPrompt,
        platforms,
        contentType
      );

      return { 
        posts, 
        success: true,
        enhancedPrompt: enhancePrompt ? finalPrompt : undefined
      } as GenerationResponse;
    })();

    // Race between generation and timeout
    const result = await Promise.race([postsPromise, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    console.log('✅ [SINGLE POST] Request completed in:', duration + 'ms');
    console.log('📊 [SINGLE POST] Result:', {
      success: result.success,
      postsCount: result.posts?.length || 0,
      duration: duration + 'ms'
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Single post generation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Content generation failed',
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
      error: 'Method not allowed. Use POST to generate content.' 
    },
    { status: 405 }
  );
}
