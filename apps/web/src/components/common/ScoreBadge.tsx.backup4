import React from 'react';
import { motion } from 'framer-motion';
import { cn, getScoreColor, getScoreBgColor, getChessNotation } from '@/lib/utils';
import { ScoreBadgeProps } from '@/types';
import { 
  useShowChessNotation, 
  useAnimationsEnabled 
} from '@/stores/settingsStore';

const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  dimension = 'overall',
  size = 'md',
  animated = true,
  showNotation = true,
  className
}) => {
  console.log(`🏷️ SCORE BADGE 5D: Rendering ${dimension} score:`, score);
  
  // ✅ FIXED: Use individual selectors instead of useDisplaySettings
  const showChessNotation = useShowChessNotation();
  const animationsEnabled = useAnimationsEnabled();
  
  // ✅ PRESERVE: Exact same logic as before
  const { symbol, name } = getChessNotation(score);
  
  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };
  
  // ✅ ENHANCED: Complete 5D dimension styling with rich color schemes!
  const dimensionConfig = {
    overall: {
      bgColor: getScoreBgColor(score),
      icon: '',
      ring: '',
      tooltip: `Overall Score: ${Math.round(score)}/100 - ${name}`,
      hoverEffect: 'scale'
    },
    strategic: {
      bgColor: 'bg-purple-500',
      icon: '🎯',
      ring: 'ring-1 ring-purple-300 dark:ring-purple-700',
      tooltip: `Strategic: ${Math.round(score)}/100 - Goal alignment & progress`,
      hoverEffect: 'scale'
    },
    tactical: {
      bgColor: 'bg-blue-500',
      icon: '⚡',
      ring: 'ring-1 ring-blue-300 dark:ring-blue-700',
      tooltip: `Tactical: ${Math.round(score)}/100 - Clarity & actionability`,
      hoverEffect: 'scale'
    },
    cognitive: {
      bgColor: 'bg-green-500',
      icon: '🧠',
      ring: 'ring-1 ring-green-300 dark:ring-green-700',
      tooltip: `Cognitive: ${Math.round(score)}/100 - Mental load & timing`,
      hoverEffect: 'scale'
    },
    innovation: {
      bgColor: 'bg-yellow-500',
      icon: '💡',
      ring: 'ring-1 ring-yellow-300 dark:ring-yellow-700',
      tooltip: `Innovation: ${Math.round(score)}/100 - Creativity & breakthroughs`,
      hoverEffect: 'scale'
    },
    context: {
      bgColor: 'bg-cyan-500',
      icon: '🧭',
      ring: 'ring-2 ring-cyan-300 dark:ring-cyan-700', // ✅ ring-2 for emphasis (NEW dimension)
      tooltip: `Context: ${Math.round(score)}/100 - Temporal understanding & state awareness`,
      hoverEffect: 'compass' // ✅ Special effect for context
    }
  };
  
  const config = dimensionConfig[dimension] || dimensionConfig.overall;
  
  // ✅ ENHANCED: Score-based styling adjustments for context
  const contextEnhancements = dimension === 'context' ? {
    shadowClass: score > 80 ? 'shadow-lg shadow-cyan-200 dark:shadow-cyan-800' : 'shadow-sm',
    glowClass: score > 85 ? 'animate-pulse' : '',
    specialIcon: score === 0 ? '⚪' : config.icon // Special icon for zero context (first message)
  } : {
    shadowClass: 'shadow-sm',
    glowClass: '',
    specialIcon: config.icon
  };
  
  console.log(`✅ SCORE BADGE 5D: Using config for ${dimension}:`, config);
  
  const badgeContent = (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white',
        'transition-all duration-200',
        sizeClasses[size],
        config.bgColor,
        config.ring,
        contextEnhancements.shadowClass,
        contextEnhancements.glowClass,
        'border border-white/20',
        // ✅ Special styling for high context scores
        dimension === 'context' && score > 80 && 'bg-gradient-to-r from-cyan-500 to-blue-500',
        className
      )}
    >
      {/* ✅ ENHANCED: Dimension-specific icons with smart display */}
      {config.icon && size !== 'sm' && (
        <span className="mr-1 text-xs">
          {dimension === 'context' ? contextEnhancements.specialIcon : config.icon}
        </span>
      )}
      
      <span className="mr-1">{Math.round(score)}</span>
      
      {showNotation && showChessNotation && (
        <span className="text-xs opacity-90">{symbol}</span>
      )}
      
      {/* ✅ NEW: Special indicator for context mastery */}
      {dimension === 'context' && score > 85 && size !== 'sm' && (
        <span className="ml-1 text-xs">✨</span>
      )}
    </div>
  );
  
  // ✅ ENHANCED: Animation variations by dimension
  const getAnimationProps = () => {
    const baseProps = {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: dimension === 'context' ? 0.2 : 0.1 // ✅ Context appears last (newest)
      },
      whileTap: { scale: 0.95 }
    };
    
    // ✅ Special hover effects by dimension
    if (config.hoverEffect === 'compass') {
      return {
        ...baseProps,
        whileHover: { 
          scale: 1.05,
          rotate: [0, -3, 3, 0], // ✅ Compass wobble effect
          transition: { duration: 0.6 }
        }
      };
    } else {
      return {
        ...baseProps,
        whileHover: { scale: 1.05 }
      };
    }
  };
  
  if (animated && animationsEnabled) {
    return (
      <motion.div
        {...getAnimationProps()}
        title={config.tooltip}
      >
        {badgeContent}
      </motion.div>
    );
  }
  
  return (
    <div title={config.tooltip}>
      {badgeContent}
    </div>
  );
};

export default ScoreBadge;