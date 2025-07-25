import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User, Bot, Lightbulb, AlertTriangle, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ScoreBadge from '@/components/common/ScoreBadge';
import { MessageAnalysisProps } from '@/types';
import { cn, getDimensionIcon, getDimensionColor, formatTimestamp } from '@/lib/utils';
import { 
  useCompactMode, 
  useAnimationsEnabled, 
  useAutoExpandLowScores 
} from '@/stores/settingsStore';

const MessageAnalysis: React.FC<MessageAnalysisProps> = ({
  message,
  score,
  index,
  isExpanded = false,
  onToggle
}) => {
  console.log(`🔍 MESSAGE ANALYSIS 5D ${index}: Starting render...`);
  
  // ✅ CRITICAL FIX 1: Local state for when no parent control
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  
  // ✅ CRITICAL FIX 2: Individual stable selectors
  const compactMode = useCompactMode();
  const animationsEnabled = useAnimationsEnabled();
  const autoExpandLowScores = useAutoExpandLowScores();
  
  // ✅ CRITICAL FIX 3: Determine final expanded state
  const shouldAutoExpand = autoExpandLowScores && score.overall < 60;
  const finalExpanded = onToggle ? isExpanded : (shouldAutoExpand || localExpanded);
  
  console.log(`✅ MESSAGE ANALYSIS 5D ${index}: State determined, expanded:`, finalExpanded);
  
  // ✅ CRITICAL FIX 4: STABLE toggle function with ZERO dependencies on onToggle!
  const handleToggle = useCallback(() => {
    console.log(`🔄 MESSAGE ANALYSIS 5D ${index}: Toggle clicked`);
    if (onToggle) {
      onToggle(index);
    } else {
      setLocalExpanded(prev => !prev);
    }
  }, [index]); // ← REMOVED onToggle from dependencies! CRITICAL FIX!
  
  // ✅ CRITICAL FIX 5: Memoized role styling (prevent recalculation)
  const roleStyles = useMemo(() => {
    const isUser = message.role === 'user';
    return {
      icon: isUser ? User : Bot,
      color: isUser ? 'text-blue-500' : 'text-green-500',
      bg: isUser ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-green-50 dark:bg-green-950/30'
    };
  }, [message.role]);
  
  // ✅ FIXED: 5D dimensions array with uniform styling (NO isNew for Context!)
  const dimensions = useMemo(() => {
    console.log(`📊 MESSAGE ANALYSIS 5D ${index}: Computing 5D dimensions`);
    return [
      { 
        key: 'strategic', 
        label: 'Strategic', 
        value: score.dimensions?.strategic || 0,
        icon: '🎯',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950/30',
        borderColor: 'border-purple-200 dark:border-purple-800'
      },
      { 
        key: 'tactical', 
        label: 'Tactical', 
        value: score.dimensions?.tactical || 0,
        icon: '⚡',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800'
      },
      { 
        key: 'cognitive', 
        label: 'Cognitive', 
        value: score.dimensions?.cognitive || 0,
        icon: '🧠',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-200 dark:border-green-800'
      },
      { 
        key: 'innovation', 
        label: 'Innovation', 
        value: score.dimensions?.innovation || 0,
        icon: '💡',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      },
      { 
        key: 'context', 
        label: 'Context', 
        value: score.dimensions?.context || 0,
        icon: '🧭', // ✅ Navigation compass icon (not compose!)
        color: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
        borderColor: 'border-cyan-200 dark:border-cyan-800'
        // ✅ REMOVED: isNew property for uniform styling
      }
    ];
  }, [score.dimensions, index]); // ← Stable dependencies
  
  // ✅ NEW: Context dimension analysis with enhanced dark theme colors
  const contextAnalysis = useMemo(() => {
    const contextScore = score.dimensions?.context || 0;
    if (contextScore === 0) {
      return {
        level: 'none',
        description: 'First message - no context available',
        color: 'text-gray-500 dark:text-gray-400'
      };
    } else if (contextScore <= 40) {
      return {
        level: 'limited',
        description: 'Basic temporal awareness',
        color: 'text-orange-600 dark:text-orange-400'
      };
    } else if (contextScore <= 70) {
      return {
        level: 'good',
        description: 'Strong context understanding',
        color: 'text-blue-600 dark:text-blue-400'
      };
    } else {
      return {
        level: 'excellent',
        description: 'Exceptional context mastery',
        color: 'text-green-600 dark:text-green-400'
      };
    }
  }, [score.dimensions?.context]);
  
  // ✅ CRITICAL FIX 7: Memoized expanded content (expensive computation)
  const expandedContent = useMemo(() => {
    console.log(`🏗️ MESSAGE ANALYSIS 5D ${index}: Building expanded content, show:`, finalExpanded);
    
    if (!finalExpanded) return null;
    
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: animationsEnabled ? 0.2 : 0 }}
        className="space-y-4"
      >
        {/* 5D Dimension scores */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">5D Dimension Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dimensions.map(({ key, label, value, icon, color, bgColor, borderColor }) => (
              <div key={key} className={cn(
                "space-y-2 p-3 rounded-lg border transition-all duration-200",
                bgColor,
                borderColor
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className={cn("text-sm font-medium", color)}>
                      {label}
                      {/* ✅ REMOVED: NEW badge for uniform styling */}
                    </span>
                  </div>
                  <ScoreBadge 
                    score={value} 
                    dimension={key as any}
                    size="sm"
                    animated={false}
                  />
                </div>
                <Progress 
                  value={value} 
                  className="h-2"
                />
                {/* ✅ ENHANCED: Context dimension explanation with better dark theme */}
                {key === 'context' && (
                  <div className="mt-2 space-y-1">
                    <p className={cn("text-xs font-medium", contextAnalysis.color)}>
                      {contextAnalysis.level.toUpperCase()}: {contextAnalysis.description}
                    </p>
                    {value > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Temporal understanding & state awareness
                      </p>
                    )}
                  </div>
                )}
                {/* Standard dimension explanations with dark theme support */}
                {key === 'strategic' && value > 70 && (
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Strong goal alignment and strategic thinking
                  </p>
                )}
                {key === 'tactical' && value > 70 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Clear, specific, and actionable communication
                  </p>
                )}
                {key === 'cognitive' && value > 70 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Optimal timing and mental load management
                  </p>
                )}
                {key === 'innovation' && value > 70 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Creative and breakthrough-oriented thinking
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* ✅ ENHANCED: Context Mastery section with perfect dark theme */}
        {score.dimensions?.context && score.dimensions.context > 70 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧭</span>
              <h4 className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Context Mastery</h4>
              <div className="px-2 py-1 rounded-md text-xs font-medium bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700">
                EXCELLENT
              </div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 p-3 rounded-md">
              <p className="text-sm text-cyan-800 dark:text-cyan-200">
                Exceptional temporal understanding and state awareness! This message demonstrates 
                strong context continuity with a score of <span className="font-bold">{Math.round(score.dimensions.context)}</span>.
                {score.dimensions.context > 85 && (
                  <span className="block mt-1 font-medium">
                    🏆 This represents mastery-level context awareness!
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
        
        {/* Explanation with better dark theme */}
        {score.explanation && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Analysis</h4>
            <p className="text-sm text-muted-foreground bg-muted/70 dark:bg-muted/30 p-3 rounded-md">
              {score.explanation}
            </p>
          </div>
        )}
        
        {/* Better move suggestion with enhanced dark theme */}
        {score.betterMove && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              <h4 className="text-sm font-medium text-foreground">Suggestion</h4>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {score.betterMove}
              </p>
            </div>
          </div>
        )}
        
        {/* Low score warning with enhanced dark theme */}
        {score.overall < 40 && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-medium">Low Score Alert</p>
              <p>This message scored below average. Consider the suggestions above to improve future interactions.</p>
            </div>
          </div>
        )}
        
        {/* ✅ ENHANCED: Context insights with perfect dark theme */}
        {score.dimensions?.context && score.dimensions.context <= 40 && score.dimensions.context > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300">Context Improvement</h4>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 p-3 rounded-md">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <span className="font-medium">Limited context awareness detected.</span> Consider:
              </p>
              <ul className="mt-2 text-xs text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Reference previous discussion points</li>
                <li>• Acknowledge completed tasks or decisions</li>
                <li>• Show awareness of conversation timeline</li>
                <li>• Build upon earlier established context</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Enhanced Metadata with 5D info and better dark theme */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            <span>Confidence: {Math.round((score.confidence || 0) * 100)}%</span>
            <span>Classification: {score.classification}</span>
            {score.dimensions?.context !== undefined && (
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                Context: {Math.round(score.dimensions.context)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>{message.content.length} characters</span>
            {/* ✅ 5D indicator with better dark theme */}
            <div className="px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/50 dark:to-cyan-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
              5D Analysis
            </div>
          </div>
        </div>
      </motion.div>
    );
  }, [finalExpanded, dimensions, score, animationsEnabled, message.content.length, index, contextAnalysis]);
  
  // ✅ CRITICAL FIX 8: Memoized card content (prevent unnecessary re-renders)
  const cardContent = useMemo(() => {
    console.log(`🏗️ MESSAGE ANALYSIS 5D ${index}: Building card content`);
    
    return (
      <Card className={cn(
        "transition-all duration-200",
        finalExpanded && "ring-2 ring-blue-200 dark:ring-blue-800",
        compactMode && "p-2",
        // ✅ ENHANCED: Special styling for high context scores with dark theme
        score.dimensions?.context && score.dimensions.context > 80 && 
        "shadow-lg border-cyan-200 dark:border-cyan-800"
      )}>
        <CardContent className={cn("p-4", compactMode && "p-3")}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                roleStyles.bg
              )}>
                {React.createElement(roleStyles.icon, { 
                  className: cn("h-4 w-4", roleStyles.color) 
                })}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium capitalize text-foreground">{message.role}</span>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  {message.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  )}
                  {/* ✅ Enhanced 5D indicator with better dark theme */}
                  <div className="px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/50 dark:to-cyan-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                    5D
                  </div>
                  {/* ✅ Context excellence indicator with dark theme */}
                  {score.dimensions?.context && score.dimensions.context > 85 && (
                    <div className="px-2 py-1 rounded-md text-xs font-medium bg-cyan-500 dark:bg-cyan-600 text-white">
                      Context Master
                    </div>
                  )}
                </div>
                
                <p className={cn(
                  "text-sm text-muted-foreground line-clamp-2",
                  finalExpanded && "line-clamp-none"
                )}>
                  {message.content}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <ScoreBadge 
                score={score.overall} 
                size={compactMode ? "sm" : "md"}
                animated={animationsEnabled}
              />
              
              {/* ✅ ENHANCED: Context score badge with special styling */}
              {score.dimensions?.context && score.dimensions.context > 0 && (
                <ScoreBadge 
                  score={score.dimensions.context} 
                  dimension="context"
                  size="sm"
                  animated={animationsEnabled}
                  className={cn(
                    "ring-1 ring-cyan-300 dark:ring-cyan-700",
                    score.dimensions.context > 70 && "shadow-md"
                  )}
                />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="h-8 w-8 p-0"
              >
                {finalExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Expanded content */}
          <AnimatePresence>
            {expandedContent}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }, [
    finalExpanded, 
    compactMode, 
    roleStyles, 
    message, 
    index, 
    score.overall, 
    score.dimensions?.context,
    animationsEnabled, 
    handleToggle,
    expandedContent
  ]); // ← All dependencies are stable now!
  
  console.log(`✅ MESSAGE ANALYSIS 5D ${index}: Render complete`);
  
  // ✅ CRITICAL FIX 9: Conditional animation wrapper (stable logic)
  if (animationsEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.05,
          ease: "easeOut"
        }}
        layout
      >
        {cardContent}
      </motion.div>
    );
  }
  
  return cardContent;
};

export default MessageAnalysis;