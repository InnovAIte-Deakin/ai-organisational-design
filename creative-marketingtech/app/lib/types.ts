export interface Platform {
  id: string;
  name: string;
  icon: string;
  limits: {
    captionLength: number;
    hashtagLimit: number;
    videoLength: number;
    imageRatio: string;
  };
}

export interface CampaignSettings {
  frequency: 'daily' | 'every-2-days' | 'weekly' | 'bi-weekly';
  duration: '1-week' | '2-weeks' | '1-month' | '3-months' | '6-months' | 'custom';
  customDays?: number;
  contentMix: 'balanced' | 'image-heavy' | 'video-heavy' | 'text-heavy';
}

export interface GeneratedContent {
  id: string;
  platform: string;
  type: 'image' | 'video' | 'text';
  caption: string;
  hashtags: string[];
  mediaUrl?: string;
  mediaPrompt?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  strategy: CampaignStrategy;
  posts: GeneratedContent[];
  settings: CampaignSettings;
  status: 'draft' | 'generating' | 'ready' | 'published';
}

export interface CampaignStrategy {
  overview: string;
  contentPillars: string[];
  schedule: PostSchedule[];
  keyMessages: string[];
  visualGuidelines: string;
  hashtagStrategy: string[];
}

export interface PostSchedule {
  dayNumber: number;
  platform: string;
  contentType: string;
  topic: string;
  hook: string;
}

export interface GenerationRequest {
  prompt: string;
  platforms: string[];
  contentType: 'image' | 'video' | 'text';
  enhancePrompt?: boolean;
  frequency?: string;
  duration?: string;
  contentMix?: string;
}

export interface GenerationResponse {
  success: boolean;
  posts?: GeneratedContent[];
  strategy?: CampaignStrategy;
  error?: string;
}

export interface MediaGenerationRequest {
  prompt: string;
  type: 'image' | 'video';
  aspectRatio?: string;
  duration?: number;
  quality?: string;
}

export interface MediaGenerationResponse {
  success: boolean;
  mediaUrl?: string;
  taskId?: string;
  error?: string;
}

export interface PromptEnhancementRequest {
  prompt: string;
  platform: string;
  contentType: 'image' | 'video' | 'text';
}

export interface PromptEnhancementResponse {
  success: boolean;
  enhancedPrompt?: string;
  error?: string;
}

export interface ContentAdjustmentRequest {
  contentId: string;
  feedback: string;
}

export interface ContentAdjustmentResponse {
  success: boolean;
  adjustedContent?: GeneratedContent;
  error?: string;
}

export interface CampaignStrategyResponse {
  success: boolean;
  strategy?: CampaignStrategy;
  enhancedPrompt?: string;
  error?: string;
  details?: string;
}

export interface CampaignPostsResponse {
  success: boolean;
  posts?: GeneratedContent[];
  error?: string;
  details?: string;
}

export type CampaignStep = 'input' | 'strategy' | 'posts' | 'complete';

export interface WebhookPayload {
  taskId: string;
  status: 'completed' | 'failed';
  mediaUrl?: string;
  error?: string;
  type: 'image' | 'video';
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

export interface RateLimitInfo {
  requests: number;
  limit: number;
  resetTime: number;
}

export interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
}
