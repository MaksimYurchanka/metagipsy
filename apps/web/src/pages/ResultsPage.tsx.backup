import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, BarChart3, MessageSquare, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { useAnalysisStore } from '@/stores/analysisStore';
import { api } from '@/lib/api';

interface SessionResults {
  sessionId: string;
  title: string;
  platform: string;
  messageCount: number;
  overallScore: number;
  createdAt: string;
  metadata: {
    sessionGoal?: string;
    projectContext?: string;
    analysisMethod?: string;
    parsingMethod?: string;
    messages: any[];
    scores: any[];
    sessionSummary?: any;
  };
}

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  
  // ✅ STATE MANAGEMENT
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ STORE ACCESS
  const setMessages = useAnalysisStore(state => state.setMessages);
  const setScores = useAnalysisStore(state => state.setScores);
  const setSessionSummary = useAnalysisStore(state => state.setSessionSummary);
  const setSessionMetadata = useAnalysisStore(state => state.setSessionMetadata);
  const clearSession = useAnalysisStore(state => state.clearSession);

  // ✅ LOAD SESSION RESULTS
  useEffect(() => {
    const loadSessionResults = async () => {
      if (!sessionId) {
        setError('Invalid session ID');
        setIsLoading(false);
        return;
      }

      console.log('🔍 LOADING SESSION RESULTS:', sessionId);
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load session data from API
        const response = await api.getSession(sessionId);
        
        if (!response || !response.success) {
          throw new Error('Session not found or failed to load');
        }

        const sessionData = response.session;
        console.log('✅ SESSION DATA LOADED:', {
          sessionId,
          messageCount: sessionData.messageCount,
          overallScore: sessionData.overallScore,
          platform: sessionData.platform
        });

        // Set session results for display
        setSessionResults({
          sessionId,
          title: sessionData.title || `Analysis - ${sessionData.platform}`,
          platform: sessionData.platform,
          messageCount: sessionData.messageCount,
          overallScore: sessionData.overallScore,
          createdAt: sessionData.createdAt,
          metadata: sessionData.metadata || {}
        });

        // ✅ POPULATE STORE for AnalysisResults component
        clearSession(); // Clear previous data
        
        if (sessionData.metadata?.messages) {
          setMessages(sessionData.metadata.messages);
        }
        
        if (sessionData.metadata?.scores) {
          setScores(sessionData.metadata.scores);
        }
        
        if (sessionData.metadata?.sessionSummary) {
          setSessionSummary(sessionData.metadata.sessionSummary);
        }
        
        // Set session metadata
        setSessionMetadata({
          sessionId,
          platform: sessionData.platform,
          projectContext: sessionData.metadata?.projectContext,
          sessionGoal: sessionData.metadata?.sessionGoal,
          timestamp: sessionData.createdAt
        });

        console.log('✅ STORE POPULATED with session data');
        
      } catch (error) {
        console.error('❌ FAILED to load session:', error);
        setError(error instanceof Error ? error.message : 'Failed to load session');
        toast.error('Failed to load analysis results');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionResults();
  }, [sessionId, setMessages, setScores, setSessionSummary, setSessionMetadata, clearSession]);

  // ✅ NAVIGATION HANDLERS
  const handleNewAnalysis = () => {
    console.log('🚀 STARTING NEW ANALYSIS');
    clearSession();
    navigate('/analyze');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleExportResults = async () => {
    if (!sessionResults) return;
    
    try {
      console.log('📤 EXPORTING SESSION:', sessionId);
      
      const exportData = {
        sessionId: sessionResults.sessionId,
        title: sessionResults.title,
        platform: sessionResults.platform,
        messageCount: sessionResults.messageCount,
        overallScore: sessionResults.overallScore,
        createdAt: sessionResults.createdAt,
        messages: sessionResults.metadata.messages || [],
        scores: sessionResults.metadata.scores || [],
        sessionSummary: sessionResults.metadata.sessionSummary || {}
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `metagipsy-analysis-${sessionId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Analysis results exported successfully!');
      
    } catch (error) {
      console.error('❌ EXPORT ERROR:', error);
      toast.error('Failed to export results');
    }
  };

  const handleShareResults = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `MetaGipsy Analysis - ${sessionResults?.title}`,
        text: `Check out my conversation analysis results!`,
        url: url
      }).then(() => {
        toast.success('Shared successfully!');
      }).catch((error) => {
        console.log('Share failed:', error);
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <h2 className="text-xl font-semibold">Loading Analysis Results...</h2>
          <p className="text-muted-foreground">
            Retrieving your conversation analysis data
          </p>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error || !sessionResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="text-center p-8">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Analysis Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The requested analysis session could not be found.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleBackToDashboard} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button onClick={handleNewAnalysis}>
                <MessageSquare className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ✅ HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBackToDashboard} 
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Analysis Results</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleShareResults} 
              variant="outline" 
              size="sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button 
              onClick={handleExportResults} 
              variant="outline" 
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Session Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Results
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="bg-blue-950/50 border-blue-700">
              Session: {sessionResults.sessionId.slice(-8)}
            </Badge>
            
            <Badge variant="secondary">
              Platform: {sessionResults.platform}
            </Badge>
            
            <Badge variant="outline">
              {sessionResults.messageCount} messages
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`${
                sessionResults.overallScore >= 75 
                  ? 'bg-green-950/50 border-green-700 text-green-400' 
                  : sessionResults.overallScore >= 50
                  ? 'bg-yellow-950/50 border-yellow-700 text-yellow-400'
                  : 'bg-red-950/50 border-red-700 text-red-400'
              }`}
            >
              Score: {sessionResults.overallScore}
            </Badge>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date(sessionResults.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Session Goals & Context */}
          {(sessionResults.metadata.sessionGoal || sessionResults.metadata.projectContext) && (
            <div className="max-w-2xl mx-auto space-y-2">
              {sessionResults.metadata.sessionGoal && (
                <div className="text-center">
                  <span className="text-sm font-medium text-blue-400">Goal: </span>
                  <span className="text-sm text-muted-foreground">
                    {sessionResults.metadata.sessionGoal}
                  </span>
                </div>
              )}
              
              {sessionResults.metadata.projectContext && (
                <div className="text-center">
                  <span className="text-sm font-medium text-green-400">Context: </span>
                  <span className="text-sm text-muted-foreground">
                    {sessionResults.metadata.projectContext}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ✅ ANALYSIS RESULTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AnalysisResults />
      </motion.div>

      {/* ✅ BOTTOM ACTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-4 pt-8"
      >
        <div className="h-px bg-border" />
        
        <div className="flex items-center justify-center gap-4">
          <Button 
            onClick={handleNewAnalysis}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Analyze Another Conversation
          </Button>
          
          <Button 
            onClick={handleBackToDashboard} 
            variant="outline"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View All Analyses
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          ✨ Ready to analyze more conversations with MetaGipsy 5D Chess Engine
        </p>
      </motion.div>
    </div>
  );
};

export default ResultsPage;