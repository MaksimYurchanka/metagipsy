import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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

// ✅ DEBUG HELPER: Track render count and causes
let renderCount = 0;
const DEBUG_MODE = true; // Set to false in production

const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`🔍 [AnalysisResults] ${message}`, data || '');
  }
};

const debugWarn = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.warn(`⚠️ [AnalysisResults] ${message}`, data || '');
  }
};

type FilterType = 'all' | 'low' | 'high';
type SortType = 'index' | 'score';

const AnalysisResults: React.FC = () => {
  const renderNumber = ++renderCount;
  debugLog(`RENDER #${renderNumber} - Component starting`);
  
  // ✅ DEBUG: Track what causes re-renders
  const previousProps = useRef<any>({});
  
  // ✅ DEBUG: Single store subscription with logging
  const analysisData = useAnalysisStore((state) => {
    const data = {
      messages: state.messages,
      scores: state.scores,
      patterns: state.patterns,
      insights: state.insights,
      sessionSummary: state.sessionSummary,
      computedStats: state.computedStats,
      isAnalyzing: state.isAnalyzing,
      error: state.error
    };
    
    debugLog(`Store subscription fired - Render #${renderNumber}`, {
      messagesLength: data.messages.length,
      scoresLength: data.scores.length,
      computedStatsRef: data.computedStats === previousProps.current.computedStats ? 'SAME' : 'DIFFERENT',
      averageScore: data.computedStats.averageScore
    });
    
    return data;
  });
  
  // ✅ DEBUG: Settings subscription with logging
  const displaySettings = useDisplaySettings((state) => {
    const settings = {
      compactMode: state.compactMode,
      animationsEnabled: state.animationsEnabled
    };
    
    debugLog(`Settings subscription fired - Render #${renderNumber}`, settings);
    return settings;
  });
  
  // ✅ DEBUG: Local state with logging
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(() => {
    debugLog(`Initialize expandedMessages - Render #${renderNumber}`);
    return new Set();
  });
  
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('index');
  
  // ✅ DEBUG: Check for reference changes
  useEffect(() => {
    const current = {
      messages: analysisData.messages,
      scores: analysisData.scores,
      computedStats: analysisData.computedStats,
      compactMode: displaySettings.compactMode,
      animationsEnabled: displaySettings.animationsEnabled
    };
    
    if (previousProps.current.messages !== current.messages) {
      debugLog(`REFERENCE CHANGE: messages`, {
        previous: previousProps.current.messages?.length || 0,
        current: current.messages.length,
        sameReference: previousProps.current.messages === current.messages
      });
    }
    
    if (previousProps.current.scores !== current.scores) {
      debugLog(`REFERENCE CHANGE: scores`, {
        previous: previousProps.current.scores?.length || 0,
        current: current.scores.length,
        sameReference: previousProps.current.scores === current.scores
      });
    }
    
    if (previousProps.current.computedStats !== current.computedStats) {
      debugWarn(`REFERENCE CHANGE: computedStats - THIS COULD CAUSE INFINITE LOOP!`, {
        previousAvg: previousProps.current.computedStats?.averageScore || 0,
        currentAvg: current.computedStats.averageScore,
        sameReference: previousProps.current.computedStats === current.computedStats
      });
    }
    
    previousProps.current = current;
  });
  
  const { messages, scores, computedStats } = analysisData;
  const { compactMode, animationsEnabled } = displaySettings;
  
  debugLog(`Data extracted - Render #${renderNumber}`, {
    messagesLength: messages.length,
    scoresLength: scores.length,
    computedStatsKeys: Object.keys(computedStats)
  });
  
  // Early return if no data
  if (messages.length === 0 || scores.length === 0) {
    debugLog(`Early return - no data - Render #${renderNumber}`);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-2">♟️</div>
          <p className="text-muted-foreground">No analysis data available</p>
        </div>
      </div>
    );
  }
  
  // ✅ DEBUG: Stable callbacks with logging
  const toggleExpanded = useCallback((index: number) => {
    debugLog(`toggleExpanded called for index ${index}`);
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
        debugLog(`Collapsed message ${index}`);
      } else {
        newSet.add(index);
        debugLog(`Expanded message ${index}`);
      }
      return newSet;
    });
  }, []); // Empty deps - should be stable
  
  const expandAll = useCallback(() => {
    debugLog(`expandAll called - messages.length: ${messages.length}`);
    setExpandedMessages(new Set(Array.from({ length: messages.length }, (_, i) => i)));
  }, [messages.length]);
  
  const collapseAll = useCallback(() => {
    debugLog(`collapseAll called`);
    setExpandedMessages(new Set());
  }, []);
  
  const handleFilterChange = useCallback((value: FilterType) => {
    debugLog(`Filter changed to: ${value}`);
    setFilterBy(value);
  }, []);
  
  const handleSortChange = useCallback((value: SortType) => {
    debugLog(`Sort changed to: ${value}`);
    setSortBy(value);
  }, []);
  
  // ✅ DEBUG: Memoized filtered messages with extensive logging
  const filteredMessages = useMemo(() => {
    debugLog(`Computing filteredMessages - Render #${renderNumber}`, {
      totalMessages: messages.length,
      filterBy,
      scoreCount: scores.length
    });
    
    if (messages.length !== scores.length) {
      debugWarn(`MISMATCH: messages.length (${messages.length}) !== scores.length (${scores.length})`);
    }
    
    const filtered = messages.filter((_, index) => {
      const score = scores[index];
      if (!score) {
        debugWarn(`Missing score for message index ${index}`);
        return false;
      }
      
      switch (filterBy) {
        case 'low':
          return score.overall < 60;
        case 'high':
          return score.overall >= 80;
        default:
          return true;
      }
    });
    
    debugLog(`Filtered ${filtered.length} messages from ${messages.length} total`);
    return filtered;
  }, [messages, scores, filterBy]);
  
  // ✅ DEBUG: Memoized sorted messages with logging
  const sortedMessages = useMemo(() => {
    debugLog(`Computing sortedMessages - Render #${renderNumber}`, {
      filteredCount: filteredMessages.length,
      sortBy
    });
    
    if (sortBy === 'index') {
      debugLog(`Returning filteredMessages unchanged (sortBy: index)`);
      return filteredMessages;
    }
    
    debugLog(`Sorting by score...`);
    const sorted = [...filteredMessages].sort((a, b) => {
      const aIndex = messages.indexOf(a);
      const bIndex = messages.indexOf(b);
      const aScore = scores[aIndex];
      const bScore = scores[bIndex];
      
      if (!aScore || !bScore) {
        debugWarn(`Missing scores during sort: aScore=${!!aScore}, bScore=${!!bScore}`);
        return 0;
      }
      
      return bScore.overall - aScore.overall;
    });
    
    debugLog(`Sorted ${sorted.length} messages by score`);
    return sorted;
  }, [filteredMessages, sortBy, messages, scores]);
  
  // ✅ DEBUG: Memoized dimensions with logging
  const dimensions = useMemo(() => {
    debugLog(`Computing dimensions - Render #${renderNumber}`, {
      computedStatsRef: typeof computedStats,
      hasAverages: !!computedStats.dimensionAverages
    });
    
    if (!computedStats.dimensionAverages) {
      debugWarn(`Missing dimensionAverages in computedStats!`, computedStats);
      return [];
    }
    
    const dims = [
      { key: 'strategic', label: 'Strategic', value: computedStats.dimensionAverages.strategic },
      { key: 'tactical', label: 'Tactical', value: computedStats.dimensionAverages.tactical },
      { key: 'cognitive', label: 'Cognitive', value: computedStats.dimensionAverages.cognitive },
      { key: 'innovation', label: 'Innovation', value: computedStats.dimensionAverages.innovation }
    ];
    
    debugLog(`Created dimensions array`, dims.map(d => ({ key: d.key, value: d.value })));
    return dims;
  }, [computedStats.dimensionAverages]);
  
  // ✅ DEBUG: Message components with extensive logging
  const messageComponents = useMemo(() => {
    debugLog(`Computing messageComponents - Render #${renderNumber}`, {
      sortedMessagesLength: sortedMessages.length,
      expandedCount: expandedMessages.size
    });
    
    // ✅ CRITICAL DEBUG: Check if toggleExpanded is changing
    debugLog(`toggleExpanded function reference check`, {
      functionType: typeof toggleExpanded,
      functionString: toggleExpanded.toString().substring(0, 50) + '...'
    });
    
    const components = sortedMessages.map((message, sortedIndex) => {
      const originalIndex = messages.indexOf(message);
      const score = scores[originalIndex];
      
      if (originalIndex === -1) {
        debugWarn(`Message not found in original messages array!`, { 
          sortedIndex, 
          messageContent: message.content.substring(0, 50) 
        });
        return null;
      }
      
      if (!score) {
        debugWarn(`Missing score for originalIndex ${originalIndex}`);
        return null;
      }
      
      debugLog(`Creating MessageAnalysis ${sortedIndex} (original: ${originalIndex})`, {
        messageRole: message.role,
        scoreOverall: score.overall,
        isExpanded: expandedMessages.has(originalIndex)
      });
      
      return (
        <MessageAnalysis
          key={originalIndex}
          message={message}
          score={score}
          index={originalIndex}
          isExpanded={expandedMessages.has(originalIndex)}
          onToggle={toggleExpanded}
        />
      );
    }).filter(Boolean); // Remove nulls
    
    debugLog(`Created ${components.length} MessageAnalysis components`);
    return components;
  }, [sortedMessages, messages, scores, expandedMessages, toggleExpanded]);
  
  // ✅ DEBUG: Performance monitoring
  useEffect(() => {
    const endTime = performance.now();
    debugLog(`Render #${renderNumber} completed in ${endTime - (window as any).renderStartTime || 0}ms`);
  });
  
  // ✅ DEBUG: Start timing for next render
  useEffect(() => {
    (window as any).renderStartTime = performance.now();
  });
  
  debugLog(`About to return JSX - Render #${renderNumber}`, {
    totalComponents: messageComponents.length,
    renderTime: performance.now()
  });
  
  return (
    <div className="space-y-6">
      {/* Debug info */}
      {DEBUG_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
          <strong>DEBUG INFO:</strong> Render #{renderNumber} | 
          Messages: {messages.length} | 
          Scores: {scores.length} | 
          Components: {messageComponents.length} |
          Avg Score: {Math.round(computedStats.averageScore || 0)}
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{Math.round(computedStats.averageScore)}</p>
              </div>
              <ScoreBadge score={computedStats.averageScore} size="lg" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTrendIcon(computedStats.trend)}</span>
                  <span className={cn("text-sm font-medium", getTrendColor(computedStats.trend))}>
                    {computedStats.trend.charAt(0).toUpperCase() + computedStats.trend.slice(1)}
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
                <p className="text-2xl font-bold">{Math.round(computedStats.bestScore)}</p>
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
                <p className="text-2xl font-bold">{computedStats.totalMessages}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {computedStats.completedAnalysis}/{computedStats.totalMessages}
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