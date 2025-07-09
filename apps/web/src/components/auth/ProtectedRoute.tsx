// apps/web/src/components/auth/ProtectedRoute.tsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './AuthModal';
import { Lock, UserX } from 'lucide-react';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-6 p-6">
        {/* Иконка */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        {/* Заголовок */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">
            Sign in to access advanced AI conversation analysis with MetaGipsy Chess Engine
          </p>
        </div>

        {/* Преимущества */}
        <div className="space-y-3 text-left bg-card border rounded-lg p-4">
          <h3 className="font-semibold text-center mb-3">What you'll get:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Chess-style scoring (!! ! + = ? ??)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>4-dimension analysis (Strategic, Tactical, Cognitive, Innovation)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>AI-powered "better move" suggestions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Conversation history and analytics</span>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => setShowAuthModal(true)}
          >
            Sign In to Continue
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Free account • Takes 30 seconds • No credit card required
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