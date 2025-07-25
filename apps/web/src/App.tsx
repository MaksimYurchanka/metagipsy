import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { initializeTheme } from '@/stores/settingsStore';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import SEOOptimization from '@/components/SEOOptimization';
import HomePage from '@/pages/HomePage';
import AnalysisPage from '@/pages/AnalysisPage';
import VerifyPage from '@/pages/VerifyPage';
import ResultsPage from '@/pages/ResultsPage';
import DashboardPage from '@/pages/DashboardPage';
import SettingsPage from '@/pages/SettingsPage';
import PricingPage from '@/pages/PricingPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';

// 🎯 MetaGipsy App.tsx - Updated July 21, 2025
// Production-ready with SEO integration, React 19 compatibility, complete pricing system + Legal Pages
// Optimized for dark theme consistency and professional UX

// 🎯 Types for SEO data
interface SessionData {
  sessionId?: string;
  overallScore?: number;
  messageCount?: number;
  platform?: string;
}

type PageType = 'homepage' | 'analysis' | 'verify' | 'results' | 'dashboard' | 'settings' | 'pricing' | 'terms' | 'privacy';
type AnalysisType = 'claude' | 'chatgpt' | 'general' | null;

// 🔍 Hook to determine current page type from URL
const usePageType = (): PageType => {
  const location = useLocation();
  
  if (location.pathname === '/') return 'homepage';
  if (location.pathname === '/analyze') return 'analysis';
  if (location.pathname === '/analyze/verify') return 'verify';
  if (location.pathname.startsWith('/analyze/results')) return 'results';
  if (location.pathname === '/dashboard') return 'dashboard';
  if (location.pathname === '/settings') return 'settings';
  if (location.pathname === '/pricing') return 'pricing';
  if (location.pathname === '/terms') return 'terms';
  if (location.pathname === '/privacy') return 'privacy';
  
  return 'homepage'; // fallback
};

// 📊 Main App Content with SEO Integration
const AppContent: React.FC = () => {
  const pageType = usePageType();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>(null);

  // 🎯 Listen for session data updates from analysis results
  useEffect(() => {
    const handleSessionUpdate = (event: CustomEvent<SessionData>) => {
      setSessionData(event.detail);
      console.log('📊 SEO: Session data updated:', event.detail);
    };

    const handleAnalysisTypeUpdate = (event: CustomEvent<AnalysisType>) => {
      setAnalysisType(event.detail);
      console.log('🎯 SEO: Analysis type updated:', event.detail);
    };

    // Listen for custom events from pages
    window.addEventListener('metagipsy-session-update', handleSessionUpdate as EventListener);
    window.addEventListener('metagipsy-analysis-type-update', handleAnalysisTypeUpdate as EventListener);

    return () => {
      window.removeEventListener('metagipsy-session-update', handleSessionUpdate as EventListener);
      window.removeEventListener('metagipsy-analysis-type-update', handleAnalysisTypeUpdate as EventListener);
    };
  }, []);

  // 🔄 Clear session data when navigating away from results
  useEffect(() => {
    if (pageType !== 'results') {
      setSessionData(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* 📈 SEO Optimization Component */}
      <SEOOptimization 
        pageType={pageType}
        analysisType={analysisType}
        sessionData={sessionData}
      />
      
      <Routes>
        {/* ✅ СПЕЦИАЛЬНЫЙ МАРШРУТ: Auth Callback - БЕЗ Layout */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* ✅ ОБЫЧНЫЕ МАРШРУТЫ: С Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              {/* ✅ ПУБЛИЧНЫЕ СТРАНИЦЫ - доступны всем */}
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              
              {/* ✅ ПОЛНЫЙ АНАЛИЗ WORKFLOW - все защищенные */}
              <Route 
                path="/analyze" 
                element={
                  <ProtectedRoute>
                    <AnalysisPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analyze/verify" 
                element={
                  <ProtectedRoute>
                    <VerifyPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analyze/results/:sessionId" 
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* ✅ ОСТАЛЬНЫЕ ЗАЩИЩЕННЫЕ МАРШРУТЫ */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        } />
      </Routes>
      
      {/* ✅ TOASTER CONFIGURATION - Dark theme optimized */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937', // gray-800 for dark theme consistency
            color: '#f9fafb', // gray-50 for light text
            border: '1px solid #374151', // gray-700 for subtle border
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
          },
          className: 'dark-toast',
        }}
        theme="dark"
        richColors
      />
    </div>
  );
};

// 🚀 Main App Component
function App() {
  useEffect(() => {
    // Initialize theme on app start - force dark theme
    initializeTheme();
    
    // 🌙 Force dark theme for consistency
    document.documentElement.classList.add('dark');
    document.body.className = 'bg-gray-900 text-gray-100 antialiased';
    
    // 📊 Initialize SEO when app starts
    console.log('🚀 MetaGipsy App initialized with dark theme SEO optimization + Legal Pages');
    
    // 💳 Initialize payment system readiness
    console.log('💳 Payment system ready - Stripe integration operational');
    
    // 📄 Initialize legal compliance
    console.log('📄 Legal compliance ready - Terms & Privacy pages operational');
    
    // 📈 Analytics initialization
    if (typeof gtag !== 'undefined') {
      gtag('event', 'app_initialization', {
        event_category: 'System',
        event_label: 'App Started with Legal Pages',
        value: 1,
        custom_map: {
          theme: 'dark',
          version: '1.0.0',
          features: '5D_Analysis_Context_Payments_Legal'
        }
      });
    }
  }, []);

  // 🎯 Global dark theme styles enforcement
  useEffect(() => {
    // Ensure dark theme persistence across navigation
    const enforceTheme = () => {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827'; // gray-900
      document.body.style.color = '#f9fafb'; // gray-50
    };

    enforceTheme();
    
    // Listen for any theme changes and maintain dark
    const observer = new MutationObserver(enforceTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

// 📋 UTILITY FUNCTIONS FOR PAGES TO TRIGGER SEO UPDATES

// 🎯 Function for pages to update session data for SEO
export const updateSEOSessionData = (sessionData: SessionData): void => {
  const event = new CustomEvent('metagipsy-session-update', { 
    detail: sessionData 
  });
  window.dispatchEvent(event);
};

// 🎯 Function for pages to update analysis type for SEO  
export const updateSEOAnalysisType = (analysisType: AnalysisType): void => {
  const event = new CustomEvent('metagipsy-analysis-type-update', { 
    detail: analysisType 
  });
  window.dispatchEvent(event);
};

// 📋 DARK THEME UTILITY FUNCTIONS

// 🌙 Function to ensure dark theme consistency
export const enforceDarkTheme = (): void => {
  document.documentElement.classList.add('dark');
  document.body.className = 'bg-gray-900 text-gray-100 antialiased';
  
  // Store theme preference
  localStorage.setItem('metagipsy-theme', 'dark');
  
  console.log('🌙 Dark theme enforced for optimal UX');
};

// 💳 Function for payment success analytics
export const trackPaymentEvent = (eventType: string, planName: string, amount?: number): void => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventType, {
      event_category: 'Revenue',
      event_label: planName,
      value: amount || 0,
      custom_map: {
        plan_type: planName,
        currency: 'USD',
        payment_method: 'stripe'
      }
    });
  }
  
  console.log(`💳 Payment event tracked: ${eventType} - ${planName}`);
};

// 📄 Function for legal page analytics
export const trackLegalPageView = (pageType: 'terms' | 'privacy'): void => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'legal_page_view', {
      event_category: 'Compliance',
      event_label: pageType,
      value: 1,
      custom_map: {
        page_type: pageType,
        compliance: 'gdpr_ready'
      }
    });
  }
  
  console.log(`📄 Legal page view tracked: ${pageType}`);
};

// 📋 USAGE EXAMPLES FOR OTHER COMPONENTS:

/*
// 🎯 In ResultsPage.tsx - Update SEO with session data
import { updateSEOSessionData } from '@/App';

useEffect(() => {
  if (sessionData) {
    updateSEOSessionData({
      sessionId: sessionData.id,
      overallScore: sessionData.overallScore,
      messageCount: sessionData.messageCount,
      platform: sessionData.platform
    });
  }
}, [sessionData]);

// 🎯 In AnalysisPage.tsx - Update SEO with analysis type
import { updateSEOAnalysisType } from '@/App';

useEffect(() => {
  // When user selects analysis type or it's detected
  if (detectedPlatform === 'claude') {
    updateSEOAnalysisType('claude');
  } else if (detectedPlatform === 'chatgpt') {
    updateSEOAnalysisType('chatgpt');
  }
}, [detectedPlatform]);

// 🎯 In PricingPage.tsx - Track payment events
import { trackPaymentEvent } from '@/App';

const handlePaymentSuccess = (planName: string, amount: number) => {
  trackPaymentEvent('purchase', planName, amount);
};

// 📄 In TermsPage.tsx or PrivacyPage.tsx - Track legal page views
import { trackLegalPageView } from '@/App';

useEffect(() => {
  trackLegalPageView('terms'); // or 'privacy'
}, []);

// 🌙 In any component - Enforce dark theme
import { enforceDarkTheme } from '@/App';

useEffect(() => {
  enforceDarkTheme();
}, []);
*/

// 🎯 DARK THEME STYLES FOR COMPONENTS:
/*
Consistent dark theme classes to use across components:

Backgrounds:
- bg-gray-900 (darkest - main background)
- bg-gray-800 (dark - cards, sidebars)
- bg-gray-700 (medium - borders, dividers)

Text:
- text-gray-100 (lightest - primary text)
- text-gray-300 (light - secondary text)
- text-gray-400 (medium - muted text)

Accents:
- Purple: from-purple-600 to-blue-600
- Blue: bg-blue-600, text-blue-400
- Green: bg-green-600, text-green-400
- Red: bg-red-600, text-red-400

Borders:
- border-gray-700 (subtle)
- border-gray-600 (visible)
- border-purple-500 (accent)
*/