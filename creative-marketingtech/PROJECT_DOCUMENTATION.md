# Cadence - AI-Powered Social Media Campaign Generator

> **Built for Innovalte | AI Organisational Design | Creative and Marketing Stream 2025**

## Project Overview

Cadence is a comprehensive, production-ready web application that generates AI-powered social media campaigns using Google's Gemini 2.0 Flash AI model. The platform enables users to create both single social media posts and complete multi-platform campaigns with intelligent prompt enhancement, media generation, and platform-specific optimization.

## Key Features

### **Dual Generation Modes**
- **Single Post Mode**: Generate individual posts for specific platforms
- **Full Campaign Mode**: Create comprehensive multi-day campaigns with strategic planning

### **AI-Powered Content Generation**
- **Text Generation**: Captions, hashtags, and strategic content using Gemini 2.0 Flash
- **Image Generation**: AI-generated visuals using Gemini's image generation capabilities
- **Video Generation**: Placeholder support for future video content (BETA)
- **Prompt Enhancement**: Intelligent prompt optimization for better results

### **Multi-Platform Support**
- **Instagram**: Visual content with extended captions (2,200 chars, 30 hashtags)
- **LinkedIn**: Professional content (3,000 chars, 5 hashtags)
- **Twitter/X**: Concise messaging (280 chars, 2 hashtags)
- **Facebook**: Long-form content (63,206 chars, 30 hashtags)
- **TikTok/Reels/Shorts**: Short-form video content (150 chars, 20 hashtags)
- **YouTube**: Video platform content (5,000 chars, 15 hashtags)

### **Campaign Management**
- **Strategic Planning**: AI-generated campaign strategies with content pillars
- **Content Scheduling**: Automated post scheduling across multiple days
- **Visual Guidelines**: AI-generated brand and visual direction
- **Hashtag Strategy**: Platform-optimized hashtag recommendations

### **Professional Output**
- **PDF Downloads**: Professional campaign strategy documents
- **Markdown Exports**: Developer-friendly strategy exports
- **Image Downloads**: Direct download of generated media
- **Copy Functionality**: One-click content copying

## Technical Architecture

### **Frontend Stack**
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with custom design system
- **Typography**: Geist font family (sans-serif for headers, mono for UI)
- **Icons**: Lucide React icons
- **State Management**: React hooks (useState)
- **Animations**: Custom CSS transitions and keyframes

### **Backend & APIs**
- **API Routes**: Next.js API routes for serverless functions
- **AI Integration**: Google Gemini 2.0 Flash via @google/generative-ai
- **Rate Limiting**: Built-in retry logic with exponential backoff
- **Error Handling**: Comprehensive error handling and fallbacks
- **Timeout Management**: 20-30 second timeouts for API calls

### **Design System: "Cadence"**
- **Primary Colors**: 
  - Digital Mint (`#79F2C3`) for Single Post mode
  - Digital Mauve (`#E6A6DE`) for Full Campaign mode
- **Typography**: Geist font family with consistent hierarchy
- **Layout**: Centered single-column design with 8pt grid system
- **Animations**: Smooth transitions with cubic-bezier easing
- **Brutalist Elements**: "CADENCE" pattern placeholders for media

## Content Generation Pipeline

### **1. Input Processing**
```
User Prompt → AI Enhancement (Optional) → Platform Selection → Content Type Selection
```

### **2. Single Post Generation Flow**
```
Enhanced Prompt → Gemini Text Generation → Platform-Specific Optimization → Media Generation → Content Assembly
```

### **3. Campaign Generation Flow**
```
Enhanced Prompt → Strategy Generation → Campaign Planning → Post Generation → Media Assignment → Content Assembly
```

### **4. Media Generation Process**
```
Media Prompt → Gemini Image Generation → Base64 Conversion → Fallback to Placeholders → Download Preparation
```

## Core Services

### **Content Generation Service** (`app/lib/services/content.ts`)
- **Prompt Enhancement**: AI-powered prompt optimization
- **Single Post Generation**: Individual post creation with platform optimization
- **Campaign Strategy Generation**: Multi-day campaign planning
- **Campaign Posts Generation**: Batch post creation from strategy
- **Media Generation**: AI image generation with fallback handling

### **Gemini API Client** (`app/lib/api/gemini.ts`)
- **Text Generation**: Content and strategy generation
- **Image Generation**: AI-powered visual content creation
- **Rate Limiting**: Built-in retry logic and delay management
- **Error Handling**: Comprehensive error management and fallbacks

### **Download Utilities** (`app/lib/utils/download.ts`)
- **PDF Generation**: Professional campaign strategy documents
- **Markdown Export**: Developer-friendly strategy exports
- **Image Downloads**: Client-side media download functionality

## Project Structure

```
cadence-ai-campaign-tool/
├── app/
│   ├── api/
│   │   ├── enhance/route.ts              # Prompt enhancement endpoint
│   │   ├── generate/
│   │   │   ├── single/route.ts           # Single post generation
│   │   │   ├── campaign/route.ts         # Full campaign generation
│   │   │   ├── campaign/strategy/route.ts # Campaign strategy only
│   │   │   └── campaign/posts/route.ts   # Campaign posts generation
│   │   └── ...
│   ├── lib/
│   │   ├── api/gemini.ts                 # Gemini API client
│   │   ├── services/content.ts           # Content generation logic
│   │   ├── types.ts                      # TypeScript interfaces
│   │   └── utils/download.ts             # Download utilities
│   ├── globals.css                       # Global styles and design system
│   ├── layout.tsx                        # Root layout component
│   └── page.tsx                          # Main application component
├── public/                               # Static assets
├── netlify.toml                          # Netlify configuration
├── package.json                          # Dependencies and scripts
└── PROJECT_DOCUMENTATION.md              # This documentation
```

## Deployment

### **Netlify Deployment**
- **URL**: https://cadence-ai-campaign-tool.netlify.app
- **Configuration**: `netlify.toml` with Next.js plugin
- **Environment Variables**: `GEMINI_API_KEY` for AI integration
- **Build Process**: `npm run build` with Next.js optimization

### **Environment Setup**
```bash
# Install dependencies
npm install

# Set environment variables
GEMINI_API_KEY=your_gemini_api_key_here

# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## API Endpoints

### **Content Generation**
- `POST /api/generate/single` - Generate single social media post
- `POST /api/generate/campaign` - Generate complete campaign
- `POST /api/generate/campaign/strategy` - Generate campaign strategy only
- `POST /api/generate/campaign/posts` - Generate campaign posts from strategy

### **Utility Endpoints**
- `POST /api/enhance` - Enhance user prompts with AI insights

## Performance Optimizations

### **Frontend Optimizations**
- **Static Generation**: Pre-rendered pages for faster loading
- **Image Optimization**: Optimized media handling
- **Code Splitting**: Lazy loading of components
- **CSS Optimization**: Tailwind CSS purging and minification

### **Backend Optimizations**
- **Rate Limiting**: Intelligent API call management
- **Caching**: Strategic caching of generated content
- **Timeout Management**: Prevents hanging requests
- **Error Recovery**: Graceful degradation and fallbacks

## Error Handling

### **Client-Side Error Handling**
- **Network Failures**: Automatic retry with exponential backoff
- **API Timeouts**: Graceful timeout handling
- **User Feedback**: Clear error messages and recovery options
- **Fallback Content**: Placeholder content when generation fails

### **Server-Side Error Handling**
- **Rate Limiting**: Intelligent retry logic for API limits
- **Validation**: Input validation and sanitization
- **Logging**: Comprehensive error logging for debugging
- **Graceful Degradation**: Fallback responses for failed requests

## Design Philosophy

### **"Cadence" Design System**
The application follows a cohesive design system called "Cadence" that emphasizes:

- **Modern Minimalism**: Clean, uncluttered interfaces
- **Brutalist Accents**: Bold typography and geometric elements
- **Dynamic Theming**: Color schemes that adapt to user context
- **Smooth Animations**: Fluid transitions that enhance user experience
- **Professional Polish**: Enterprise-grade visual design

### **Typography Hierarchy**
- **Headers**: Geist Sans (bold, various sizes)
- **UI Elements**: Geist Mono (monospace for consistency)
- **Body Text**: Geist Sans (readable, clean)
- **Placeholders**: Geist Sans (branded "CADENCE" patterns)

## Usage Statistics

### **Performance Metrics**
- **Build Time**: ~10-15 seconds
- **Bundle Size**: ~138KB (main page)
- **API Response Time**: 2-5 seconds average
- **Image Generation**: 3-8 seconds per image

### **Supported Content Types**
- **Text Posts**: All platforms
- **Image Posts**: Instagram, LinkedIn, Facebook, Twitter
- **Video Posts**: TikTok, YouTube (placeholder support)
- **Campaign Strategies**: 1 week to 6 months duration

## Future Enhancements

### **Planned Features**
- **Video Generation**: Full AI video content creation
- **Advanced Analytics**: Campaign performance tracking
- **Team Collaboration**: Multi-user campaign management
- **Brand Guidelines**: Custom brand integration
- **API Access**: Third-party integration capabilities

### **Technical Improvements**
- **Database Integration**: Persistent campaign storage
- **Real-time Updates**: Live campaign progress tracking
- **Advanced Caching**: Redis-based caching system
- **Microservices**: Service-oriented architecture

## Development

### **Development Setup**
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting consistency
- **Component Structure**: Functional components with hooks

## Conclusion

Cadence represents a comprehensive solution for AI-powered social media content generation, combining cutting-edge AI technology with intuitive user experience design. The platform successfully bridges the gap between creative ideation and technical execution, providing users with professional-grade social media campaigns at scale.

The application demonstrates advanced full-stack development practices, modern AI integration, and thoughtful user experience design, making it a powerful tool for content creators, marketers, and social media professionals.

---

**Built for Innovalte | AI Organisational Design | Creative and Marketing Stream 2025**
