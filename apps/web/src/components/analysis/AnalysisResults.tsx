import React, { useState, useMemo, useCallback } from 'react';
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
import { useDisplaySettings } from '@/stores/settingsStore';
import { cn, getTrendIcon, getTrendColor, getDimensionIcon } from '@/lib/utils';

const AnalysisResults: React.FC = () => {
  // ✅ FIX 1: Single store subscription to prevent cascade
  const analysisData = useAnalysisStore(state => ({
    messages: state.messages,
    scores: state.scores,
    sessionSummary: state.sessionSummary,
    // Compute stats inline to avoid separate subscription
    stats: {
      averageScore: state.scores.length > 0 
        ? state.scores.reduce((sum, score) => sum + score.overall, 0) / state.scores.length 
        : 0,
      bestScore: state.scores.length > 0 
        ? Math.max(...state.scores.map(s => s.overall)) 
        : 0,
      totalMessages: state.messages.length,
      completedAnalysis: state.scores.length,
      // ✅ FIX 2: Calculate actual dimension averages
      dimensionAverages: state.scores.length > 0 ? {
        strategic: state.scores.reduce((sum, s) => sum + s.dimensions.strategic, 0) / state.scores.length,
        tactical: state.scores.reduce((sum, s) => sum + s.dimensions.tactical, 0) / state.scores.length,
        cognitive: state.scores.reduce((sum, s) => sum + s.dimensions.cognitive, 0) / state.scores.length,
        innovation: state.scores.reduce((sum, s) => sum + s.dimensions.innovation, 0) / state.scores.length,
      } : { strategic: 0, tactical: 0, cognitive: 0, innovation: 0 }
    },
    // Compute trend inline
    trend: state.scores.length >= 3 
      ? (() => {
          const recent = state.scores.slice(-3);
          const oldAvg = (recent[0].overall + recent[1].overall) / 2;
          const newAvg = recent[2].overall;
          return newAvg > oldAvg + 5 ? 'improving' : 
                 newAvg < oldAvg - 5 ? 'declining' : 'stable';
        })()
      : 'stable'
  }));
  
  const { compactMode, animationsEnabled } = useDisplaySettings();
  
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [filterBy, setFilterBy] = useState<'all' | 'low' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'index' | 'score'>('index');
  
  const { messages, scores, stats, trend } = analysisData;
  
  if (messages.length === 0 || scores.length === 0) {
    return null;
  }
  
  // ✅ FIX 3: Memoize callback to prevent re-renders
  const toggleExpanded = useCallback((index: number) => {
    setExpandedMessages(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      return newExpanded;
    });
  }, []);
  
  const expandAll = useCallback(() => {
    setExpandedMessages(new Set(messages.map((_, i) => i)));
  }, [messages.length]);
  
  const collapseAll = useCallback(() => {
    setExpandedMessages(new Set());
  }, []);
  
  // ✅ FIX 4: Memoize filtered and sorted arrays
  const filteredMessages = useMemo(() => {
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
  }, [messages, scores, filterBy]);
  
  const sortedMessages = useMemo(() => {
    return [...filteredMessages].sort((a, b) => {
      const aIndex = messages.indexOf(a);
      const bIndex = messages.indexOf(b);
      const aScore = scores[aIndex];
      const bScore = scores[bIndex];
      
      if (sortBy === 'score') {
        return bScore.overall - aScore.overall;
      }
      return aIndex - bIndex;
    });
  }, [filteredMessages, messages, scores, sortBy]);
  
  // ✅ FIX 5: Use actual dimension averages instead of overall average
  const dimensions = useMemo(() => [
    { key: 'strategic', label: 'Strategic', value: stats.dimensionAverages.strategic },
    { key: 'tactical', label: 'Tactical', value: stats.dimensionAverages.tactical },
    { key: 'cognitive', label: 'Cognitive', value: stats.dimensionAverages.cognitive },
    { key: 'innovation', label: 'Innovation', value: stats.dimensionAverages.innovation }
  ], [stats.dimensionAverages]);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageScore)}</p>
              </div>
              <ScoreBadge score={stats.averageScore} size="lg" />
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
                <p className="text-2xl font-bold">{Math.round(stats.bestScore)}</p>
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
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.completedAnalysis}/{stats.totalMessages}
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
            
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="low">Low Scores (&lt;60)</SelectItem>
                <SelectItem value="high">High Scores (≥80)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
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
            {sortedMessages.map((message) => {
              const originalIndex = messages.indexOf(message);
              const score = scores[originalIndex];
              
              return (
                <MessageAnalysis
                  key={originalIndex}
                  message={message}
                  score={score}
                  index={originalIndex}
                  isExpanded={expandedMessages.has(originalIndex)}
                  onToggle={() => toggleExpanded(originalIndex)}
                />
              );
            })}
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
                        {scores.map((score, index) => (
                          <div
                            key={index}
                            className="h-8 rounded flex items-center justify-center text-xs font-medium text-white"
                            style={{
                              backgroundColor: `hsl(${score.dimensions[key as keyof typeof score.dimensions] * 1.2}, 70%, 50%)`
                            }}
                            title={`Message ${index + 1}: ${Math.round(score.dimensions[key as keyof typeof score.dimensions])}`}
                          >
                            {Math.round(score.dimensions[key as keyof typeof score.dimensions])}
                          </div>
                        ))}
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
};

export default AnalysisResults;