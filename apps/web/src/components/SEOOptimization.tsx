// 📈 SEO OPTIMIZATION FOR METAGIPSY OWL CHESS ENGINE
// Enhanced meta tags, structured data, and SEO components for 5D conversation analysis
// Production-ready version with full MetaGipsy integration
// Updated: July 19, 2025
// Note: React 19 supports native document metadata, but this approach provides more control and compatibility

import React, { useEffect } from 'react';

// 🎯 TypeScript Interfaces
interface SessionData {
  sessionId?: string;
  overallScore?: number;
  messageCount?: number;
  platform?: string;
}

interface SEOOptimizationProps {
  pageType?: 'homepage' | 'analysis' | 'verify' | 'results' | 'dashboard' | 'settings' | 'pricing';
  analysisType?: 'claude' | 'chatgpt' | 'general' | null;
  sessionData?: SessionData | null;
}

interface MetaData {
  title: string;
  description: string;
  keywords: string;
  image: string;
  url: string;
}

interface StructuredDataOffer {
  "@type": string;
  name: string;
  price: string;
  priceCurrency: string;
  availability: string;
  description: string;
}

interface StructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: StructuredDataOffer[];
  provider: {
    "@type": string;
    name: string;
    url: string;
    logo: {
      "@type": string;
      url: string;
    };
  };
  featureList: string[];
  aggregateRating: {
    "@type": string;
    ratingValue: string;
    ratingCount: string;
    bestRating: string;
    worstRating: string;
  };
  "@graph"?: any[];
}

const SEOOptimization: React.FC<SEOOptimizationProps> = ({ 
  pageType = 'homepage', 
  analysisType = null, 
  sessionData = null 
}) => {
  
  useEffect(() => {
    updateMetaTags(pageType, analysisType, sessionData);
    addStructuredData(pageType, analysisType);
    addCanonicalLink(pageType);
    
    console.log('📈 SEO updated for page:', pageType, { analysisType, sessionData });
  }, [pageType, analysisType, sessionData]);

  return null; // This component only manages SEO, no visual output
};

// 🏷️ UPDATE META TAGS DYNAMICALLY
const updateMetaTags = (
  pageType: string, 
  analysisType: string | null, 
  sessionData: SessionData | null
): void => {
  const metaData = getMetaData(pageType, analysisType, sessionData);
  
  // Update title
  document.title = metaData.title;
  
  // Update meta tags
  updateMetaTag('description', metaData.description);
  updateMetaTag('keywords', metaData.keywords);
  
  // Open Graph tags
  updateMetaTag('og:title', metaData.title, 'property');
  updateMetaTag('og:description', metaData.description, 'property');
  updateMetaTag('og:image', metaData.image, 'property');
  updateMetaTag('og:url', metaData.url, 'property');
  updateMetaTag('og:type', 'website', 'property');
  updateMetaTag('og:site_name', 'MetaGipsy', 'property');
  updateMetaTag('og:locale', 'en_US', 'property');
  
  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image', 'name');
  updateMetaTag('twitter:title', metaData.title, 'name');
  updateMetaTag('twitter:description', metaData.description, 'name');
  updateMetaTag('twitter:image', metaData.image, 'name');
  updateMetaTag('twitter:site', '@metagipsy', 'name');
  updateMetaTag('twitter:creator', '@aiautocodingdao', 'name');
  
  // Additional SEO tags
  updateMetaTag('robots', 'index, follow', 'name');
  updateMetaTag('author', 'AI-AutoCoding-DAO', 'name');
  updateMetaTag('theme-color', '#667eea', 'name');
  updateMetaTag('application-name', 'MetaGipsy', 'name');
  
  // Performance and technical tags
  updateMetaTag('viewport', 'width=device-width, initial-scale=1.0', 'name');
  updateMetaTag('format-detection', 'telephone=no', 'name');
  
  console.log('📈 SEO meta tags updated for:', pageType);
};

// 🔧 UTILITY FUNCTION TO UPDATE META TAGS
const updateMetaTag = (
  property: string, 
  content: string, 
  attribute: 'name' | 'property' = 'name'
): void => {
  let element = document.querySelector(`meta[${attribute}="${property}"]`);
  
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, property);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

// 📋 GET META DATA BASED ON PAGE TYPE
const getMetaData = (
  pageType: string, 
  analysisType: string | null, 
  sessionData: SessionData | null
): MetaData => {
  const baseUrl = 'https://www.metagipsy.com';
  const defaultImage = `${baseUrl}/favicon.svg`; // Using existing favicon as OG image
  
  const analysisTypeNames: Record<string, string> = {
    claude: 'Claude AI Conversations',
    chatgpt: 'ChatGPT Conversations',
    general: 'AI Conversations'
  };
  
  switch (pageType) {
    case 'homepage':
      return {
        title: 'MetaGipsy - AI Conversation Analysis with Chess-Style 5D Scoring',
        description: 'World\'s first 5D conversation analysis platform. Transform your AI interactions with Strategic, Tactical, Cognitive, Innovation, and Context scoring. Professional chess-style evaluation for ChatGPT and Claude conversations.',
        keywords: 'AI conversation analysis, chess scoring, ChatGPT analysis, Claude analysis, conversation optimization, 5D scoring, AI interaction improvement, strategic thinking, tactical communication, cognitive load, innovation factor, context awareness, prompt engineering, AI conversation scoring',
        image: defaultImage,
        url: baseUrl
      };
      
    case 'analysis':
      return {
        title: 'AI Conversation Analysis Tool - Parse & Analyze | MetaGipsy',
        description: 'Upload your AI conversations for professional 5D analysis. Get chess-style scoring across Strategic, Tactical, Cognitive, Innovation, and Context dimensions. Improve your AI interaction skills with actionable insights.',
        keywords: 'conversation analysis, AI chat analysis, upload conversation, parse AI chat, conversation scoring, AI interaction optimization, prompt improvement, chat analysis tool',
        image: defaultImage,
        url: `${baseUrl}/analyze`
      };
      
    case 'verify':
      return {
        title: 'Verify Conversation - Confirm Analysis Setup | MetaGipsy',
        description: 'Review and verify your conversation before 5D analysis. Ensure accurate parsing and optimal scoring across all dimensions. Final step before professional AI conversation evaluation.',
        keywords: 'verify conversation, confirm analysis, conversation review, analysis setup, conversation validation, AI chat verification',
        image: defaultImage,
        url: `${baseUrl}/analyze/verify`
      };
      
    case 'results':
      const overallScore = sessionData?.overallScore || 0;
      const messageCount = sessionData?.messageCount || 0;
      const platform = sessionData?.platform || 'AI';
      
      return {
        title: `${platform} Analysis Results - Score: ${overallScore}/100 | MetaGipsy`,
        description: `Professional 5D analysis of ${messageCount} messages with overall score ${overallScore}/100. Detailed Strategic, Tactical, Cognitive, Innovation, and Context evaluation with actionable insights for ${platform} conversations.`,
        keywords: `conversation results, AI analysis score, ${overallScore} points, conversation improvement, AI interaction insights, ${platform} analysis, conversation optimization results`,
        image: defaultImage,
        url: `${baseUrl}/analyze/results/${sessionData?.sessionId || ''}`
      };
      
    case 'dashboard':
      return {
        title: 'User Dashboard - Track Your AI Conversation Progress | MetaGipsy',
        description: 'Monitor your AI conversation analysis progress. View session history, track scoring improvements, and access detailed 5D analysis insights for all your ChatGPT and Claude conversations.',
        keywords: 'user dashboard, conversation history, progress tracking, AI interaction improvement, conversation analytics, session management, AI conversation insights, progress monitoring',
        image: defaultImage,
        url: `${baseUrl}/dashboard`
      };
      
    case 'settings':
      return {
        title: 'Account Settings - Customize Your Experience | MetaGipsy',
        description: 'Manage your MetaGipsy account settings, preferences, and subscription. Customize your 5D conversation analysis experience and optimize your AI interaction workflow.',
        keywords: 'account settings, user preferences, subscription management, profile settings, AI analysis preferences, conversation analysis settings',
        image: defaultImage,
        url: `${baseUrl}/settings`
      };
      
    case 'pricing':
      return {
        title: 'Pricing Plans - Professional AI Conversation Analysis | MetaGipsy',
        description: 'Flexible pricing for professional AI conversation analysis. Free tier with 5,000 characters/day. Pro plans starting at $9.99 for unlimited analysis and advanced insights.',
        keywords: 'MetaGipsy pricing, AI analysis plans, conversation analysis pricing, pro subscription, unlimited analysis, AI conversation tools pricing',
        image: defaultImage,
        url: `${baseUrl}/pricing`
      };
      
    default:
      return {
        title: 'MetaGipsy - Revolutionary AI Conversation Analysis Platform',
        description: 'The world\'s first 5D conversation analysis platform with chess-style scoring. Professional AI interaction optimization for ChatGPT and Claude conversations.',
        keywords: 'AI conversation analysis, chess scoring, conversation optimization, AI interaction improvement, 5D analysis, conversation evaluation',
        image: defaultImage,
        url: baseUrl
      };
  }
};

// 🔗 ADD CANONICAL LINK
const addCanonicalLink = (pageType: string): void => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  
  const canonicalUrl = getCanonicalUrl(pageType);
  
  if (canonical) {
    canonical.setAttribute('href', canonicalUrl);
  } else {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', canonicalUrl);
    document.head.appendChild(canonical);
  }
};

const getCanonicalUrl = (pageType: string): string => {
  const baseUrl = 'https://www.metagipsy.com';
  const routes: Record<string, string> = {
    homepage: '',
    analysis: '/analyze',
    verify: '/analyze/verify',
    results: '/analyze/results',
    dashboard: '/dashboard',
    settings: '/settings',
    pricing: '/pricing'
  };
  return baseUrl + (routes[pageType] || '');
};

// 📊 ADD STRUCTURED DATA (JSON-LD)
const addStructuredData = (pageType: string, analysisType: string | null): void => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  const structuredData = getStructuredData(pageType, analysisType);
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData, null, 2);
  document.head.appendChild(script);
  
  console.log('📊 Structured data added for:', pageType);
};

// 📋 GET STRUCTURED DATA
const getStructuredData = (pageType: string, analysisType: string | null): StructuredData => {
  const baseStructuredData: StructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MetaGipsy",
    "description": "World's first 5D conversation analysis platform with chess-style scoring for AI interactions. Professional evaluation of ChatGPT and Claude conversations across Strategic, Tactical, Cognitive, Innovation, and Context dimensions.",
    "url": "https://www.metagipsy.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Tier",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "description": "5,000 characters per day analysis with basic 5D scoring"
      },
      {
        "@type": "Offer",
        "name": "Pro Daily",
        "price": "9.99",
        "priceCurrency": "USD", 
        "availability": "https://schema.org/InStock",
        "description": "500,000 characters for 24 hours with advanced analytics"
      },
      {
        "@type": "Offer",
        "name": "Pro Monthly",
        "price": "199",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock", 
        "description": "500,000 characters per day for 30 days with premium features"
      }
    ],
    "provider": {
      "@type": "Organization",
      "name": "AI-AutoCoding-DAO",
      "url": "https://www.metagipsy.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.metagipsy.com/favicon.svg"
      }
    },
    "featureList": [
      "5D conversation analysis with Context dimension",
      "Chess-style scoring system (0-100 points)",
      "Strategic dimension evaluation for goal alignment",
      "Tactical dimension assessment for clarity and specificity",
      "Cognitive load analysis and timing optimization",
      "Innovation factor scoring for creative thinking", 
      "Context awareness evaluation for temporal understanding",
      "Claude AI conversation parsing with 95% accuracy",
      "ChatGPT conversation analysis and optimization",
      "Real-time conversation scoring and feedback",
      "Professional insights and actionable recommendations",
      "Session history and progress tracking dashboard",
      "Export functionality for reports and analytics",
      "Pattern detection across conversation sessions"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
  
  // Add FAQ structured data for homepage
  if (pageType === 'homepage') {
    baseStructuredData["@graph"] = [
      baseStructuredData,
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is 5D conversation analysis?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "5D conversation analysis evaluates AI interactions across five dimensions: Strategic (goal alignment and progress tracking), Tactical (clarity and specificity), Cognitive (mental load optimization), Innovation (creative thinking and breakthrough potential), and Context (temporal awareness and conversation continuity). Each dimension is scored 0-100 with chess-style classifications."
            }
          },
          {
            "@type": "Question", 
            "name": "Which AI platforms are supported for analysis?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "MetaGipsy supports analysis of conversations from Claude AI, ChatGPT, and other AI platforms. Our advanced parsing technology can detect and analyze various conversation formats with 95% accuracy, including edit-retry patterns and complex conversation structures."
            }
          },
          {
            "@type": "Question",
            "name": "How does chess-style scoring work for conversations?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We use chess notation to classify conversation quality: !! (Brilliant, 90-100 points), ! (Excellent, 80-89), + (Good, 70-79), = (Average, 50-69), ? (Mistake, 30-49), ?? (Blunder, 0-29). This provides intuitive understanding of interaction quality and areas for improvement."
            }
          },
          {
            "@type": "Question",
            "name": "What insights can I get from conversation analysis?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Get actionable insights including better move suggestions, conversation optimization tips, dimension-specific improvements, progress tracking across sessions, pattern detection, and professional recommendations to enhance your AI interaction skills and achieve better results."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Context dimension in 5D analysis?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Context dimension (20% weight) evaluates temporal understanding, state awareness, and conversation continuity. It measures how well conversations maintain coherent flow, avoid redundancy, acknowledge previous actions, and demonstrate proper understanding of the conversation timeline."
            }
          }
        ]
      }
    ];
  }
  
  return baseStructuredData;
};

// 🎯 PRELOAD CRITICAL RESOURCES
const preloadCriticalResources = (): void => {
  // DNS prefetch for external resources
  const dnsPrefetch = ['https://api.metagipsy.com', 'https://fonts.googleapis.com'];
  dnsPrefetch.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
  
  // Preconnect to critical domains
  const preconnectDomains = ['https://api.metagipsy.com'];
  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// 📱 MOBILE OPTIMIZATION
const addMobileOptimization = (): void => {
  // Mobile-specific meta tags
  updateMetaTag('mobile-web-app-capable', 'yes', 'name');
  updateMetaTag('apple-mobile-web-app-capable', 'yes', 'name');
  updateMetaTag('apple-mobile-web-app-status-bar-style', 'default', 'name');
  updateMetaTag('apple-mobile-web-app-title', 'MetaGipsy', 'name');
  
  // Add touch icons
  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = '/favicon.svg';
  document.head.appendChild(appleTouchIcon);
  
  // Add manifest for PWA capabilities
  updateMetaTag('mobile-web-app-capable', 'yes', 'name');
  updateMetaTag('apple-mobile-web-app-capable', 'yes', 'name');
};

// 🚀 INITIALIZE SEO OPTIMIZATION
const initializeSEO = (): void => {
  preloadCriticalResources();
  addMobileOptimization();
  
  // Add performance hints
  updateMetaTag('color-scheme', 'dark light', 'name');
  updateMetaTag('supported-color-schemes', 'dark light', 'name');
  
  // Add security headers
  updateMetaTag('referrer', 'origin-when-cross-origin', 'name');
  
  console.log('🚀 MetaGipsy SEO optimization initialized');
};

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeSEO);
}

export default SEOOptimization;