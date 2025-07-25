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
  
  // ✅ ENHANCED: Complete 5D dimension styling with enhanced dark theme support!
  const dimensionConfig = {
    overall: {
      bgColor: getScoreBgColor(score),
      icon: '',
      ring: '',
      tooltip: `Overall Score: ${Math.round(score)}/100 - ${name}`,
      hoverEffect: 'scale',
      darkEnhancement: ''
    },
    strategic: {
      bgColor: 'bg-purple-500 dark:bg-purple-600',
      icon: '🎯',
      ring: 'ring-1 ring-purple-300 dark:ring-purple-600',
      tooltip: `Strategic: ${Math.round(score)}/100 - Goal alignment & progress`,
      hoverEffect: 'scale',
      darkEnhancement: 'shadow-purple-500/20 dark:shadow-purple-400/20'
    },
    tactical: {
      bgColor: 'bg-blue-500 dark:bg-blue-600',
      icon: '⚡',
      ring: 'ring-1 ring-blue-300 dark:ring-blue-600',
      tooltip: `Tactical: ${Math.round(score)}/100 - Clarity & actionability`,
      hoverEffect: 'scale',
      darkEnhancement: 'shadow-blue-500/20 dark:shadow-blue-400/20'
    },
    cognitive: {
      bgColor: 'bg-green-500 dark:bg-green-600',
      icon: '🧠',
      ring: 'ring-1 ring-green-300 dark:ring-green-600',
      tooltip: `Cognitive: ${Math.round(score)}/100 - Mental load & timing`,
      hoverEffect: 'scale',
      darkEnhancement: 'shadow-green-500/20 dark:shadow-green-400/20'
    },
    innovation: {
      bgColor: 'bg-yellow-500 dark:bg-yellow-600',
      icon: '💡',
      ring: 'ring-1 ring-yellow-300 dark:ring-yellow-600',
      tooltip: `Innovation: ${Math.round(score)}/100 - Creativity & breakthroughs`,
      hoverEffect: 'scale',
      darkEnhancement: 'shadow-yellow-500/20 dark:shadow-yellow-400/20'
    },
    context: {
      bgColor: 'bg-cyan-500 dark:bg-cyan-600',
      icon: '🧭',
      ring: 'ring-2 ring-cyan-300 dark:ring-cyan-600', // ✅ ring-2 for emphasis
      tooltip: `Context: ${Math.round(score)}/100 - Temporal understanding & state awareness`,
      hoverEffect: 'compass', // ✅ Special effect for context
      darkEnhancement: 'shadow-cyan-500/20 dark:shadow-cyan-400/20'
    }
  };
  
  const config = dimensionConfig[dimension] || dimensionConfig.overall;
  
  // ✅ ENHANCED: Score-based styling adjustments for context with better dark theme
  const contextEnhancements = dimension === 'context' ? {
    shadowClass: score > 80 ? 'shadow-lg shadow-cyan-200 dark:shadow-cyan-400/30' : 'shadow-sm',
    glowClass: score > 85 ? 'animate-pulse' : '',
    specialIcon: score === 0 ? '⚪' : config.icon, // Special icon for zero context (first message)
    gradientBg: score > 80 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600' : config.bgColor
  } : {
    shadowClass: `shadow-sm ${config.darkEnhancement}`,
    glowClass: '',
    specialIcon: config.icon,
    gradientBg: config.bgColor
  };
  
  console.log(`✅ SCORE BADGE 5D: Using config for ${dimension}:`, config);
  
  const badgeContent = (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white',
        'transition-all duration-200',
        sizeClasses[size],
        contextEnhancements.gradientBg,
        config.ring,
        contextEnhancements.shadowClass,
        contextEnhancements.glowClass,
        'border border-white/20 dark:border-white/30',
        // ✅ Enhanced dark theme text contrast
        'text-white dark:text-gray-100',
        className
      )}
    >
      {/* ✅ ENHANCED: Dimension-specific icons with smart display */}
      {config.icon && size !== 'sm' && (
        <span className="mr-1 text-xs opacity-90">
          {dimension === 'context' ? contextEnhancements.specialIcon : config.icon}
        </span>
      )}
      
      <span className="mr-1 font-bold">{Math.round(score)}</span>
      
      {showNotation && showChessNotation && (
        <span className="text-xs opacity-80">{symbol}</span>
      )}
      
      {/* ✅ NEW: Special indicator for context mastery with better dark theme */}
      {dimension === 'context' && score > 85 && size !== 'sm' && (
        <span className="ml-1 text-xs opacity-90">✨</span>
      )}
    </div>
  );
  
  // ✅ ENHANCED: Animation variations by dimension with improved dark theme
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
          scale: 1.1,
          rotate: [0, -5, 5, 0], // ✅ Enhanced compass wobble effect
          transition: { duration: 0.6 },
          // ✅ Enhanced glow on hover for dark theme
          filter: "brightness(1.1) drop-shadow(0 0 8px rgba(34, 211, 238, 0.4))"
        }
      };
    } else {
      return {
        ...baseProps,
        whileHover: { 
          scale: 1.05,
          filter: "brightness(1.1)"
        }
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