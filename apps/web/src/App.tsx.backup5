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
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';

// 🎯 MetaGipsy App.tsx - Updated July 19, 2025
// Production-ready with SEO integration and React 19 compatibility

// 🎯 Types for SEO data
interface SessionData {
  sessionId?: string;
  overallScore?: number;
  messageCount?: number;
  platform?: string;
}

type PageType = 'homepage' | 'analysis' | 'verify' | 'results' | 'dashboard' | 'settings' | 'pricing';
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
  }, [pageType]);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
              {/* ✅ ПУБЛИЧНАЯ СТРАНИЦА - доступна всем */}
              <Route path="/" element={<HomePage />} />
              
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
      
      {/* ✅ TOASTER CONFIGURATION - сохранена оригинальная настройка */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
};

// 🚀 Main App Component
function App() {
  useEffect(() => {
    // Initialize theme on app start
    initializeTheme();
    
    // Initialize SEO when app starts
    console.log('🚀 MetaGipsy App initialized with SEO optimization');
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

// 🎯 In VerifyPage.tsx - Update analysis type based on parsing results
import { updateSEOAnalysisType } from '@/App';

useEffect(() => {
  if (parsedMessages && parsedMessages.length > 0) {
    // Detect platform from conversation format
    const platform = detectPlatformFromMessages(parsedMessages);
    updateSEOAnalysisType(platform);
  }
}, [parsedMessages]);
*/