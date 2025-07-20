// 📈 SEO OPTIMIZATION FOR METAGIPSY OWL CHESS ENGINE - HYBRID APPROACH
// Использует уже загруженный GA4 из HTML, не дублирует инициализацию
// Enhanced meta tags, structured data, и page view tracking
// Updated: July 20, 2025 - Hybrid GA4 Strategy

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

const SEOOptimization: React.FC<SEOOptimizationProps> = ({ 
  pageType = 'homepage', 
  analysisType = null, 
  sessionData = null 
}) => {
  
  useEffect(() => {
    updateMetaTags(pageType, analysisType, sessionData);
    addStructuredData(pageType, analysisType);
    addCanonicalLink(pageType);
    
    // ✅ GA4 уже загружен из HTML, только трекаем page view
    trackPageView(pageType, analysisType, sessionData);
    
    console.log('📈 SEO updated for page:', pageType, { analysisType, sessionData });
  }, [pageType, analysisType, sessionData]);

  return null;
};

// 🏷️ UPDATE META TAGS DYNAMICALLY
const updateMetaTags = (
  pageType: string, 
  analysisType: string | null, 
  sessionData: SessionData | null
): void => {
  const metaData = getMetaData(pageType, analysisType, sessionData);
  
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
  const defaultImage = `${baseUrl}/favicon.svg`;
  
  switch (pageType) {
    case 'homepage':
      return {
        title: 'MetaGipsy - AI Conversation Analysis with Chess-Style 5D Scoring',
        description: 'World\'s first 5D conversation analysis platform. Transform your AI interactions with Strategic, Tactical, Cognitive, Innovation, and Context scoring. Professional chess-style evaluation for ChatGPT and Claude conversations.',
        keywords: 'AI conversation analysis, chess scoring, ChatGPT analysis, Claude analysis, conversation optimization, 5D scoring, AI interaction improvement, strategic thinking, tactical communication, cognitive load, innovation factor, context awareness, prompt engineering',
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
const getStructuredData = (pageType: string, analysisType: string | null) => {
  const baseStructuredData = {
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
      "Real-time conversation scoring and feedback"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
  
  // Add FAQ for homepage
  if (pageType === 'homepage') {
    baseStructuredData["@graph"] = [
      {
        "@type": "WebApplication",
        "name": "MetaGipsy",
        "description": baseStructuredData.description,
        "url": baseStructuredData.url,
        "applicationCategory": baseStructuredData.applicationCategory,
        "offers": baseStructuredData.offers,
        "provider": baseStructuredData.provider,
        "featureList": baseStructuredData.featureList,
        "aggregateRating": baseStructuredData.aggregateRating
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is 5D conversation analysis?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "5D conversation analysis evaluates AI interactions across five dimensions: Strategic (goal alignment), Tactical (clarity and specificity), Cognitive (mental load optimization), Innovation (creative thinking), and Context (temporal understanding). Each dimension is scored 0-100 with chess-style classifications."
            }
          },
          {
            "@type": "Question", 
            "name": "Which AI platforms are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "MetaGipsy supports analysis of conversations from Claude AI, ChatGPT, and other AI platforms with 95% accuracy parsing, including edit-retry patterns and complex conversation structures."
            }
          },
          {
            "@type": "Question",
            "name": "How does chess-style scoring work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We use chess notation: !! (Brilliant, 90-100), ! (Excellent, 80-89), + (Good, 70-79), = (Average, 50-69), ? (Mistake, 30-49), ?? (Blunder, 0-29). This provides intuitive understanding of interaction quality."
            }
          }
        ]
      }
    ];
  }
  
  return baseStructuredData;
};

// 📈 TRACK PAGE VIEW (использует уже загруженный GA4 из HTML)
const trackPageView = (
  pageType: string, 
  analysisType: string | null, 
  sessionData: SessionData | null
): void => {
  // ✅ GA4 уже загружен из HTML, просто используем
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      custom_parameter_1: analysisType || pageType,
      custom_parameter_2: sessionData?.overallScore || 0,
      custom_parameter_3: sessionData?.platform || 'web'
    });
    
    console.log('📊 GA4 Page view tracked:', pageType, analysisType);
  } else {
    console.log('📊 GA4 not available (should be loaded from HTML)');
  }
  
  // ✅ Используем готовые функции из HTML
  if (window.trackMetaGipsyEvent) {
    window.trackMetaGipsyEvent('page_view', 'Navigation', pageType, 1);
  }
};

// 📊 EXPORT TRACKING FUNCTIONS (используют уже загруженные из HTML)
export const trackCustomEvent = (eventName: string, parameters: any = {}): void => {
  // Используем готовую функцию из HTML если доступна
  if (window.trackMetaGipsyEvent) {
    window.trackMetaGipsyEvent(eventName, parameters.category || 'Custom', parameters.label || 'Event', parameters.value || 0);
  } else if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, {
      ...parameters,
      event_category: 'MetaGipsy',
      event_label: 'User Interaction'
    });
  }
  console.log('📊 Custom event tracked:', eventName, parameters);
};

export const trackConversationAnalysis = (platform: string, score: number, messageCount: number): void => {
  if (window.trackConversationAnalysis) {
    window.trackConversationAnalysis(platform, score, messageCount);
  }
};

export const trackSubscription = (tier: string, amount: number, stage: string): void => {
  if (window.trackSubscription) {
    window.trackSubscription(tier, amount, stage);
  }
};

// 🎯 DECLARE WINDOW TYPES
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    METAGIPSY_GA_ID: string;
    trackMetaGipsyEvent: (action: string, category: string, label: string, value: number) => void;
    trackConversationAnalysis: (platform: string, score: number, messageCount: number) => void;
    trackSubscription: (tier: string, amount: number, stage: string) => void;
  }
}

export default SEOOptimization;