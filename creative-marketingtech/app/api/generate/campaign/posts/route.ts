import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '../../../../lib/services/content';
import type { CampaignStrategy, GeneratedContent } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: { strategy: CampaignStrategy; platforms: string[] } = await request.json();
    const { strategy, platforms } = body;

    if (!strategy || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Strategy and platforms are required' 
        },
        { status: 400 }
      );
    }

    // Set a timeout for posts generation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Posts generation timeout')), 20000); // 20 second timeout
    });

    const postsPromise = (async () => {
      // Generate campaign posts
      const posts = await contentService.generateCampaignPosts(
        strategy,
        platforms
      );

      return { posts };
    })();

    // Race between posts generation and timeout
    const result = await Promise.race([postsPromise, timeoutPromise]) as any;

    return NextResponse.json({ 
      ...result,
      success: true
    });

  } catch (error: any) {
    console.error('Posts generation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Posts generation failed',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
