// apps/web/src/components/auth/ProtectedRoute.tsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './AuthModal';
import { Lock, Zap, Target, Brain, Lightbulb, Navigation, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  showFallback?: boolean; // Показывать fallback UI или сразу модал
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  showFallback = true 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!showFallback);

  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="space-y-2">
            <p className="text-slate-300 font-medium">Checking authentication...</p>
            <p className="text-slate-500 text-sm">Initializing MetaGipsy Chess Engine</p>
          </div>
        </div>
      </div>
    );
  }

  // Если пользователь авторизован - показываем контент
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Если НЕ авторизован и не показываем fallback - сразу модал
  if (!showFallback) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => {}} // Не даём закрыть
        onSuccess={() => setShowAuthModal(false)}
      />
    );
  }

  // Показываем красивый fallback UI для неавторизованных
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto space-y-8">
        
        {/* Главная карточка */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          
          {/* Header с анимацией */}
          <div className="text-center space-y-6 mb-8">
            {/* Animated Lock Icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse opacity-20" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                <Lock className="w-10 h-10 text-blue-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Заголовок */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Authentication Required
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                Unlock the world's most advanced AI conversation analysis platform
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>MetaGipsy OWL Chess Engine</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* 5D Analysis Features */}
          <div className="space-y-6 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-200 mb-2">
                Revolutionary 5D Analysis System
              </h3>
              <p className="text-slate-400 text-sm">
                World's first Context-aware conversation optimization
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Strategic */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-900/30 to-transparent rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-purple-300 font-medium">Strategic Analysis</h4>
                  <p className="text-slate-400 text-sm">Goal alignment & progress tracking</p>
                </div>
              </div>

              {/* Tactical */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-900/30 to-transparent rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-300 font-medium">Tactical Excellence</h4>
                  <p className="text-slate-400 text-sm">Clarity, specificity & actionability</p>
                </div>
              </div>

              {/* Cognitive */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-900/30 to-transparent rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-green-300 font-medium">Cognitive Optimization</h4>
                  <p className="text-slate-400 text-sm">Mental load management & timing</p>
                </div>
              </div>

              {/* Innovation */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-900/30 to-transparent rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-yellow-300 font-medium">Innovation Potential</h4>
                  <p className="text-slate-400 text-sm">Creativity & breakthrough thinking</p>
                </div>
              </div>

              {/* Context - BREAKTHROUGH DIMENSION */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-900/40 to-cyan-800/20 rounded-xl border-2 border-cyan-400/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent" />
                <div className="w-10 h-10 bg-cyan-500/30 rounded-full flex items-center justify-center relative">
                  <Navigation className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="flex-1 relative">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-cyan-200 font-semibold">Context Awareness</h4>
                    <span className="px-2 py-1 bg-cyan-500 text-cyan-950 text-xs font-bold rounded-full">NEW!</span>
                  </div>
                  <p className="text-slate-300 text-sm font-medium">Revolutionary temporal understanding</p>
                </div>
              </div>
            </div>

            {/* Chess Notation */}
            <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30">
              <h4 className="text-slate-200 font-medium mb-3 text-center">Chess-Style Scoring System</h4>
              <div className="flex justify-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">!!</div>
                  <div className="text-slate-400">Brilliant</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-lg">!</div>
                  <div className="text-slate-400">Excellent</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-lg">+</div>
                  <div className="text-slate-400">Good</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-lg">?</div>
                  <div className="text-slate-400">Mistake</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-bold text-lg">??</div>
                  <div className="text-slate-400">Blunder</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => setShowAuthModal(true)}
            >
              <Lock className="w-5 h-5 mr-2" />
              Unlock 5D Analysis
            </Button>
            
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">
                ✨ <strong>Free account</strong> • 30 seconds setup • No credit card required
              </p>
              <p className="text-slate-500 text-xs">
                Join thousands improving their AI collaboration by 2x
              </p>
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            Powered by Context Engineering breakthrough technology
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
};