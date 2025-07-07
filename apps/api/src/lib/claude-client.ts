import Anthropic from '@anthropic-ai/sdk';
// FIXED: Changed import path from @/types to ../types
import { Message, ChessScore, ConversationContext } from '../types';
import { config } from './config';
import { cache } from './redis';
import { logger } from './logger';
import { RateLimiter } from './rate-limiter';
import { LocalScoringEngine } from './scoring-engine';

export class ClaudeClient {
  private anthropic: Anthropic;
  private rateLimiter: RateLimiter;
  private localEngine: LocalScoringEngine;
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.anthropic?.apiKey || ''
    });
    this.rateLimiter = new RateLimiter();
    this.localEngine = new LocalScoringEngine();
  }
  
  /**
   * Analyze a message with Claude API (with fallback to local scoring)
   */
  async analyzeMessage(
    message: Message,
    context: ConversationContext,
    analysisDepth: 'quick' | 'standard' | 'deep' = 'standard'
  ): Promise<ChessScore> {
    // Check cache first
    const cacheKey = this.getCacheKey(message, context, analysisDepth);
    const cached = await cache.get<ChessScore>(cacheKey);
    if (cached) {
      logger.debug('Cache hit for message analysis');
      return cached;
    }
    
    try {
      // Check rate limits
      if (context.userId) {
        await this.rateLimiter.checkLimit(context.userId, 'free'); // Default to free tier
      }
      
      const model = this.selectModel(analysisDepth);
      const prompt = this.buildAnalysisPrompt(message, context);
      
      logger.debug(`Analyzing message with Claude (${model})`);
      
      const response = await this.anthropic.messages.create({
        model,
        max_tokens: 1000,
        temperature: 0.3, // Low temperature for consistent scoring
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      // FIXED: Handle new Anthropic SDK response structure
      const score = this.parseScoreFromResponse(response);
      
      // Cache the result for 1 hour
      await cache.set(cacheKey, score, 3600);
      
      logger.debug('Claude analysis completed successfully');
      return score;
      
    } catch (error) {
      logger.error('Claude API error, falling back to local scoring:', error);
      
      // Fallback to local scoring
      const localScore = await this.localEngine.scoreMessage(message, context);
      
      // Cache the fallback result for shorter time (15 minutes)
      await cache.set(cacheKey, localScore, 900);
      
      return localScore;
    }
  }
  
  /**
   * Batch analyze multiple messages
   */
  async analyzeMessages(
    messages: Message[],
    context: ConversationContext,
    analysisDepth: 'quick' | 'standard' | 'deep' = 'standard'
  ): Promise<ChessScore[]> {
    const scores: ChessScore[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      const messageContext = {
        ...context,
        previousMessages: messages.slice(0, i),
        messagePosition: i,
        scoreTrend: this.calculateTrend(scores)
      };
      
      const score = await this.analyzeMessage(messages[i], messageContext, analysisDepth);
      scores.push(score);
      
      // Small delay to avoid rate limiting
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return scores;
  }
  
  /**
   * Select appropriate model based on analysis depth
   */
  private selectModel(analysisDepth: 'quick' | 'standard' | 'deep'): string {
    switch (analysisDepth) {
      case 'quick':
        return 'claude-3-haiku-20240307';  // Fast, cheap
      case 'deep':
        return 'claude-3-opus-20240229';    // Most capable
      default:
        return 'claude-3-sonnet-20240229';  // Balanced
    }
  }
  
  /**
   * Build analysis prompt for Claude
   */
  private buildAnalysisPrompt(message: Message, context: ConversationContext): string {
    const contextInfo = this.buildContextInfo(context);
    
    return `You are MetaGipsy OWL, an expert conversation analyst that evaluates human-AI interactions using chess-like scoring principles.

Your task is to analyze this message exchange and provide a detailed score across 4 dimensions:

**Message to Analyze:**
Role: ${message.role}
Content: "${message.content}"

**Context:**
${contextInfo}

**Scoring Framework (0-100 points each):**

1. **Strategic (30% weight)**: Does this message advance toward the stated goal?
   - Goal alignment and relevance
   - Progress indicators and momentum
   - Resource efficiency and timing
   - Long-term impact potential

2. **Tactical (30% weight)**: How well is the message crafted?
   - Clarity and specificity
   - Context provision and background
   - Actionability and next steps
   - Communication effectiveness

3. **Cognitive (25% weight)**: Is the cognitive load appropriate?
   - Message length and complexity
   - Timing and attention management
   - Information processing load
   - Mental state optimization

4. **Innovation (15% weight)**: Does it show creative thinking?
   - Novel approaches and perspectives
   - Creative synthesis of ideas
   - Breakthrough potential
   - Paradigm-shifting insights

**Chess Classification System:**
- 80-100: Brilliant (!!) - Exceptional move with breakthrough potential
- 70-79: Excellent (!) - Strong move advancing goals effectively
- 60-69: Good (+) - Solid move with clear benefits
- 40-59: Average (=) - Acceptable but unremarkable
- 20-39: Mistake (?) - Suboptimal with missed opportunities
- 0-19: Blunder (??) - Counterproductive or harmful

**Required Output Format (JSON only):**
{
  "overall": 75,
  "dimensions": {
    "strategic": 80,
    "tactical": 70,
    "cognitive": 75,
    "innovation": 70
  },
  "classification": "excellent",
  "explanation": "Clear goal advancement with specific examples and good strategic thinking.",
  "betterMove": null
}

**Important Guidelines:**
- Overall score = Strategic×0.3 + Tactical×0.3 + Cognitive×0.25 + Innovation×0.15
- Provide "betterMove" suggestion only if overall score < 60
- Be precise and constructive in your analysis
- Consider the conversation context and flow
- Focus on actionable insights

Analyze the message now:`;
  }
  
  /**
   * Build context information for the prompt
   */
  private buildContextInfo(context: ConversationContext): string {
    const parts: string[] = [];
    
    if (context.sessionGoal) {
      parts.push(`Goal: ${context.sessionGoal}`);
    }
    
    if (context.projectContext) {
      parts.push(`Project: ${context.projectContext}`);
    }
    
    if (context.messagePosition !== undefined) {
      parts.push(`Position: Message ${context.messagePosition + 1} in conversation`);
    }
    
    if (context.scoreTrend) {
      parts.push(`Trend: ${context.scoreTrend}`);
    }
    
    if (context.previousMessages && context.previousMessages.length > 0) {
      const recentMessages = context.previousMessages.slice(-2);
      parts.push(`Recent context: ${recentMessages.map(m => `${m.role}: ${m.content.substring(0, 100)}...`).join(' | ')}`);
    }
    
    return parts.length > 0 ? parts.join('\n') : 'No additional context provided';
  }
  
  /**
   * Parse Claude's response to extract score
   * FIXED: Handle new Anthropic SDK response structure
   */
  private parseScoreFromResponse(response: any): ChessScore {
    try {
      // Handle new response structure
      let textContent = '';
      
      if (response.content && Array.isArray(response.content)) {
        // Find text content block
        const textBlock = response.content.find((block: any) => block.type === 'text');
        if (textBlock && textBlock.text) {
          textContent = textBlock.text;
        }
      } else if (typeof response.content === 'string') {
        textContent = response.content;
      } else {
        throw new Error('Unexpected response format from Claude');
      }
      
      // Extract JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.overall || !parsed.dimensions || !parsed.classification) {
        throw new Error('Invalid response format from Claude');
      }
      
      return {
        overall: Math.round(parsed.overall),
        dimensions: {
          strategic: Math.round(parsed.dimensions.strategic),
          tactical: Math.round(parsed.dimensions.tactical),
          cognitive: Math.round(parsed.dimensions.cognitive),
          innovation: Math.round(parsed.dimensions.innovation)
        },
        classification: parsed.classification,
        chessNotation: this.getChessNotation(parsed.overall),
        confidence: 0.9, // High confidence for Claude analysis
        explanation: parsed.explanation || 'Analysis completed by Claude',
        betterMove: parsed.betterMove || undefined
      };
    } catch (error) {
      logger.error('Failed to parse Claude response:', error);
      throw new Error('Failed to parse Claude analysis response');
    }
  }
  
  /**
   * Get chess notation for score
   */
  private getChessNotation(score: number): '!!' | '!' | '+' | '=' | '?' | '??' {
    if (score >= 80) return '!!';
    if (score >= 70) return '!';
    if (score >= 60) return '+';
    if (score >= 40) return '=';
    if (score >= 20) return '?';
    return '??';
  }
  
  /**
   * Generate cache key for message analysis
   */
  private getCacheKey(message: Message, context: ConversationContext, depth: string): string {
    const contextHash = this.hashContext(context);
    const messageHash = this.hashMessage(message);
    return cache.generateKey('claude_analysis', messageHash, contextHash, depth);
  }
  
  /**
   * Hash message content for caching
   */
  private hashMessage(message: Message): string {
    const content = `${message.role}:${message.content}`;
    return Buffer.from(content).toString('base64').substring(0, 16);
  }
  
  /**
   * Hash context for caching
   */
  private hashContext(context: ConversationContext): string {
    const contextStr = JSON.stringify({
      goal: context.sessionGoal,
      project: context.projectContext,
      position: context.messagePosition
    });
    return Buffer.from(contextStr).toString('base64').substring(0, 16);
  }
  
  /**
   * Calculate score trend from previous scores
   */
  private calculateTrend(scores: ChessScore[]): 'improving' | 'declining' | 'stable' {
    if (scores.length < 2) return 'stable';
    
    const recent = scores.slice(-3);
    const first = recent[0].overall;
    const last = recent[recent.length - 1].overall;
    
    const diff = last - first;
    
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }
  
  /**
   * Check if Claude API is available
   */
  async healthCheck(): Promise<{ available: boolean; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      
      await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Hello'
        }]
      });
      
      const latency = Date.now() - start;
      
      return { available: true, latency };
    } catch (error) {
      logger.error('Claude health check failed:', error);
      return { 
        available: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default ClaudeClient;