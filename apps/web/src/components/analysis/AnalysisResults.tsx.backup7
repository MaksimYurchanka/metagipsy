import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, Download, Share2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MessageAnalysis from './MessageAnalysis';
import ScoreBadge from '@/components/common/ScoreBadge';
import { useAnalysisStore } from '@/stores/analysisStore';
import { 
  useCompactMode, 
  useAnimationsEnabled 
} from '@/stores/settingsStore';
import { cn, getTrendIcon, getTrendColor, getDimensionIcon } from '@/lib/utils';

type FilterType = 'all' | 'low' | 'high';
type SortType = 'index' | 'score';

// ✅ CRITICAL FIX: Create a completely isolated component that NEVER re-renders parent
const AnalysisResultsIsolated: React.FC = memo(() => {
  console.log('🚀 ANALYSIS RESULTS ISOLATED: Starting render...');
  
  // ✅ CRITICAL: Get ALL data in ONE selector to minimize subscriptions
  const storeData = useAnalysisStore((state) => ({
    messages: state.messages || [],
    scores: state.scores || [],
    patterns: state.patterns || [],
    insights: state.insights || [],
    sessionSummary: state.sessionSummary,
    isAnalyzing: state.isAnalyzing,
    error: state.error,
    // Get raw stats directly to avoid computed selectors
    rawStats: state._rawStats
  }));
  
  // ✅ CRITICAL: Destructure outside of render to avoid re-creating objects
  const { 
    messages, 
    scores, 
    patterns, 
    insights, 
    sessionSummary, 
    isAnalyzing, 
    error, 
    rawStats 
  } = storeData;
  
  // ✅ Individual settings selectors  
  const compactMode = useCompactMode();
  const animationsEnabled = useAnimationsEnabled();
  
  // ✅ Local state with STABLE initial values
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(() => new Set());
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('index');
  
  // Early return if no data
  if (messages.length === 0 || scores.length === 0) {
    console.log('📝 ANALYSIS RESULTS ISOLATED: No data, showing empty state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-2">♟️</div>
          <p className="text-muted-foreground">No analysis data available</p>
          <p className="text-sm text-muted-foreground mt-2">
            Paste a conversation to see detailed chess-style scoring
          </p>
        </div>
      </div>
    );
  }
  
  console.log('✅ ANALYSIS RESULTS ISOLATED: Data available, messages:', messages.length, 'scores:', scores.length);
  console.log('📊 ANALYSIS RESULTS ISOLATED: Raw stats:', rawStats);
  
  // ✅ CRITICAL FIX: STABLE callbacks with useCallback and empty deps
  const toggleExpanded = useCallback((index: number) => {
    console.log('🔄 Toggle expanded for message:', index);
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []); // ← ZERO dependencies = stable function!
  
  const expandAll = useCallback(() => {
    console.log('📂 Expand all messages');
    setExpandedMessages(new Set(Array.from({ length: messages.length }, (_, i) => i)));
  }, [messages.length]); // ← Only length dependency
  
  const collapseAll = useCallback(() => {
    console.log('📁 Collapse all messages');
    setExpandedMessages(new Set());
  }, []); // ← ZERO dependencies
  
  const handleFilterChange = useCallback((value: FilterType) => {
    console.log('🔍 Filter changed to:', value);
    setFilterBy(value);
  }, []); // ← ZERO dependencies
  
  const handleSortChange = useCallback((value: SortType) => {
    console.log('📊 Sort changed to:', value);
    setSortBy(value);
  }, []); // ← ZERO dependencies
  
  // ✅ CRITICAL FIX: Memoized computations with minimal dependencies
  const filteredMessages = useMemo(() => {
    console.log('🔍 Computing filtered messages, filter:', filterBy);
    return messages.filter((_, index) => {
      const score = scores[index];
      if (!score) return false;
      
      switch (filterBy) {
        case 'low':
          return score.overall < 60;
        case 'high':
          return score.overall >= 80;
        default:
          return true;
      }
    });
  }, [messages, scores, filterBy]); // ← Minimal dependencies
  
  const sortedMessages = useMemo(() => {
    console.log('📊 Computing sorted messages, sort:', sortBy);
    if (sortBy === 'index') {
      return filteredMessages;
    }
    
    return [...filteredMessages].sort((a, b) => {
      const aIndex = messages.indexOf(a);
      const bIndex = messages.indexOf(b);
      const aScore = scores[aIndex];
      const bScore = scores[bIndex];
      return (bScore?.overall || 0) - (aScore?.overall || 0);
    });
  }, [filteredMessages, sortBy, messages, scores]);
  
  // ✅ CRITICAL FIX: Memoized dimensions using rawStats directly
  const dimensions = useMemo(() => {
    console.log('📈 Computing dimensions from rawStats');
    return [
      { key: 'strategic', label: 'Strategic', value: rawStats.strategicAvg },
      { key: 'tactical', label: 'Tactical', value: rawStats.tacticalAvg },
      { key: 'cognitive', label: 'Cognitive', value: rawStats.cognitiveAvg },
      { key: 'innovation', label: 'Innovation', value: rawStats.innovationAvg }
    ];
  }, [rawStats.strategicAvg, rawStats.tacticalAvg, rawStats.cognitiveAvg, rawStats.innovationAvg]);
  
  // ✅ CRITICAL FIX: Memoized message components with stable toggleExpanded
  const messageComponents = useMemo(() => {
    console.log('🏗️ Building message components, count:', sortedMessages.length);
    return sortedMessages.map((message) => {
      const originalIndex = messages.indexOf(message);
      const score = scores[originalIndex];
      
      if (originalIndex === -1 || !score) {
        console.warn('⚠️ Invalid message or score for index:', originalIndex);
        return null;
      }
      
      return (
        <MessageAnalysis
          key={`message-${originalIndex}`}
          message={message}
          score={score}
          index={originalIndex}
          isExpanded={expandedMessages.has(originalIndex)}
          onToggle={toggleExpanded}
        />
      );
    }).filter(Boolean);
  }, [sortedMessages, messages, scores, expandedMessages, toggleExpanded]);
  
  console.log('✅ ANALYSIS RESULTS ISOLATED: Rendering with rawStats:', rawStats);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{Math.round(rawStats.averageScore)}</p>
              </div>
              <ScoreBadge score={rawStats.averageScore} size="lg" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTrendIcon(rawStats.trend)}</span>
                  <span className={cn("text-sm font-medium", getTrendColor(rawStats.trend))}>
                    {rawStats.trend.charAt(0).toUpperCase() + rawStats.trend.slice(1)}
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold">{Math.round(rawStats.bestScore)}</p>
              </div>
              <div className="text-green-500">
                <BarChart3 className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">{rawStats.totalMessages}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {rawStats.completedAnalysis}/{rawStats.totalMessages}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Tabs defaultValue="messages" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              <Eye className="h-4 w-4 mr-1" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              <Eye className="h-4 w-4 mr-1" />
              Collapse All
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
        
        <TabsContent value="messages" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filterBy} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="low">Low Scores (&lt;60)</SelectItem>
                <SelectItem value="high">High Scores (≥80)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index">By Order</SelectItem>
                <SelectItem value="score">By Score</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="outline">
              {filteredMessages.length} of {messages.length} messages
            </Badge>
          </div>
          
          {/* Messages List */}
          <div className="space-y-3">
            {messageComponents}
          </div>
        </TabsContent>
        
        <TabsContent value="dimensions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dimensions.map(({ key, label, value }) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getDimensionIcon(key)}</span>
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{Math.round(value)}</span>
                      <ScoreBadge score={value} dimension={key as any} size="lg" />
                    </div>
                    
                    {/* Individual message scores for this dimension */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Message Breakdown</h4>
                      <div className="grid grid-cols-5 gap-1">
                        {scores.map((score, index) => {
                          const dimValue = score.dimensions?.[key as keyof typeof score.dimensions] || 0;
                          return (
                            <div
                              key={index}
                              className="h-8 rounded flex items-center justify-center text-xs font-medium text-white"
                              style={{
                                backgroundColor: `hsl(${dimValue * 1.2}, 70%, 50%)`
                              }}
                              title={`Message ${index + 1}: ${Math.round(dimValue)}`}
                            >
                              {Math.round(dimValue)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-medium">Strengths</h4>
                    <p className="text-sm text-muted-foreground">
                      Strong strategic thinking and goal alignment
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-medium">Opportunities</h4>
                    <p className="text-sm text-muted-foreground">
                      Improve tactical clarity and specificity
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl mb-2">💡</div>
                    <h4 className="font-medium">Recommendations</h4>
                    <p className="text-sm text-muted-foreground">
                      Break complex requests into smaller parts
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Detailed Analysis</h4>
                  <div className="prose prose-sm max-w-none">
                    <p>
                      Your conversation shows strong strategic alignment with clear goals. 
                      The assistant responses demonstrate good understanding and provide 
                      actionable guidance. Consider being more specific in your initial 
                      requests to get even better results.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

// ✅ CRITICAL: Set display name for debugging
AnalysisResultsIsolated.displayName = 'AnalysisResultsIsolated';

// ✅ CRITICAL: Export the memoized component
export default AnalysisResultsIsolated;