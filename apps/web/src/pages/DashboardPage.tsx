import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target, 
  Trophy,
  Download,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';

// ✅ ENHANCED: SessionData with 5D Context support
interface SessionData {
  id: string;
  title?: string;
  platform: string;
  messageCount: number;
  overallScore: number;
  strategicAvg: number;
  tacticalAvg: number;
  cognitiveAvg: number;
  innovationAvg: number;
  contextAvg: number; // ✅ NEW: 5th dimension support
  trend?: 'improving' | 'declining' | 'stable' | 'volatile';
  createdAt: string;
  projectContext?: string;
  sessionGoal?: string;
}

// ✅ ENHANCED: AnalyticsData with 5D Context support
interface AnalyticsData {
  totalSessions: number;
  totalMessages: number;
  averageScore: number;
  improvementRate: number;
  dimensionAverages: {
    strategic: number;
    tactical: number;
    cognitive: number;
    innovation: number;
    context: number; // ✅ NEW: 5th dimension analytics
  };
  trendDistribution: Record<string, number>;
  platformDistribution: Record<string, number>;
  scoreHistory: Array<{
    date: string;
    score: number;
  }>;
}

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingSession, setExportingSession] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user sessions and analytics in parallel
      const [sessionsResponse, analyticsResponse] = await Promise.all([
        api.getUserSessions(user?.id, 1, 20), // First 20 sessions
        api.getUserAnalytics(30) // Last 30 days
      ]);

      setSessions(sessionsResponse.sessions || []);
      setAnalytics(analyticsResponse.analytics);

      console.log('✅ Dashboard data loaded:', {
        sessionsCount: sessionsResponse.sessions?.length || 0,
        analytics: analyticsResponse
      });

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session deleted successfully');
      
      // Refresh analytics after deletion
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    }
  };

  // ✅ CRITICAL FIX: Proper export with authentication
  const exportSession = async (sessionId: string, format: 'json' | 'csv' | 'markdown' = 'json') => {
    try {
      setExportingSession(sessionId);
      console.log('📁 EXPORT: Starting session export...', { sessionId, format });
      
      // ✅ Use proper API method with auth headers
      const blob = await api.exportSession(sessionId, format);
      
      // ✅ Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // ✅ Set proper filename based on format
      const extension = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'md';
      link.download = `session-${sessionId}.${extension}`;
      
      // ✅ Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // ✅ Clean up blob URL
      window.URL.revokeObjectURL(url);
      
      console.log('✅ EXPORT: Session exported successfully');
      toast.success(`Session exported as ${format.toUpperCase()}`);
      
    } catch (error) {
      console.error('❌ EXPORT: Failed to export session:', error);
      toast.error('Failed to export session. Please try again.');
    } finally {
      setExportingSession(null);
    }
  };

  // ✅ ENHANCED: View session with proper routing
  const viewSession = async (sessionId: string) => {
    try {
      console.log('👁️ VIEW SESSION: Opening session details...', { sessionId });
      
      // ✅ OPTION 1: Navigate to analyze page with session data (recommended)
      // This will work immediately with existing infrastructure
      window.location.href = `/analyze/results/${sessionId}`;
      
      // ✅ OPTION 2: Alternative - could open modal with session details
      // toast.info('Loading session details...');
      
    } catch (error) {
      console.error('❌ VIEW SESSION: Failed to open session:', error);
      toast.error('Failed to open session details');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Brilliant';
    if (score >= 70) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Work';
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      case 'volatile':
        return <BarChart3 className="w-4 h-4 text-orange-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  // ✅ ENHANCED: Best dimension analysis with 5D Context support
  const getBestDimension = () => {
    if (!analytics?.dimensionAverages || typeof analytics.dimensionAverages !== 'object') {
      return { name: 'Strategic', score: 0 };
    }

    try {
      const entries = Object.entries(analytics.dimensionAverages);
      if (entries.length === 0) {
        return { name: 'Strategic', score: 0 };
      }

      const sortedEntries = entries.sort(([,a], [,b]) => (b || 0) - (a || 0));
      const bestEntry = sortedEntries[0];
      
      if (!bestEntry || !bestEntry[0]) {
        return { name: 'Strategic', score: 0 };
      }

      const dimensionName = bestEntry[0].charAt(0).toUpperCase() + bestEntry[0].slice(1);
      const score = bestEntry[1] || 0;

      return { name: dimensionName, score: Math.round(score) };
    } catch (error) {
      console.error('❌ Error calculating best dimension:', error);
      return { name: 'Strategic', score: 0 };
    }
  };

  // ✅ ENHANCED: Get 5D dimension averages with Context support
  const getDimensionAverages = () => {
    if (!analytics?.dimensionAverages || typeof analytics.dimensionAverages !== 'object') {
      return {
        strategic: 0,
        tactical: 0,
        cognitive: 0,
        innovation: 0,
        context: 0 // ✅ NEW: Context dimension default
      };
    }

    return {
      strategic: analytics.dimensionAverages.strategic || 0,
      tactical: analytics.dimensionAverages.tactical || 0,
      cognitive: analytics.dimensionAverages.cognitive || 0,
      innovation: analytics.dimensionAverages.innovation || 0,
      context: analytics.dimensionAverages.context || 0 // ✅ NEW: Context dimension
    };
  };

  // ✅ NEW: 5D dimension configuration with icons and colors
  const dimensionConfig = {
    strategic: { icon: '🎯', color: 'text-purple-600', label: 'Strategic' },
    tactical: { icon: '⚡', color: 'text-blue-600', label: 'Tactical' },
    cognitive: { icon: '🧠', color: 'text-green-600', label: 'Cognitive' },
    innovation: { icon: '💡', color: 'text-yellow-600', label: 'Innovation' },
    context: { icon: '🧭', color: 'text-cyan-600', label: 'Context' } // ✅ NEW: Context with compass
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Please log in to view your dashboard</h2>
            <Button onClick={() => window.location.href = '/analyze'}>
              Go to Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your 5D dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-xl font-bold mb-4 text-red-600">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Get safe values
  const bestDimension = getBestDimension();
  const dimensionAverages = getDimensionAverages();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold">Your 5D Analysis Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Track your AI conversation improvement journey across 5 dimensions
        </p>
        
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Welcome back, {user?.email}! ✨ Now with Context dimension analysis
        </div>
      </motion.div>

      {/* Analytics Overview */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSessions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalMessages || 0} total messages analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageScore || 0}</div>
              <p className="text-xs text-muted-foreground">
                {getScoreLabel(analytics.averageScore || 0)} performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.improvementRate || 0) > 0 ? '+' : ''}{analytics.improvementRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs previous period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Dimension</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bestDimension.name}
              </div>
              <p className="text-xs text-muted-foreground">
                {bestDimension.score} average
                {bestDimension.name === 'Context' && ' 🧭'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ✅ ENHANCED: 5D Dimension Breakdown with Context support */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                5D Skill Dimensions
                <Badge variant="secondary" className="text-xs">
                  Context NEW
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(dimensionAverages).map(([dimension, score]) => {
                const config = dimensionConfig[dimension as keyof typeof dimensionConfig];
                return (
                  <div key={dimension} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <span className={`capitalize font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        {dimension === 'context' && (
                          <Badge variant="outline" className="text-xs bg-cyan-50 text-cyan-700 border-cyan-300">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">{Math.round(score || 0)}/100</span>
                    </div>
                    <Progress 
                      value={score || 0} 
                      className={`h-2 ${dimension === 'context' ? 'bg-cyan-100' : ''}`}
                    />
                    {dimension === 'context' && score > 0 && (
                      <p className="text-xs text-cyan-600">
                        Temporal understanding & state awareness
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ✅ ENHANCED: Session History with 5D Context support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent 5D Analyses
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/analyze'}
              >
                New Analysis
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No 5D analyses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start analyzing your AI conversations to see 5D insights here
                </p>
                <Button onClick={() => window.location.href = '/analyze'}>
                  Start Your First 5D Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium truncate">
                            {session.title || `${session.platform} Analysis`}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {session.platform}
                          </Badge>
                          {getTrendIcon(session.trend)}
                          {/* ✅ 5D indicator */}
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900 dark:to-cyan-900">
                            5D
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{session.messageCount} messages</span>
                          <span>•</span>
                          <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                          {session.projectContext && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-xs">{session.projectContext}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge 
                            className={`${getScoreColor(session.overallScore)} border`}
                          >
                            {session.overallScore}/100
                          </Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>🎯{Math.round(session.strategicAvg)}</span>
                            <span>⚡{Math.round(session.tacticalAvg)}</span>
                            <span>🧠{Math.round(session.cognitiveAvg)}</span>
                            <span>💡{Math.round(session.innovationAvg)}</span>
                            {/* ✅ NEW: Context dimension display */}
                            <span className="text-cyan-600 font-medium">
                              🧭{Math.round(session.contextAvg || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* ✅ FIXED: Working Eye button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewSession(session.id)}
                          title="View session details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportSession(session.id, 'json')}
                          disabled={exportingSession === session.id}
                          title="Export session"
                        >
                          {exportingSession === session.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this session?')) {
                              deleteSession(session.id);
                            }
                          }}
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {sessions.length >= 20 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement pagination
                        toast.info('Pagination coming soon!');
                      }}
                    >
                      Load More Sessions
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => window.location.href = '/analyze'}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              New 5D Analysis
              <span className="text-lg">🧭</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Analyze a new AI conversation with revolutionary 5D chess-style scoring
            </p>
            <Button className="w-full">Start 5D Analysis</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Download your 5D analysis data in various formats
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => toast.info('Bulk export coming soon!')}
            >
              Export All
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Customize your 5D analysis preferences and notifications
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/settings'}
            >
              Open Settings
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;