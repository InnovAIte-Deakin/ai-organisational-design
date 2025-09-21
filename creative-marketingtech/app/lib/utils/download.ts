import jsPDF from 'jspdf';
import type { CampaignStrategy } from '../types';

// Cadence brand colors
const CADENCE_COLORS = {
  primary: '#79F2C3',      // Digital Mint
  secondary: '#E6A6DE',    // Digital Mauve
  dark: '#0A2B1D',         // Dark text
  darkSecondary: '#361A32', // Dark secondary
  light: '#F8FFFE',        // Light background
  gray: '#6B7280',         // Gray text
  border: '#E5E7EB'        // Border color
};

export function downloadStrategyAsPDF(strategy: CampaignStrategy, campaignTitle: string = 'Campaign Strategy') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Helper function to add colored rectangle
  const addColoredRect = (x: number, y: number, width: number, height: number, color: string) => {
    doc.setFillColor(color);
    doc.rect(x, y, width, height, 'F');
  };
  
  // Helper function to add text with proper spacing
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const { fontSize = 10, fontStyle = 'normal', color = CADENCE_COLORS.dark, maxWidth = 170 } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color);
    
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.4)) + 5;
    } else {
      doc.text(text, x, y);
      return y + (fontSize * 0.4) + 5;
    }
  };
  
  // Helper function to add section header
  const addSectionHeader = (text: string, x: number, y: number) => {
    // Add colored accent bar
    addColoredRect(x - 5, y - 8, 4, 20, CADENCE_COLORS.primary);
    
    // Add section title
    addText(text, x, y, { fontSize: 16, fontStyle: 'bold', color: CADENCE_COLORS.dark });
    return y + 15;
  };
  
  // Helper function to add platform badge
  const addPlatformBadge = (platform: string, x: number, y: number) => {
    const platformColors: { [key: string]: string } = {
      'instagram': '#E4405F',
      'twitter': '#1DA1F2',
      'facebook': '#1877F2',
      'linkedin': '#0A66C2',
      'tiktok': '#000000',
      'youtube': '#FF0000'
    };
    
    const color = platformColors[platform.toLowerCase()] || CADENCE_COLORS.gray;
    const badgeWidth = 25;
    const badgeHeight = 8;
    
    // Badge background
    addColoredRect(x, y - 6, badgeWidth, badgeHeight, color);
    
    // Platform text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(platform.toUpperCase(), x + 2, y - 1);
    
    return x + badgeWidth + 5;
  };
  
  let currentY = 30;
  
  // Header with Cadence branding
  addColoredRect(0, 0, pageWidth, 25, CADENCE_COLORS.primary);
  
  // Cadence logo text
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CADENCE', 20, 15);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Social Media Strategy', 20, 20);
  
  // Date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated ${currentDate}`, pageWidth - 60, 20);
  
  currentY = 40;
  
  // Campaign Title
  addText(campaignTitle, 20, currentY, { 
    fontSize: 24, 
    fontStyle: 'bold', 
    color: CADENCE_COLORS.dark,
    maxWidth: pageWidth - 40
  });
  currentY += 20;
  
  // Overview Section
  currentY = addSectionHeader('CAMPAIGN OVERVIEW', 20, currentY);
  currentY = addText(strategy.overview, 20, currentY, { 
    fontSize: 11, 
    color: CADENCE_COLORS.dark,
    maxWidth: pageWidth - 40
  });
  currentY += 15;
  
  // Content Pillars Section
  currentY = addSectionHeader('CONTENT PILLARS', 20, currentY);
  strategy.contentPillars.forEach((pillar, index) => {
    // Pillar number
    addColoredRect(20, currentY - 6, 12, 12, CADENCE_COLORS.secondary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text((index + 1).toString(), 25, currentY - 1);
    
    // Pillar text
    addText(pillar, 40, currentY, { fontSize: 11, color: CADENCE_COLORS.dark });
    currentY += 12;
  });
  currentY += 10;
  
  // Key Messages Section
  currentY = addSectionHeader('KEY MESSAGES', 20, currentY);
  strategy.keyMessages.forEach((message, index) => {
    addText(`• ${message}`, 25, currentY, { fontSize: 11, color: CADENCE_COLORS.dark });
    currentY += 8;
  });
  currentY += 10;
  
  // Visual Guidelines Section
  currentY = addSectionHeader('VISUAL GUIDELINES', 20, currentY);
  currentY = addText(strategy.visualGuidelines, 20, currentY, { 
    fontSize: 11, 
    color: CADENCE_COLORS.dark,
    maxWidth: pageWidth - 40
  });
  currentY += 15;
  
  // Hashtag Strategy Section
  currentY = addSectionHeader('HASHTAG STRATEGY', 20, currentY);
  const hashtags = strategy.hashtagStrategy.join('  ');
  currentY = addText(hashtags, 20, currentY, { 
    fontSize: 10, 
    color: CADENCE_COLORS.gray,
    maxWidth: pageWidth - 40
  });
  currentY += 15;
  
  // Check if we need a new page for schedule
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = 30;
  }
  
  // Campaign Schedule Section
  currentY = addSectionHeader('CAMPAIGN SCHEDULE', 20, currentY);
  
  strategy.schedule.forEach((item, index) => {
    // Day header with colored background
    addColoredRect(20, currentY - 6, 30, 12, CADENCE_COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`DAY ${item.dayNumber}`, 25, currentY - 1);
    
    // Topic
    addText(item.topic, 60, currentY, { fontSize: 12, fontStyle: 'bold', color: CADENCE_COLORS.dark });
    currentY += 8;
    
    // Platform badge
    addPlatformBadge(item.platform, 60, currentY);
    
    // Content type
    addText(`• ${item.contentType.toUpperCase()}`, 90, currentY, { fontSize: 9, color: CADENCE_COLORS.gray });
    currentY += 8;
    
    // Hook
    addText(`"${item.hook}"`, 60, currentY, { 
      fontSize: 10, 
      color: CADENCE_COLORS.dark,
      maxWidth: pageWidth - 70
    });
    currentY += 15;
    
    // Add separator line
    if (index < strategy.schedule.length - 1) {
      doc.setDrawColor(CADENCE_COLORS.border);
      doc.line(20, currentY - 5, pageWidth - 20, currentY - 5);
      currentY += 5;
    }
  });
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer background
    addColoredRect(0, pageHeight - 20, pageWidth, 20, CADENCE_COLORS.light);
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(CADENCE_COLORS.gray);
    doc.text(`Generated by Cadence AI • Page ${i} of ${pageCount}`, 20, pageHeight - 10);
    doc.text('cadence-ai-campaign-tool.netlify.app', pageWidth - 80, pageHeight - 10);
  }
  
  // Download
  doc.save(`${campaignTitle.replace(/\s+/g, '_')}_Strategy.pdf`);
}

export function downloadStrategyAsMarkdown(strategy: CampaignStrategy, campaignTitle: string = 'Campaign Strategy') {
  const markdown = `# ${campaignTitle}

## Campaign Overview
${strategy.overview}

## Content Pillars
${strategy.contentPillars.map(pillar => `- ${pillar}`).join('\n')}

## Key Messages
${strategy.keyMessages.map(message => `- ${message}`).join('\n')}

## Visual Guidelines
${strategy.visualGuidelines}

## Hashtag Strategy
${strategy.hashtagStrategy.map(tag => `#${tag}`).join(' ')}

## Campaign Schedule
${strategy.schedule.map(item => `### Day ${item.dayNumber}: ${item.topic}
- **Platform:** ${item.platform}
- **Content Type:** ${item.contentType}
- **Hook:** ${item.hook}
`).join('\n')}

---
*Generated by Cadence AI - AI-Powered Social Media Content Generator*
`;

  // Create and download file
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${campaignTitle.replace(/\s+/g, '_')}_Strategy.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
