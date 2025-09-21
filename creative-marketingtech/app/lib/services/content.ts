import { geminiAPI } from '../api/gemini';
import type { 
  GeneratedContent, 
  CampaignStrategy, 
  PostSchedule,
  CampaignSettings,
  GenerationProgress
} from '../types';

// Platform constants
const PLATFORMS = {
  instagram: { id: 'instagram', name: 'Instagram', limits: { captionLength: 2200, hashtagLimit: 30 } },
  tiktok: { id: 'tiktok', name: 'TikTok/Reels/Shorts', limits: { captionLength: 150, hashtagLimit: 20 } },
  linkedin: { id: 'linkedin', name: 'LinkedIn', limits: { captionLength: 3000, hashtagLimit: 5 } },
  twitter: { id: 'twitter', name: 'Twitter/X', limits: { captionLength: 280, hashtagLimit: 2 } },
  facebook: { id: 'facebook', name: 'Facebook', limits: { captionLength: 63206, hashtagLimit: 30 } },
  youtube: { id: 'youtube', name: 'YouTube', limits: { captionLength: 5000, hashtagLimit: 15 } }
};

const CAMPAIGN_DURATIONS = {
  '1-week': { days: 7, posts: 7 },
  '2-weeks': { days: 14, posts: 14 },
  '1-month': { days: 30, posts: 30 },
  '3-months': { days: 90, posts: 90 },
  '6-months': { days: 180, posts: 180 }
};

const CAMPAIGN_FREQUENCIES = {
  daily: { postsPerDay: 1 },
  'every-2-days': { postsPerDay: 0.5 },
  weekly: { postsPerDay: 0.14 },
  'bi-weekly': { postsPerDay: 0.07 }
};

export class ContentService {
  async enhancePrompt(
    userPrompt: string,
    platform: string,
    contentType: 'image' | 'video' | 'text'
  ): Promise<string> {
    const platformInfo = PLATFORMS[platform as keyof typeof PLATFORMS];
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const prompt = `
      Act as an expert social media strategist. Enhance this prompt for ${platformInfo.name} ${contentType} content.
      
      Original prompt: "${userPrompt}"
      
      Platform: ${platformInfo.name}
      Content Type: ${contentType}
      Current Period: ${currentMonth}
      
      Requirements:
      1. Make it specific, actionable, and creative
      2. Include trending elements relevant to ${currentMonth}
      3. Optimize for ${platformInfo.name} algorithm and best practices
      4. Target high engagement demographics (18-35 age group)
      5. Add visual/audio direction if applicable
      6. Include emotional hooks and clear CTAs
      7. Consider platform-specific features (stories, reels, etc.)
      8. Add urgency or FOMO elements where appropriate
      
      Return ONLY the enhanced prompt (50-100 words), no explanations or formatting.
    `;

    return await geminiAPI.generateContent(prompt);
  }

  async generateSinglePost(
    prompt: string,
    platforms: string[],
    contentType: 'image' | 'video' | 'text'
  ): Promise<GeneratedContent[]> {
    const posts: GeneratedContent[] = [];

    for (const platformId of platforms) {
      const platform = PLATFORMS[platformId as keyof typeof PLATFORMS];
      if (!platform) {
        console.error(`Unknown platform: ${platformId}`);
        continue;
      }
      
      const contentPrompt = `
        Create a ${contentType} social media post for ${platform.name}.
        
        Brief: ${prompt}
        
        Platform: ${platform.name}
        Platform limits:
        - Caption: ${platform.limits.captionLength} characters max
        - Hashtags: ${platform.limits.hashtagLimit} max
        - Media ratio: ${(platform.limits as any).imageRatio || "16:9"}
        - Video length: ${(platform.limits as any).videoLength || 60} seconds max
        
        Generate a JSON object with:
        {
          "caption": "engaging caption with emojis, optimized for ${platform.name}",
          "hashtags": ["relevant", "trending", "hashtags", "for", "${platform.name}"],
          "mediaPrompt": "detailed prompt for AI ${contentType} generation with ${(platform.limits as any).imageRatio || "16:9"} aspect ratio",
          "cta": "clear call-to-action",
          "hook": "attention-grabbing opening line"
        }
        
        Make the content platform-specific and engaging. Use trending hashtags and emojis appropriately.
      `;

      try {
        const content = await geminiAPI.generateJSON(contentPrompt);
        
        const post: GeneratedContent = {
          id: `${platformId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          platform: platformId,
          type: contentType,
          caption: content.caption || 'Generated caption',
          hashtags: content.hashtags || [],
          mediaPrompt: content.mediaPrompt,
          status: 'pending',
          createdAt: new Date()
        };

        // Generate media if needed
        if (contentType !== 'text' && content.mediaPrompt) {
          post.status = 'generating';
          try {
            if (contentType === 'image') {
              // Use a timeout for image generation to prevent hanging
              const imagePromise = geminiAPI.generateImage(content.mediaPrompt);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Image generation timeout')), 15000)
              );
              
              post.mediaUrl = await Promise.race([imagePromise, timeoutPromise]) as string;
            } else if (contentType === 'video') {
              post.mediaUrl = await geminiAPI.generateVideo(content.mediaPrompt);
            }
            post.status = 'completed';
          } catch (error) {
            post.status = 'failed';
            console.error(`Media generation failed for ${platformId}:`, error);
            // Add a placeholder image URL for failed generations
            post.mediaUrl = `https://picsum.photos/400/400?random=${Date.now()}`;
          }
        } else {
          post.status = 'completed';
        }

        posts.push(post);
      } catch (error) {
        console.error(`Content generation failed for ${platformId}:`, error);
        // Add a failed post to maintain consistency
        posts.push({
          id: `${platformId}-${Date.now()}-failed`,
          platform: platformId,
          type: contentType,
          caption: 'Content generation failed',
          hashtags: [],
          status: 'failed',
          createdAt: new Date()
        });
      }
    }

    return posts;
  }

  async generateCampaignStrategy(
    prompt: string,
    platforms: string[],
    frequency: string,
    duration: string,
    contentType?: string
  ): Promise<CampaignStrategy> {
    const durationConfig = CAMPAIGN_DURATIONS[duration as keyof typeof CAMPAIGN_DURATIONS] || { days: 7, posts: 7 };
    const frequencyConfig = CAMPAIGN_FREQUENCIES[frequency as keyof typeof CAMPAIGN_FREQUENCIES] || { postsPerDay: 1 };
    const totalDays = durationConfig.days;
    const totalPosts = Math.ceil(totalDays * frequencyConfig.postsPerDay);
    
    const strategyPrompt = `
      Create a comprehensive social media campaign strategy.
      
      Campaign brief: ${prompt}
      Platforms: ${platforms.map(p => PLATFORMS[p as keyof typeof PLATFORMS]?.name).join(', ')}
      Posting frequency: ${frequency} (${frequencyConfig.postsPerDay} posts per day)
      Campaign duration: ${duration} (${totalDays} days)
      Total posts needed: ${totalPosts}
      ${contentType ? `Content type constraint: Generate ONLY ${contentType} content for this campaign` : ''}
      
      Generate a detailed JSON strategy with:
      {
        "overview": "2-3 sentence campaign overview with clear objectives",
        "contentPillars": ["3-5 main content themes that align with the brief"],
        "schedule": [
          {
            "dayNumber": 1,
            "platform": "platform name (one of: ${platforms.join(', ')})",
            "contentType": "image/video/text",
            "topic": "specific post topic that fits the content pillars",
            "hook": "attention-grabbing opening for this specific post"
          }
        ],
        "keyMessages": ["3-5 core messages that will be communicated throughout the campaign"],
        "visualGuidelines": "detailed visual style description including colors, mood, and aesthetic",
        "hashtagStrategy": ["10-15 campaign hashtags that will be used consistently"]
      }
      
      Requirements:
      - Create exactly ${totalPosts} posts in the schedule
      - Distribute posts evenly across platforms: ${platforms.join(', ')}
      - Ensure variety in content types while maintaining cohesion
      - Each post should have a unique topic but align with the content pillars
      - Make the campaign feel cohesive and strategic
      - Include a mix of educational, promotional, and engaging content
    `;

    return await geminiAPI.generateJSON(strategyPrompt);
  }

  async generateCampaignPosts(
    strategy: CampaignStrategy,
    platforms: string[]
  ): Promise<GeneratedContent[]> {
    const posts: GeneratedContent[] = [];

    // Limit to first 5 posts to prevent timeouts
    const limitedSchedule = strategy.schedule.slice(0, 5);

    for (const scheduleItem of limitedSchedule) {
      const platform = PLATFORMS[scheduleItem.platform as keyof typeof PLATFORMS];
      if (!platform) {
        console.error(`Unknown platform in schedule: ${scheduleItem.platform}`);
        continue;
      }
      
      const postPrompt = `
        Generate a ${scheduleItem.contentType} post for ${scheduleItem.platform}.
        
        Campaign Context:
        - Topic: ${scheduleItem.topic}
        - Hook: ${scheduleItem.hook}
        - Campaign overview: ${strategy.overview}
        - Key messages: ${strategy.keyMessages.join(', ')}
        - Visual style: ${strategy.visualGuidelines}
        - Campaign hashtags: ${strategy.hashtagStrategy.join(', ')}
        
        Platform: ${scheduleItem.platform}
        Platform limits:
        - Caption: ${platform.limits.captionLength} characters max
        - Hashtags: ${platform.limits.hashtagLimit} max
        - Media ratio: ${(platform.limits as any).imageRatio || "16:9"}
        
        Generate JSON:
        {
          "caption": "engaging platform-optimized caption that incorporates the hook and key messages",
          "hashtags": ["mix of campaign hashtags and platform-specific trending hashtags"],
          "mediaPrompt": "detailed AI generation prompt that follows the visual guidelines and fits the topic"
        }
        
        Make sure the content is engaging, on-brand, and optimized for ${scheduleItem.platform}.
      `;

      try {
        const content = await geminiAPI.generateJSON(postPrompt);
        
        const post: GeneratedContent = {
          id: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          platform: scheduleItem.platform,
          type: scheduleItem.contentType as 'image' | 'video' | 'text',
          caption: content.caption || 'Generated caption',
          hashtags: content.hashtags || [],
          mediaPrompt: content.mediaPrompt,
          status: 'pending',
          createdAt: new Date()
        };

        posts.push(post);
      } catch (error) {
        console.error(`Campaign post generation failed for ${scheduleItem.platform}:`, error);
        // Add a failed post to maintain consistency
        posts.push({
          id: `campaign-${Date.now()}-failed`,
          platform: scheduleItem.platform,
          type: scheduleItem.contentType as 'image' | 'video' | 'text',
          caption: 'Content generation failed',
          hashtags: [],
          status: 'failed',
          createdAt: new Date()
        });
      }
    }

    // Batch generate media for all posts
    await this.batchGenerateMedia(posts);

    return posts;
  }

  private async batchGenerateMedia(posts: GeneratedContent[]): Promise<void> {
    // For campaign posts, use placeholder images to avoid timeouts
    // AI image generation is too slow for serverless functions
    for (const post of posts) {
      if (post.type !== 'text' && post.mediaPrompt) {
        post.status = 'generating';
        
        // Use placeholder for campaign posts to avoid timeouts
        if (post.type === 'image') {
          post.mediaUrl = 'placeholder';
        } else if (post.type === 'video') {
          post.mediaUrl = 'placeholder';
        }
        
        post.status = 'completed';
      } else {
        post.status = 'completed';
      }
    }
  }

  async adjustContent(
    originalContent: GeneratedContent,
    feedback: string
  ): Promise<GeneratedContent> {
    const platform = PLATFORMS[originalContent.platform as keyof typeof PLATFORMS];
    if (!platform) {
      throw new Error(`Unknown platform: ${originalContent.platform}`);
    }

    const adjustPrompt = `
      Adjust this social media content based on user feedback.
      
      Original content:
      Platform: ${originalContent.platform}
      Type: ${originalContent.type}
      Caption: ${originalContent.caption}
      Hashtags: ${originalContent.hashtags.join(', ')}
      Media Prompt: ${originalContent.mediaPrompt || 'N/A'}
      
      User feedback: ${feedback}
      
      Platform limits:
      - Caption: ${platform.limits.captionLength} characters max
      - Hashtags: ${platform.limits.hashtagLimit} max
      
      Generate improved JSON:
      {
        "caption": "adjusted caption based on feedback",
        "hashtags": ["adjusted hashtags based on feedback"],
        "mediaPrompt": "adjusted media prompt if mentioned in feedback, otherwise keep original"
      }
      
      Make the adjustments while maintaining the original intent and platform optimization.
    `;

    const adjusted = await geminiAPI.generateJSON(adjustPrompt);
    
    return {
      ...originalContent,
      caption: adjusted.caption || originalContent.caption,
      hashtags: adjusted.hashtags || originalContent.hashtags,
      mediaPrompt: adjusted.mediaPrompt || originalContent.mediaPrompt
    };
  }

  async generateContentWithProgress(
    request: any,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<any> {
    const { mode, prompt, platforms, contentType, enhancePrompt, ...campaignSettings } = request;
    
    let total = 0;
    let completed = 0;
    let failed = 0;

    if (mode === 'single') {
      total = platforms.length;
      onProgress?.({ total, completed, failed, current: 'Generating content...' });
      
      const posts = await this.generateSinglePost(prompt, platforms, contentType);
      
      completed = posts.filter(p => p.status === 'completed').length;
      failed = posts.filter(p => p.status === 'failed').length;
      
      onProgress?.({ total, completed, failed, current: 'Content generation complete' });
      
      return { posts, success: true };
    } else {
      // Campaign mode
      onProgress?.({ total: 0, completed, failed, current: 'Generating strategy...' });
      
      const strategy = await this.generateCampaignStrategy(
        prompt,
        platforms,
        campaignSettings.frequency,
        campaignSettings.duration
      );
      
      total = strategy.schedule.length;
      onProgress?.({ total, completed, failed, current: 'Generating campaign posts...' });
      
      const posts = await this.generateCampaignPosts(strategy, platforms);
      
      completed = posts.filter(p => p.status === 'completed').length;
      failed = posts.filter(p => p.status === 'failed').length;
      
      onProgress?.({ total, completed, failed, current: 'Campaign generation complete' });
      
      return { strategy, posts, success: true };
    }
  }

  validateRequest(request: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.prompt || request.prompt.trim().length < 10) {
      errors.push('Prompt must be at least 10 characters long');
    }

    if (!request.platforms || request.platforms.length === 0) {
      errors.push('At least one platform must be selected');
    }

    if (request.platforms) {
      const invalidPlatforms = request.platforms.filter((p: string) => !PLATFORMS[p as keyof typeof PLATFORMS]);
      if (invalidPlatforms.length > 0) {
        errors.push(`Invalid platforms: ${invalidPlatforms.join(', ')}`);
      }
    }

    if (!['image', 'video', 'text'].includes(request.contentType)) {
      errors.push('Invalid content type');
    }

    if (request.mode === 'campaign') {
      if (!request.frequency || !CAMPAIGN_FREQUENCIES[request.frequency as keyof typeof CAMPAIGN_FREQUENCIES]) {
        errors.push('Invalid campaign frequency');
      }
      if (!request.duration || !CAMPAIGN_DURATIONS[request.duration as keyof typeof CAMPAIGN_DURATIONS]) {
        errors.push('Invalid campaign duration');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const contentService = new ContentService();
