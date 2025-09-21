import { GoogleGenerativeAI } from '@google/generative-ai';
import { RATE_LIMITS, ERROR_MESSAGES } from '../constants';
import type { ApiError, RateLimitInfo } from '../types';

class GeminiAPI {
  private client: GoogleGenerativeAI;
  private model: any;
  private requestQueue: Promise<any>[] = [];
  private requestCount = 0;
  private resetTime = Date.now() + 60000;
  private dailyRequestCount = 0;
  private dailyResetTime = Date.now() + 86400000; // 24 hours

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(ERROR_MESSAGES.MISSING_API_KEY);
    }
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset minute counter
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }

    // Reset daily counter
    if (now > this.dailyResetTime) {
      this.dailyRequestCount = 0;
      this.dailyResetTime = now + 86400000;
    }

    // Check minute rate limit
    if (this.requestCount >= RATE_LIMITS.GEMINI.REQUESTS_PER_MINUTE) {
      const waitTime = this.resetTime - now;
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }

    // Check daily rate limit
    if (this.dailyRequestCount >= RATE_LIMITS.GEMINI.REQUESTS_PER_DAY) {
      const waitTime = this.dailyResetTime - now;
      throw new Error(`Daily rate limit exceeded. Try again in ${Math.ceil(waitTime / 3600000)} hours.`);
    }

    this.requestCount++;
    this.dailyRequestCount++;
  }

  async generateContent(prompt: string, retries = 1): Promise<string> {
    await this.rateLimit();
    console.log('🤖 [GEMINI] Generating content, prompt length:', prompt.length);

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 [GEMINI] Attempt ${i + 1}/${retries}`);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('✅ [GEMINI] Content generated successfully, length:', text.length);
        return text;
      } catch (error: any) {
        console.error(`Gemini API attempt ${i + 1} failed:`, error);
        
        // Handle rate limits with retry instead of immediate failure
        if (error.message?.includes('quota') || error.message?.includes('rate') || error.message?.includes('Rate limit')) {
          if (i === retries - 1) {
            throw new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
          }
          console.log(`Rate limit hit, retrying in ${2000}ms...`);
          // Single retry with short wait
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        if (i === retries - 1) {
          throw new Error(error.message || ERROR_MESSAGES.GENERATION_FAILED);
        }
        
        // Single retry for other errors
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  async generateJSON(prompt: string, retries = 2): Promise<any> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON with no markdown formatting, no backticks, no explanations. The JSON should be properly formatted and parseable.`;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.generateContent(jsonPrompt);
        
        // Clean response of any potential formatting
        const cleaned = response
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/^[^{]*/, '') // Remove any text before the first {
          .replace(/[^}]*$/, '') // Remove any text after the last }
          .trim();
        
        return JSON.parse(cleaned);
      } catch (error: any) {
        console.error(`JSON generation attempt ${i + 1} failed:`, error);
        
        // If it's a rate limit, let the generateContent method handle retries
        if (error.message?.includes('Rate limit') || error.message?.includes('quota')) {
          if (i === retries - 1) {
            throw error; // Re-throw rate limit errors
          }
          continue;
        }
        
        // For JSON parsing errors, try again with a fresh request
        if (i === retries - 1) {
          console.error('JSON parse error after all retries:', error);
          throw new Error('Failed to parse Gemini response as JSON');
        }
        
        // Wait before retrying JSON parsing
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Failed to generate valid JSON after all retries');
  }

  async generateBatch(prompts: string[]): Promise<string[]> {
    const results: string[] = [];
    
    // Process in batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchPromises = batch.map(prompt => this.generateContent(prompt));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error(`Batch item ${i + index} failed:`, result.reason);
            results.push(''); // Add empty string for failed items
          }
        });
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error);
        // Add empty strings for the entire batch
        batch.forEach(() => results.push(''));
      }
    }
    
    return results;
  }

  getRateLimitInfo(): RateLimitInfo {
    const now = Date.now();
    const remainingRequests = Math.max(0, RATE_LIMITS.GEMINI.REQUESTS_PER_MINUTE - this.requestCount);
    const resetTime = this.resetTime;
    
    return {
      requests: this.requestCount,
      limit: RATE_LIMITS.GEMINI.REQUESTS_PER_MINUTE,
      resetTime: resetTime
    };
  }

  getDailyUsage(): { used: number; limit: number; resetTime: number } {
    return {
      used: this.dailyRequestCount,
      limit: RATE_LIMITS.GEMINI.REQUESTS_PER_DAY,
      resetTime: this.dailyResetTime
    };
  }

  async generateImage(prompt: string): Promise<string> {
    await this.rateLimit();

    // Add extra delay for image generation to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    const imageModel = this.client.getGenerativeModel({ 
      model: 'gemini-2.0-flash-preview-image-generation' 
    });

    try {
      const result = await imageModel.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        } as any
      });

      const response = await result.response;
      
      // Check if response has images
      if (response.candidates && response.candidates[0] && response.candidates[0].content.parts) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            console.log('Image generated successfully!');
            // Return the base64 data URL
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      // Fallback to placeholder if no image generated
      console.warn('No image generated, using placeholder');
      return 'placeholder';
      
    } catch (error: any) {
      console.error('Image generation failed:', error);
      
      // Handle rate limit errors with retry
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate')) {
        console.warn('Rate limit hit for image generation, waiting and retrying...');
        // Wait 5 seconds and try once more
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        try {
          const retryResult = await imageModel.generateContent({
            contents: [{
              role: "user",
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"]
            } as any
          });

          const retryResponse = await retryResult.response;
          
          if (retryResponse.candidates && retryResponse.candidates[0] && retryResponse.candidates[0].content.parts) {
            const parts = retryResponse.candidates[0].content.parts;
            for (const part of parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                console.log('Image generated on retry!');
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              }
            }
          }
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
        
        // If retry also fails, use placeholder
        return 'placeholder';
      }
      
      // Return placeholder for any other error
      return 'placeholder';
    }
  }

  async generateVideo(prompt: string): Promise<string> {
    await this.rateLimit();

    try {
      // Note: Veo 3 is not available yet, so we'll use a placeholder
      console.warn('Video generation not available yet, using placeholder');
      return `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`;
      
    } catch (error: any) {
      console.error('Video generation failed:', error);
      return `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`;
    }
  }
}

// Singleton instance
export const geminiAPI = new GeminiAPI();
