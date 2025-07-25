// apps/web/src/components/auth/AuthModal.tsx
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, ArrowRight } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  if (!isOpen) return null

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text)
    setMessageType(type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            showMessage(
              '📧 Please check your email and click the confirmation link before signing in.',
              'info'
            )
          } else if (error.message.includes('Invalid login credentials')) {
            showMessage('❌ Invalid email or password. Please check your credentials.', 'error')
          } else {
            showMessage(error.message, 'error')
          }
        } else {
          showMessage('✅ Welcome back! Redirecting...', 'success')
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 1000)
        }
      } else {
        // REGISTRATION
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          if (error.message.includes('User already registered')) {
            showMessage(
              '👤 This email is already registered. Try signing in instead, or check your email for a confirmation link.',
              'info'
            )
          } else {
            showMessage(error.message, 'error')
          }
        } else {
          showMessage(
            '🎉 Account created! Please check your email and click the confirmation link to activate your account.',
            'success'
          )
          // Не закрываем модал сразу - пусть пользователь прочитает инструкции
        }
      }
    } catch (error) {
      showMessage('❌ Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getMessageStyle = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'info':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
      case 'error':
        return <X className="w-4 h-4 mr-2 flex-shrink-0" />
      case 'info':
        return <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <Card className="relative w-full max-w-md border-border bg-card shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center flex items-center justify-between text-2xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isLogin ? 'Welcome Back' : 'Join MetaGipsy'}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose} 
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin 
              ? 'Sign in to analyze your AI conversations' 
              : 'Create account to start optimizing your AI interactions'
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email поле */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 bg-background border-input focus:border-primary"
                />
              </div>
            </div>

            {/* Password поле */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password {!isLogin && '(min 6 characters)'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="pl-10 pr-10 bg-background border-input focus:border-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Submit кнопка */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !email || password.length < 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  {!isLogin && <ArrowRight className="w-4 h-4 ml-2" />}
                </>
              )}
            </Button>

            {/* Сообщение об ошибке/успехе/инфо */}
            {message && (
              <div className={`text-sm p-3 rounded-lg border flex items-start ${getMessageStyle()}`}>
                {getMessageIcon()}
                <span className="flex-1">{message}</span>
              </div>
            )}

            {/* Переключение режима */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-primary hover:text-primary/80"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setMessage('')
                  setEmail('')
                  setPassword('')
                }}
                disabled={loading}
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </form>

          {/* Дополнительная информация */}
          <div className="pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>🎯 Free chess-style conversation analysis</p>
              <p>🤖 AI-powered improvement suggestions</p>
              <p>📊 Track your AI collaboration progress</p>
            </div>
          </div>

          {/* Помощь для новых пользователей */}
          {!isLogin && (
            <div className="pt-2 border-t border-border">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-600 mb-1">
                  📧 After registration:
                </h4>
                <ol className="text-xs text-blue-600 space-y-1">
                  <li>1. Check your email inbox</li>
                  <li>2. Click the confirmation link</li>
                  <li>3. You'll be redirected back here automatically</li>
                  <li>4. Start analyzing your conversations!</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}