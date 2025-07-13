import React, { useState, useMemo, useCallback } from 'react';
import { BarChart3, TrendingUp, Eye, Download, Share2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MessageAnalysis from './MessageAnalysis';
import ScoreBadge from '@/components/common/ScoreBadge';
import { useAnalysisStore } from '@/stores/analysisStore';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'low' | 'high';
type SortType = 'index' | 'score';

// ✅ CRITICAL FIX: Use individual primitive selectors to avoid object recreation
const AnalysisResults: React.FC = () => {
  console.log('🚀 ANALYSIS RESULTS PRIMITIVE: Starting render...');
  
  // ✅ PRIMITIVE SELECTORS - Each returns a primitive value, no objects
  const messages = useAnalysisStore((state) => state.messages || []);
  const scores = useAnalysisStore((state) => state.scores || []);
  const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing);
  
  // ✅ PRIMITIVE STATS - Individual primitive values
  const averageScore = useAnalysisStore((state) => state._rawStats?.averageScore || 0);
  const bestScore = useAnalysisStore((state) => state._rawStats?.bestScore || 0);
  const totalMessages = useAnalysisStore((state) => state._rawStats?.totalMessages || 0);
  const completedAnalysis = useAnalysisStore((state) => state._rawStats?.completedAnalysis || 0);
  const trend = useAnalysisStore((state) => state._rawStats?.trend || 'stable');
  const strategicAvg = useAnalysisStore((state) => state._rawStats?.strategicAvg || 0);
  const tacticalAvg = useAnalysisStore((state) => state._rawStats?.tacticalAvg || 0);
  const cognitiveAvg = useAnalysisStore((state) => state._rawStats?.cognitiveAvg || 0);
  const innovationAvg = useAnalysisStore((state) => state._rawStats?.innovationAvg || 0);
  
  console.log('📊 PRIMITIVE VALUES:', { 
    messagesCount: messages.length, 
    scoresCount: scores.length, 
    avgScore: averageScore,
    totalMsgs: totalMessages 
  });
  
  // ✅ Local state with STABLE initial values
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(() => new Set());
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('index');
  
  // ✅ NO EARLY RETURN - Always render something to avoid conditional hooks
  const hasData = messages.length > 0 && scores.length > 0;
  
  console.log('✅ HAS DATA CHECK:', hasData, 'messages:', messages.length, 'scores:', scores.length);
  
  // ✅ CRITICAL FIX: STABLE callbacks with ZERO dependencies
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
    setExpandedMessages(new Set(Array.from({ length: totalMessages }, (_, i) => i)));
  }, [totalMessages]); // ← Only primitive dependency
  
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
  
  // ✅ CRITICAL FIX: Memoized computations with minimal primitive dependencies
  const filteredMessages = useMemo(() => {
    console.log('🔍 Computing filtered messages, filter:', filterBy, 'hasData:', hasData);
    if (!hasData) return [];
    
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
  }, [messages, scores, filterBy, hasData]); // ← Minimal dependencies
  
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
  
  // ✅ CRITICAL FIX: Dimensions using individual primitive values
  const dimensions = useMemo(() => {
    console.log('📈 Computing dimensions from primitive values');
    return [
      { key: 'strategic', label: 'Strategic', value: strategicAvg, icon: '🎯' },
      { key: 'tactical', label: 'Tactical', value: tacticalAvg, icon: '⚔️' },
      { key: 'cognitive', label: 'Cognitive', value: cognitiveAvg, icon: '🧠' },
      { key: 'innovation', label: 'Innovation', value: innovationAvg, icon: '💡' }
    ];
  }, [strategicAvg, tacticalAvg, cognitiveAvg, innovationAvg]); // ← Primitive dependencies!
  
  // ✅ CRITICAL FIX: Memoized message components with stable toggleExpanded
  const messageComponents = useMemo(() => {
    console.log('🏗️ Building message components, count:', sortedMessages.length);
    if (!hasData) return [];
    
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
  }, [sortedMessages, messages, scores, expandedMessages, toggleExpanded, hasData]);
  
  // ✅ Helper functions for trend display
  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };
  
  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  console.log('✅ ANALYSIS RESULTS PRIMITIVE: Rendering, hasData:', hasData);
  
  return (
    <div className="space-y-6">
      {/* Always render structure, but conditionally show content */}
      {!hasData ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-2">♟️</div>
            <p className="text-muted-foreground">No analysis data available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Paste a conversation to see detailed chess-style scoring
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                    <p className="text-2xl font-bold">{Math.round(averageScore)}</p>
                  </div>
                  <ScoreBadge score={averageScore} size="lg" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trend</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTrendIcon(trend)}</span>
                      <span className={cn("text-sm font-medium", getTrendColor(trend))}>
                        {trend.charAt(0).toUpperCase() + trend.slice(1)}
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
                    <p className="text-2xl font-bold">{Math.round(bestScore)}</p>
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
                    <p className="text-2xl font-bold">{totalMessages}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {completedAnalysis}/{totalMessages}
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
                {dimensions.map(({ key, label, value, icon }) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{icon}</span>
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
        </>
      )}
    </div>
  );
};

export default AnalysisResults;