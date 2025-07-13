import { Message, ChessScore, ConversationContext } from '@/types';
import { logger } from './logger';

export interface ScoringWeights {
  strategic: number;
  tactical: number;
  cognitive: number;
  innovation: number;
}

export class LocalScoringEngine {
  private weights: ScoringWeights = {
    strategic: 0.30,
    tactical: 0.30,
    cognitive: 0.25,
    innovation: 0.15
  };
  
  /**
   * Score a message using local algorithms
   */
  scoreMessage(message: Message, context: ConversationContext = {}): ChessScore {
    try {
      const dimensions = {
        strategic: this.calculateStrategicScore(message, context),
        tactical: this.calculateTacticalScore(message, context),
        cognitive: this.calculateCognitiveScore(message, context),
        innovation: this.calculateInnovationScore(message, context)
      };
      
      const overall = this.calculateOverallScore(dimensions);
      const classification = this.classifyScore(overall);
      const chessNotation = this.getChessNotation(overall);
      
      return {
        overall,
        dimensions,
        classification,
        chessNotation,
        confidence: 0.7, // Local scoring confidence
        explanation: this.generateExplanation(dimensions, context),
        betterMove: overall < 60 ? this.suggestBetterMove(message, dimensions, context) : undefined
      };
    } catch (error) {
      logger.error('Scoring error:', error);
      return this.getDefaultScore();
    }
  }
  
  /**
   * Calculate strategic dimension score (0-100)
   * Measures goal advancement, timing, resource efficiency
   */
  private calculateStrategicScore(message: Message, context: ConversationContext): number {
    let score = 50; // Base score
    
    // Goal alignment check
    if (context.sessionGoal) {
      const goalKeywords = this.extractKeywords(context.sessionGoal);
      const messageKeywords = this.extractKeywords(message.content);
      const alignment = this.calculateKeywordOverlap(goalKeywords, messageKeywords);
      score += alignment * 20; // 0-20 points
    }
    
    // Progress indicators
    const progressScore = this.detectProgressIndicators(message.content);
    score += progressScore; // -15 to +15 points
    
    // Scope management
    const scopeScore = this.evaluateScopeManagement(message, context);
    score += scopeScore; // -15 to +15 points
    
    // Strategic patterns
    const patternScore = this.detectStrategicPatterns(message.content);
    score += patternScore; // 0 to +20 points
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate tactical dimension score (0-100)
   * Measures clarity, specificity, actionability
   */
  private calculateTacticalScore(message: Message, context: ConversationContext): number {
    let score = 50; // Base score
    
    // Clarity assessment
    const clarityScore = this.assessClarity(message.content);
    score += clarityScore; // -20 to +20 points
    
    // Specificity check
    const specificityScore = this.assessSpecificity(message.content);
    score += specificityScore; // -15 to +15 points
    
    // Context provision
    const contextScore = this.assessContextProvision(message, context);
    score += contextScore; // -15 to +15 points
    
    // Actionability
    const actionScore = this.assessActionability(message.content);
    score += actionScore; // -10 to +10 points
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate cognitive dimension score (0-100)
   * Measures attention, energy, timing appropriateness
   */
  private calculateCognitiveScore(message: Message, context: ConversationContext): number {
    let score = 50; // Base score
    
    // Message length appropriateness
    const lengthScore = this.assessMessageLength(message.content);
    score += lengthScore; // -15 to +15 points
    
    // Complexity management
    const complexityScore = this.assessComplexity(message.content, context);
    score += complexityScore; // -20 to +20 points
    
    // Timing indicators
    const timingScore = this.assessTiming(message, context);
    score += timingScore; // -10 to +10 points
    
    // Cognitive load indicators
    const loadScore = this.assessCognitiveLoad(message.content);
    score += loadScore; // -15 to +15 points
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate innovation dimension score (0-100)
   * Measures creativity, synthesis, breakthrough potential
   */
  private calculateInnovationScore(message: Message, context: ConversationContext): number {
    let score = 50; // Base score
    
    // Creative language patterns
    const creativityScore = this.detectCreativity(message.content);
    score += creativityScore; // 0 to +25 points
    
    // Synthesis quality
    const synthesisScore = this.assessSynthesis(message.content, context);
    score += synthesisScore; // 0 to +20 points
    
    // Novel approaches
    const noveltyScore = this.detectNovelty(message.content);
    score += noveltyScore; // 0 to +15 points
    
    // Breakthrough potential
    const breakthroughScore = this.assessBreakthroughPotential(message.content);
    score += breakthroughScore; // 0 to +10 points
    
    return Math.max(0, Math.min(100, score));
  }
  
  // Helper methods for scoring calculations
  
  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by']);
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }
  
  private calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  private detectProgressIndicators(content: string): number {
    const indicators = {
      strong_positive: /\b(solved|fixed|completed|achieved|breakthrough|success|accomplished)\b/i,
      positive: /\b(progress|advancing|improving|closer|better|working|developing)\b/i,
      neutral: /\b(trying|working on|considering|exploring|investigating)\b/i,
      negative: /\b(stuck|blocked|confused|lost|struggling|difficult)\b/i,
      strong_negative: /\b(failed|gave up|impossible|can't|won't work)\b/i
    };
    
    if (indicators.strong_positive.test(content)) return 15;
    if (indicators.positive.test(content)) return 10;
    if (indicators.neutral.test(content)) return 5;
    if (indicators.negative.test(content)) return -10;
    if (indicators.strong_negative.test(content)) return -15;
    
    return 0;
  }
  
  private evaluateScopeManagement(message: Message, context: ConversationContext): number {
    const length = message.content.length;
    const wordCount = message.content.split(/\s+/).length;
    
    // Penalize extremely long messages (scope creep)
    if (length > 2000 || wordCount > 400) return -15;
    
    // Penalize extremely short messages (insufficient scope)
    if (length < 20 || wordCount < 5) return -10;
    
    // Reward well-scoped messages
    if (length >= 100 && length <= 800 && wordCount >= 20 && wordCount <= 150) return 10;
    
    return 0;
  }
  
  private detectStrategicPatterns(content: string): number {
    let score = 0;
    
    // Strategic thinking patterns
    const patterns = {
      planning: /\b(plan|strategy|approach|roadmap|timeline|phases?)\b/i,
      prioritization: /\b(priority|priorities|important|critical|urgent|first|next)\b/i,
      analysis: /\b(analyze|analysis|evaluate|assessment|pros|cons|trade-?offs?)\b/i,
      goals: /\b(goal|objective|target|aim|purpose|outcome|result)\b/i,
      resources: /\b(time|budget|cost|resource|effort|investment)\b/i
    };
    
    Object.values(patterns).forEach(pattern => {
      if (pattern.test(content)) score += 4;
    });
    
    return Math.min(20, score);
  }
  
  private assessClarity(content: string): number {
    let score = 0;
    
    // Positive clarity indicators
    if (/\b(specifically|exactly|precisely|clearly|obviously)\b/i.test(content)) score += 5;
    if (/\b(for example|such as|like|including)\b/i.test(content)) score += 5;
    if (/\b(first|second|third|finally|in conclusion)\b/i.test(content)) score += 5;
    
    // Negative clarity indicators
    if (/\b(maybe|perhaps|possibly|might|could be|not sure)\b/i.test(content)) score -= 5;
    if (/\b(thing|stuff|something|somehow|whatever)\b/i.test(content)) score -= 10;
    
    // Sentence structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = content.length / sentences.length;
    
    if (avgSentenceLength > 200) score -= 10; // Too long
    if (avgSentenceLength < 20) score -= 5;   // Too short
    if (avgSentenceLength >= 50 && avgSentenceLength <= 150) score += 5; // Good length
    
    return Math.max(-20, Math.min(20, score));
  }
  
  private assessSpecificity(content: string): number {
    let score = 0;
    
    // Numbers and measurements
    const numberMatches = content.match(/\b\d+(\.\d+)?(%|px|em|ms|seconds?|minutes?|hours?|days?|weeks?|months?|years?)?\b/g);
    if (numberMatches && numberMatches.length > 0) score += Math.min(10, numberMatches.length * 2);
    
    // Specific terms vs vague terms
    const specificTerms = /\b(exactly|specifically|precisely|detailed|concrete|explicit)\b/i;
    const vagueTerms = /\b(generally|basically|sort of|kind of|more or less|approximately)\b/i;
    
    if (specificTerms.test(content)) score += 5;
    if (vagueTerms.test(content)) score -= 5;
    
    // Technical terms (indicates specificity)
    const technicalTerms = content.match(/\b[A-Z]{2,}|\b\w+\.\w+|\b\w+\(\)|\b\w+\[\]/g);
    if (technicalTerms && technicalTerms.length > 0) score += Math.min(5, technicalTerms.length);
    
    return Math.max(-15, Math.min(15, score));
  }
  
  private assessContextProvision(message: Message, context: ConversationContext): number {
    let score = 0;
    
    // References to previous conversation
    if (/\b(as mentioned|as discussed|previously|earlier|above|before)\b/i.test(message.content)) score += 5;
    
    // Background information
    if (/\b(background|context|situation|currently|right now)\b/i.test(message.content)) score += 5;
    
    // Assumptions stated
    if (/\b(assuming|given that|provided that|if we|suppose)\b/i.test(message.content)) score += 5;
    
    // Missing context indicators
    if (/\b(what do you mean|can you clarify|I don't understand|unclear)\b/i.test(message.content)) score -= 10;
    
    return Math.max(-15, Math.min(15, score));
  }
  
  private assessActionability(content: string): number {
    let score = 0;
    
    // Action verbs
    const actionVerbs = /\b(do|make|create|build|implement|execute|perform|complete|finish|start|begin)\b/i;
    if (actionVerbs.test(content)) score += 5;
    
    // Questions that lead to action
    if (/\b(how do|what should|when can|where do|who will)\b/i.test(content)) score += 5;
    
    // Next steps
    if (/\b(next step|next|then|after that|following|subsequently)\b/i.test(content)) score += 5;
    
    // Vague language
    if (/\b(think about|consider|maybe|perhaps|possibly)\b/i.test(content)) score -= 5;
    
    return Math.max(-10, Math.min(10, score));
  }
  
  private assessMessageLength(content: string): number {
    const length = content.length;
    const wordCount = content.split(/\s+/).length;
    
    // Optimal range
    if (length >= 100 && length <= 1000 && wordCount >= 20 && wordCount <= 200) return 15;
    
    // Acceptable ranges
    if (length >= 50 && length <= 1500 && wordCount >= 10 && wordCount <= 300) return 5;
    
    // Too short
    if (length < 20 || wordCount < 5) return -15;
    
    // Too long
    if (length > 3000 || wordCount > 600) return -10;
    
    return 0;
  }
  
  private assessComplexity(content: string, context: ConversationContext): number {
    let score = 0;
    
    // Complexity indicators
    const complexWords = content.match(/\b\w{8,}\b/g) || [];
    const complexityRatio = complexWords.length / content.split(/\s+/).length;
    
    if (complexityRatio > 0.3) score -= 10; // Too complex
    if (complexityRatio < 0.1) score -= 5;  // Too simple
    if (complexityRatio >= 0.15 && complexityRatio <= 0.25) score += 10; // Good balance
    
    // Nested concepts
    const nestedConcepts = (content.match(/\([^)]+\)/g) || []).length;
    if (nestedConcepts > 3) score -= 5;
    if (nestedConcepts === 1 || nestedConcepts === 2) score += 5;
    
    return Math.max(-20, Math.min(20, score));
  }
  
  private assessTiming(message: Message, context: ConversationContext): number {
    // This is a simplified timing assessment
    // In a real implementation, you'd consider actual timestamps and conversation flow
    
    let score = 0;
    
    // Message position in conversation
    if (context.messagePosition !== undefined) {
      if (context.messagePosition === 0) {
        // First message should set context
        if (/\b(goal|objective|want to|need to|trying to)\b/i.test(message.content)) score += 5;
      } else if (context.messagePosition > 10) {
        // Later messages should be more focused
        if (message.content.length > 1000) score -= 5; // Too verbose late in conversation
      }
    }
    
    return Math.max(-10, Math.min(10, score));
  }
  
  private assessCognitiveLoad(content: string): number {
    let score = 0;
    
    // Multiple questions (cognitive overload)
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount > 3) score -= 10;
    if (questionCount === 1 || questionCount === 2) score += 5;
    
    // Multiple topics
    const topicMarkers = (content.match(/\b(also|additionally|furthermore|moreover|another|next)\b/gi) || []).length;
    if (topicMarkers > 3) score -= 10;
    
    // Focus indicators
    if (/\b(focus|concentrate|specifically|only|just|single)\b/i.test(content)) score += 5;
    
    return Math.max(-15, Math.min(15, score));
  }
  
  private detectCreativity(content: string): number {
    let score = 0;
    
    // Creative language patterns
    if (/\b(imagine|envision|picture|creative|innovative|novel|unique)\b/i.test(content)) score += 5;
    
    // Metaphors and analogies
    if (/\b(like|as if|similar to|reminds me of|think of it as)\b/i.test(content)) score += 5;
    
    // Alternative approaches
    if (/\b(alternative|different|another way|what if|instead)\b/i.test(content)) score += 5;
    
    // Questions that spark creativity
    if (/\b(what if|how might|could we|why not|what about)\b/i.test(content)) score += 5;
    
    // Brainstorming language
    if (/\b(brainstorm|ideas|possibilities|options|variations)\b/i.test(content)) score += 5;
    
    return Math.min(25, score);
  }
  
  private assessSynthesis(content: string, context: ConversationContext): number {
    let score = 0;
    
    // Connecting concepts
    if (/\b(combine|merge|integrate|connect|link|relate|together)\b/i.test(content)) score += 5;
    
    // Cross-domain thinking
    if (/\b(from|field|domain|area|discipline|approach|perspective)\b/i.test(content)) score += 5;
    
    // Pattern recognition
    if (/\b(pattern|trend|similarity|common|shared|across)\b/i.test(content)) score += 5;
    
    // Building on previous ideas
    if (/\b(building on|based on|extending|expanding|developing)\b/i.test(content)) score += 5;
    
    return Math.min(20, score);
  }
  
  private detectNovelty(content: string): number {
    let score = 0;
    
    // Novel language
    if (/\b(new|novel|fresh|original|unprecedented|breakthrough)\b/i.test(content)) score += 5;
    
    // Unconventional approaches
    if (/\b(unconventional|unusual|different|unique|innovative)\b/i.test(content)) score += 5;
    
    // Challenging assumptions
    if (/\b(assume|assumption|challenge|question|rethink|reconsider)\b/i.test(content)) score += 5;
    
    return Math.min(15, score);
  }
  
  private assessBreakthroughPotential(content: string): number {
    let score = 0;
    
    // Breakthrough language
    if (/\b(breakthrough|eureka|aha|insight|revelation|discovery)\b/i.test(content)) score += 5;
    
    // Game-changing concepts
    if (/\b(game.?chang|revolutionary|transform|paradigm|shift)\b/i.test(content)) score += 5;
    
    return Math.min(10, score);
  }
  
  private calculateOverallScore(dimensions: { strategic: number; tactical: number; cognitive: number; innovation: number }): number {
    return Math.round(
      dimensions.strategic * this.weights.strategic +
      dimensions.tactical * this.weights.tactical +
      dimensions.cognitive * this.weights.cognitive +
      dimensions.innovation * this.weights.innovation
    );
  }
  
  private classifyScore(score: number): 'brilliant' | 'excellent' | 'good' | 'average' | 'mistake' | 'blunder' {
    if (score >= 80) return 'brilliant';
    if (score >= 70) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    if (score >= 20) return 'mistake';
    return 'blunder';
  }
  
  private getChessNotation(score: number): '!!' | '!' | '+' | '=' | '?' | '??' {
    if (score >= 80) return '!!';
    if (score >= 70) return '!';
    if (score >= 60) return '+';
    if (score >= 40) return '=';
    if (score >= 20) return '?';
    return '??';
  }
  
  private generateExplanation(dimensions: { strategic: number; tactical: number; cognitive: number; innovation: number }, context: ConversationContext): string {
    const weakest = this.findWeakestDimension(dimensions);
    const strongest = this.findStrongestDimension(dimensions);
    
    if (dimensions[weakest] < 40) {
      return `Weak ${weakest} dimension affecting overall quality. ${this.getDimensionHint(weakest)}`;
    }
    
    if (dimensions[strongest] > 80) {
      return `Excellent ${strongest} approach. ${this.getStrengthDescription(strongest)}`;
    }
    
    return 'Balanced performance across dimensions with room for improvement.';
  }
  
  private findWeakestDimension(dimensions: { strategic: number; tactical: number; cognitive: number; innovation: number }): string {
    return Object.entries(dimensions).reduce((min, [key, value]) => 
      value < dimensions[min] ? key : min, 'strategic');
  }
  
  private findStrongestDimension(dimensions: { strategic: number; tactical: number; cognitive: number; innovation: number }): string {
    return Object.entries(dimensions).reduce((max, [key, value]) => 
      value > dimensions[max] ? key : max, 'strategic');
  }
  
  private getDimensionHint(dimension: string): string {
    const hints = {
      strategic: 'Focus more on goal advancement and clear outcomes.',
      tactical: 'Be more specific and provide clearer context.',
      cognitive: 'Consider message length and complexity appropriateness.',
      innovation: 'Try more creative approaches or novel perspectives.'
    };
    return hints[dimension] || 'Consider improving this dimension.';
  }
  
  private getStrengthDescription(dimension: string): string {
    const descriptions = {
      strategic: 'Strong goal alignment and strategic thinking.',
      tactical: 'Clear, specific, and well-contextualized communication.',
      cognitive: 'Appropriate complexity and cognitive load management.',
      innovation: 'Creative and novel approach to the problem.'
    };
    return descriptions[dimension] || 'Strong performance in this area.';
  }
  
  private suggestBetterMove(message: Message, dimensions: { strategic: number; tactical: number; cognitive: number; innovation: number }, context: ConversationContext): string {
    const weakest = this.findWeakestDimension(dimensions);
    
    const suggestions = {
      strategic: 'Try connecting your message more directly to your main goal. Be explicit about how this advances your objective.',
      tactical: 'Be more specific in your request. Provide concrete examples and clear context for better results.',
      cognitive: 'Consider breaking this into smaller, more focused questions. Reduce complexity for clearer thinking.',
      innovation: 'Try approaching this from a different angle. What would an expert in another field suggest?'
    };
    
    return suggestions[weakest] || 'Consider being more specific and goal-oriented in your communication.';
  }
  
  private getDefaultScore(): ChessScore {
    return {
      overall: 50,
      dimensions: {
        strategic: 50,
        tactical: 50,
        cognitive: 50,
        innovation: 50
      },
      classification: 'average',
      chessNotation: '=',
      confidence: 0.1,
      explanation: 'Default score due to analysis error',
      betterMove: 'Try rephrasing your message more clearly.'
    };
  }
}

export default LocalScoringEngine;

