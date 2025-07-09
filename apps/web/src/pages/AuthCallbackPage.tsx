// apps/web/src/pages/AuthCallbackPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CallbackStatus = 'loading' | 'success' | 'error' | 'expired';

export const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Получаем токены из URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorCode = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');

        console.log('🔐 Auth Callback received:', { type, error, errorCode });

        // Проверяем на ошибки
        if (error) {
          console.error('❌ Auth error:', { error, errorCode, errorDescription });
          
          if (errorCode === 'otp_expired') {
            setStatus('expired');
            setMessage('Your confirmation link has expired. Please sign up again to get a new link.');
          } else {
            setStatus('error');
            setMessage(errorDescription || 'Authentication failed. Please try again.');
          }
          return;
        }

        // Проверяем тип подтверждения
        if (type === 'signup') {
          console.log('📧 Processing email confirmation...');
          
          // Получаем сессию после подтверждения email
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Session error:', sessionError);
            setStatus('error');
            setMessage('Failed to establish session. Please try signing in again.');
            return;
          }

          if (session?.user) {
            console.log('✅ Email confirmed successfully for:', session.user.email);
            setUserEmail(session.user.email || '');
            setStatus('success');
            setMessage('Your email has been confirmed successfully! You can now access all features.');
            
            // Автоматический редирект через 3 секунды
            setTimeout(() => {
              navigate('/analyze', { replace: true });
            }, 3000);
          } else {
            setStatus('error');
            setMessage('Email confirmation failed. Please try signing in manually.');
          }
        } else {
          // Другие типы аутентификации
          setStatus('error');
          setMessage('Invalid authentication type.');
        }

      } catch (error) {
        console.error('❌ Callback processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/analyze', { replace: true });
    } else if (status === 'expired' || status === 'error') {
      navigate('/', { replace: true });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirming Your Email...';
      case 'success':
        return 'Email Confirmed!';
      case 'expired':
        return 'Link Expired';
      case 'error':
        return 'Confirmation Failed';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-2xl ${getStatusColor()}`}>
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Message */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              {message}
            </p>
            
            {userEmail && status === 'success' && (
              <p className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium">{userEmail}</span>!
              </p>
            )}
          </div>

          {/* Success Features */}
          {status === 'success' && (
            <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200">
                🎉 You now have access to:
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Chess-style conversation scoring</li>
                <li>• AI-powered analysis with Claude</li>
                <li>• Conversation history and analytics</li>
                <li>• Personal improvement insights</li>
              </ul>
            </div>
          )}

          {/* Loading Progress */}
          {status === 'loading' && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Processing your confirmation...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <>
                <Button 
                  onClick={handleContinue}
                  className="w-full"
                  size="lg"
                >
                  Start Analyzing Conversations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Redirecting automatically in 3 seconds...
                </p>
              </>
            )}

            {(status === 'error' || status === 'expired') && (
              <Button 
                onClick={handleContinue}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {status === 'expired' ? 'Try Again' : 'Back to Home'}
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact{' '}
              <a 
                href="mailto:support@metagipsy.com" 
                className="text-primary hover:underline"
              >
                support@metagipsy.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};