import type { Platform } from './types';

export const PLATFORMS: Record<string, Platform> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    limits: {
      captionLength: 2200,
      hashtagLimit: 30,
      videoLength: 60,
      imageRatio: '1:1'
    }
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok/Reels/Shorts',
    icon: '🎬',
    limits: {
      captionLength: 150,
      hashtagLimit: 20,
      videoLength: 30,
      imageRatio: '9:16'
    }
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    limits: {
      captionLength: 3000,
      hashtagLimit: 5,
      videoLength: 180,
      imageRatio: '16:9'
    }
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🐦',
    limits: {
      captionLength: 280,
      hashtagLimit: 2,
      videoLength: 140,
      imageRatio: '16:9'
    }
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    limits: {
      captionLength: 63206,
      hashtagLimit: 30,
      videoLength: 240,
      imageRatio: '16:9'
    }
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    limits: {
      captionLength: 5000,
      hashtagLimit: 15,
      videoLength: 600,
      imageRatio: '16:9'
    }
  }
};

export const CAMPAIGN_DURATIONS = {
  '1-week': 7,
  '2-weeks': 14,
  '1-month': 30,
  '3-months': 90,
  '6-months': 180
};

export const CAMPAIGN_FREQUENCIES = {
  'daily': 1,
  'every-2-days': 2,
  'weekly': 7,
  'bi-weekly': 14
};

export const CONTENT_TYPES = [
  { value: 'image', label: '📷 Image', description: 'Static images with captions' },
  { value: 'video', label: '🎬 Video', description: 'Short-form video content' },
  { value: 'text', label: '📝 Text Only', description: 'Text-based posts without media' }
];

export const CONTENT_MIX_OPTIONS = [
  { value: 'balanced', label: 'Balanced', description: 'Equal mix of all content types' },
  { value: 'image-heavy', label: 'Image Heavy', description: '70% images, 20% videos, 10% text' },
  { value: 'video-heavy', label: 'Video Heavy', description: '60% videos, 30% images, 10% text' },
  { value: 'text-heavy', label: 'Text Heavy', description: '50% text, 30% images, 20% videos' }
];

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'One post per day' },
  { value: 'every-2-days', label: 'Every 2 Days', description: 'One post every two days' },
  { value: 'weekly', label: 'Weekly', description: 'One post per week' },
  { value: 'bi-weekly', label: 'Bi-weekly', description: 'One post every two weeks' }
];

export const DURATION_OPTIONS = [
  { value: '1-week', label: '1 Week', description: '7 days of content' },
  { value: '2-weeks', label: '2 Weeks', description: '14 days of content' },
  { value: '1-month', label: '1 Month', description: '30 days of content' },
  { value: '3-months', label: '3 Months', description: '90 days of content' },
  { value: '6-months', label: '6 Months', description: '180 days of content' }
];

export const API_ENDPOINTS = {
  GEMINI_BASE: 'https://generativelanguage.googleapis.com/v1beta',
  KIE_BASE: 'https://kieai.erweima.ai',
  KIE_IMAGE_GENERATE: '/api/v1/gpt4o-image/generate',
  KIE_VIDEO_GENERATE: '/api/v1/veo/generate',
  KIE_IMAGE_STATUS: '/api/v1/gpt4o-image/record-info',
  KIE_VIDEO_STATUS: '/api/v1/veo/record-info'
};

export const RATE_LIMITS = {
  GEMINI: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_DAY: 1500,
    TOKENS_PER_MINUTE: 32000
  },
  KIE: {
    REQUESTS_PER_MINUTE: 100,
    REQUESTS_PER_DAY: 1000
  }
};

export const POLLING_CONFIG = {
  IMAGE_POLL_INTERVAL: 30000,  // 30 seconds as per KIE.ai docs
  VIDEO_POLL_INTERVAL: 30000,  // 30 seconds as per KIE.ai docs
  MAX_POLLING_ATTEMPTS: 30,    // 30 attempts × 30s = 15 minutes total
  RETRY_DELAY: 2000,
  PER_POLL_TIMEOUT: 10000,     // 10 seconds per poll request
  OVERALL_DEADLINE: 15 * 60 * 1000  // 15 minutes in milliseconds
};

export const ERROR_MESSAGES = {
  MISSING_API_KEY: 'API key is required',
  INVALID_REQUEST: 'Invalid request parameters',
  GENERATION_FAILED: 'Content generation failed',
  MEDIA_GENERATION_FAILED: 'Media generation failed',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred'
};

export const SUCCESS_MESSAGES = {
  CONTENT_GENERATED: 'Content generated successfully',
  CAMPAIGN_CREATED: 'Campaign created successfully',
  MEDIA_GENERATED: 'Media generated successfully',
  CONTENT_ADJUSTED: 'Content adjusted successfully'
};

export const DEFAULT_SETTINGS = {
  ENHANCE_PROMPT: true,
  CONTENT_TYPE: 'image' as const,
  CONTENT_MIX: 'balanced' as const,
  FREQUENCY: 'daily' as const,
  DURATION: '1-week' as const,
  MAX_RETRIES: 3,
  TIMEOUT: 30000
};
