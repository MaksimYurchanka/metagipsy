import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User, Bot, Lightbulb, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ScoreBadge from '@/components/common/ScoreBadge';
import { MessageAnalysisProps } from '@/types';
import { cn, getDimensionIcon, getDimensionColor, formatTimestamp } from '@/lib/utils';
import { useDisplaySettings } from '@/stores/settingsStore';

const MessageAnalysis: React.FC<MessageAnalysisProps> = ({
  message,
  score,
  index,
  isExpanded = false,
  onToggle
}) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const { compactMode, animationsEnabled, autoExpandLowScores } = useDisplaySettings();
  
  const expanded = onToggle ? isExpanded : localExpanded;
  const toggleExpanded = onToggle || (() => setLocalExpanded(!localExpanded));
  
  // Auto-expand low scores
  React.useEffect(() => {
    if (autoExpandLowScores && score.overall < 60 && !expanded) {
      toggleExpanded();
    }
  }, [score.overall, autoExpandLowScores, expanded, toggleExpanded]);
  
  const roleIcon = message.role === 'user' ? User : Bot;
  const roleColor = message.role === 'user' ? 'text-blue-500' : 'text-green-500';
  const roleBg = message.role === 'user' ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-green-50 dark:bg-green-950/20';
  
  const dimensions = [
    { key: 'strategic', label: 'Strategic', value: score.dimensions.strategic },
    { key: 'tactical', label: 'Tactical', value: score.dimensions.tactical },
    { key: 'cognitive', label: 'Cognitive', value: score.dimensions.cognitive },
    { key: 'innovation', label: 'Innovation', value: score.dimensions.innovation }
  ];
  
  const cardContent = (
    <Card className={cn(
      "transition-all duration-200",
      expanded && "ring-2 ring-blue-200 dark:ring-blue-800",
      compactMode && "p-2"
    )}>
      <CardContent className={cn("p-4", compactMode && "p-3")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              roleBg
            )}>
              {React.createElement(roleIcon, { 
                className: cn("h-4 w-4", roleColor) 
              })}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium capitalize">{message.role}</span>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                {message.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.timestamp)}
                  </span>
                )}
              </div>
              
              <p className={cn(
                "text-sm text-muted-foreground line-clamp-2",
                expanded && "line-clamp-none"
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="h-8 w-8 p-0"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: animationsEnabled ? 0.2 : 0 }}
              className="space-y-4"
            >
              {/* Dimension scores */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Dimension Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dimensions.map(({ key, label, value }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{getDimensionIcon(key)}</span>
                          <span className="text-sm font-medium">{label}</span>
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
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Explanation */}
              {score.explanation && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Analysis</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {score.explanation}
                  </p>
                </div>
              )}
              
              {/* Better move suggestion */}
              {score.betterMove && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <h4 className="text-sm font-medium">Suggestion</h4>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {score.betterMove}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Low score warning */}
              {score.overall < 40 && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">Low Score Alert</p>
                    <p>This message scored below average. Consider the suggestions above to improve future interactions.</p>
                  </div>
                </div>
              )}
              
              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-4">
                  <span>Confidence: {Math.round(score.confidence * 100)}%</span>
                  <span>Classification: {score.classification}</span>
                </div>
                <div>
                  {message.content.length} characters
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
  
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

