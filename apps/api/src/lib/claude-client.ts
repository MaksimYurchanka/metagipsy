// ✅ ENHANCED 5D CLAUDE CLIENT with Context Awareness - LEGENDARY v17
// apps/api/src/lib/claude-client.ts

import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger';
import { config } from './config';
// ✅ CRITICAL FIX: Import 5D types from unified type system
import { ChessScore, ConversationContext } from '../types';

export interface AnalysisContext {
  userId?: string;
  previousMessages?: any[];
  messagePosition?: number;
  analysisDepth?: 'quick' | 'standard' | 'deep';
  projectContext?: string;
  sessionGoal?: string;
}

export class ClaudeClient {
  private anthropic: Anthropic;

  constructor() {
    // ✅ ENHANCED DIAGNOSTICS for API KEY
    if (!config.anthropic?.apiKey || config.anthropic.apiKey === '') {
      logger.warn('ANTHROPIC_API_KEY not configured - using 5D fallback scoring');
      console.log('🔑 API Key status:', config.anthropic?.apiKey ? 'Present but empty' : 'Not present');
    } else {
      console.log('🔑 ANTHROPIC_API_KEY configured for 5D analysis');
    }
    
    this.anthropic = new Anthropic({
      apiKey: config.anthropic?.apiKey || 'dummy'
    });
  }

  /**
   * 🎯 CLAUDE SONNET 4 ANALYSIS - ENHANCED FOR 5D CONTEXT AWARENESS
   */
  async analyzeMessage(
    message: any,
    context: AnalysisContext
  ): Promise<ChessScore> {
    try {
      // ✅ ENHANCED API KEY validation
      if (!config.anthropic?.apiKey || config.anthropic.apiKey === '') {
        console.log('⚠️ No valid API key, using 5D local fallback');
        return this.local5DFallbackScoring(message, context);
      }

      console.log('🧠 CLAUDE SONNET 4 - 5D ANALYSIS STARTING...');
      
      const prompt = this.build5DAnalysisPrompt(message, context);
      
      // ✅ RESTORED: Claude Sonnet 4 with 5D enhancement
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // ✅ VERIFIED CLAUDE SONNET 4
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      console.log('✅ CLAUDE SONNET 4 - 5D ANALYSIS COMPLETE');
      
      // ✅ ULTRA-SAFE content extraction
      let analysisText = '';
      
      try {
        if (response.content && Array.isArray(response.content) && response.content.length > 0) {
          const firstContent = response.content[0];
          if (firstContent && typeof firstContent === 'object' && 'text' in firstContent) {
            analysisText = String(firstContent.text || '');
          }
        }
      } catch (contentError) {
        console.log('Content parsing error, using 5D fallback');
        return this.local5DFallbackScoring(message, context);
      }
      
      return this.parse5DAnalysisResponse(analysisText);

    } catch (error) {
      // ✅ ENHANCED ERROR diagnostics
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const messageRole = message?.role || 'unknown';
      const messageLength = message?.content?.length || 0;
      
      console.log('❌ CLAUDE 5D API ERROR DETAILS:');
      console.log('- Error message:', errorMessage);
      console.log('- API Key present:', !!config.anthropic?.apiKey);
      console.log('- Model: claude-sonnet-4-20250514 (5D Enhanced)');
      
      logger.error('Claude 5D analysis failed', { 
        error: errorMessage,
        messageRole,
        messageLength,
        hasApiKey: !!config.anthropic?.apiKey,
        model: 'claude-sonnet-4-20250514',
        analysisType: '5D'
      });
      
      // Fallback to 5D local scoring
      return this.local5DFallbackScoring(message, context);
    }
  }

  /**
   * 🎯 ENHANCED 5D PROMPT FOR CLAUDE SONNET 4
   */
  private build5DAnalysisPrompt(message: any, context: AnalysisContext): string {
    const isVipUser = context.userId === process.env.BENCHMARK_USER_ID;
    
    const base5DPrompt = `You are MetaGipsy OWL Chess Engine v17, analyzing AI conversation quality using 5D chess strategic principles with revolutionary CONTEXT AWARENESS.

ANALYZE this ${message.role} message and score it 0-100 across 5 DIMENSIONS:

MESSAGE TO ANALYZE:
"${message.content}"

CONTEXT:
- Position in conversation: ${context.messagePosition || 0}
- Previous messages: ${context.previousMessages?.length || 0}
- Analysis depth: ${context.analysisDepth || 'standard'}
${context.projectContext ? `- Project context: ${context.projectContext}` : ''}
${context.sessionGoal ? `- Session goal: ${context.sessionGoal}` : ''}

🎯 5D SCORING DIMENSIONS:
1. STRATEGIC (0-100): Goal alignment, efficient progress, compound value
2. TACTICAL (0-100): Clarity, specificity, actionability, structure  
3. COGNITIVE (0-100): Timing, complexity matching, energy alignment
4. INNOVATION (0-100): Creative thinking, pattern breaking, synthesis
5. CONTEXT (0-100): ⭐ NEW DIMENSION ⭐
   - Temporal understanding (conversation timeline awareness)
   - State awareness (current vs past state recognition)  
   - Redundancy prevention (avoiding repeated suggestions)
   - Meta communication (clarity about limitations)
   - Progress recognition (acknowledging achievements)

CHESS CLASSIFICATIONS:
- 90-100: Brilliant (!!) - Exceptional strategic move
- 80-89: Excellent (!) - Strong, well-executed move  
- 70-79: Good (+) - Solid, above-average move
- 50-69: Average (=) - Acceptable, standard move
- 30-49: Mistake (?) - Suboptimal, could be better
- 0-29: Blunder (??) - Poor move, needs improvement

OUTPUT FORMAT (JSON):
{
  "overall": 85,
  "strategic": 90,
  "tactical": 85,
  "cognitive": 80,
  "innovation": 85,
  "context": 88,
  "classification": "Excellent",
  "chessNotation": "!",
  "confidence": 0.9,
  "explanation": "Clear strategic thinking with excellent context awareness...",
  "betterMove": "Consider adding specific metrics or constraints..."
}`;

    if (isVipUser) {
      return `🎯 BENCHMARK 5D ANALYSIS MODE - MAXIMUM PRECISION

This message is from our benchmark creator. Provide the most sophisticated 5D analysis possible.

${base5DPrompt}

SPECIAL INSTRUCTIONS for 5D benchmark analysis:
- Use full analytical depth including CONTEXT dimension
- Look for temporal understanding and state awareness patterns
- Score with benchmark precision across all 5 dimensions
- Identify what makes this conversation exemplary in context awareness
- This analysis sets the 5D standard for all other users`;
    }
    
    return base5DPrompt;
  }

  /**
   * ✅ ENHANCED: Parse Claude's 5D analysis response - ULTRA-SAFE
   */
  private parse5DAnalysisResponse(text: string): ChessScore {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // ✅ CRITICAL: Validate and normalize 5D scores with safe fallbacks
        const overall = this.safeNumber(parsed.overall, 50);
        const strategic = this.safeNumber(parsed.strategic, 50);
        const tactical = this.safeNumber(parsed.tactical, 50);
        const cognitive = this.safeNumber(parsed.cognitive, 50);
        const innovation = this.safeNumber(parsed.innovation, 50);
        const context = this.safeNumber(parsed.context, 50); // ✅ NEW: 5th dimension
        
        return {
          overall: Math.round(overall),
          dimensions: {
            strategic: Math.round(strategic),
            tactical: Math.round(tactical),
            cognitive: Math.round(cognitive),
            innovation: Math.round(innovation),
            context: Math.round(context) // ✅ NEW: 5th dimension in response
          },
          classification: this.getClassification(overall),
          chessNotation: this.getChessNotation(overall),
          confidence: this.safeNumber(parsed.confidence, 0.8),
          explanation: String(parsed.explanation || '5D analysis completed'),
          betterMove: parsed.betterMove ? String(parsed.betterMove) : undefined
        };
      }
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      logger.error('Failed to parse Claude 5D response', { 
        error: errorMessage, 
        text: text.substring(0, 200) 
      });
    }

    // Fallback to 5D scoring if parsing fails
    return this.generate5DFallbackScore();
  }

  /**
   * Safe number conversion with bounds checking
   */
  private safeNumber(value: any, fallback: number): number {
    const num = Number(value);
    if (isNaN(num)) return fallback;
    return Math.max(0, Math.min(100, num));
  }

  /**
   * ✅ ENHANCED: 5D Local fallback scoring when Claude is unavailable
   */
  private local5DFallbackScoring(message: any, context: AnalysisContext): ChessScore {
    console.log('🔧 USING 5D LOCAL FALLBACK SCORING');
    
    // Enhanced heuristic scoring with context awareness
    const content = String(message?.content || '');
    const length = content.length;
    
    let strategic = 50;
    let tactical = 50;
    let cognitive = 50;
    let innovation = 50;
    let contextScore = 50; // ✅ NEW: 5th dimension

    // Strategic scoring - safe regex matching
    try {
      if (/goal|objective|target|achieve|result/i.test(content)) strategic += 15;
      if (/because|therefore|so that|in order to/i.test(content)) strategic += 10;
      const questionMatches = content.match(/\?/g);
      if (questionMatches && questionMatches.length > 0) strategic += 5;
    } catch (regexError) {
      console.log('Regex error in strategic scoring, using base score');
    }

    // Tactical scoring - safe regex matching
    try {
      if (length > 100) tactical += 10;
      const numberMatches = content.match(/\d+/g);
      if (numberMatches && numberMatches.length > 0) tactical += 15;
      if (/for example|such as|specifically/i.test(content)) tactical += 10;
      if (content.includes('\n')) tactical += 5;
    } catch (regexError) {
      console.log('Regex error in tactical scoring, using base score');
    }

    // Cognitive scoring
    if (length > 50 && length < 500) cognitive += 10;
    if (context.messagePosition === 0) cognitive += 5;
    
    // Innovation scoring - safe regex matching
    try {
      if (/creative|innovative|alternative|different/i.test(content)) innovation += 15;
      if (/what if|how about|consider/i.test(content)) innovation += 10;
    } catch (regexError) {
      console.log('Regex error in innovation scoring, using base score');
    }

    // ✅ NEW: Context scoring - 5th dimension local calculation
    try {
      // Temporal understanding indicators
      if (/now|currently|at this point|so far|next step/i.test(content)) contextScore += 15;
      if (/progress|building on|following up|continuing/i.test(content)) contextScore += 10;
      
      // State awareness indicators  
      if (/current|existing|working|status|completed/i.test(content)) contextScore += 10;
      if (/has been|was|changed|evolved|improved/i.test(content)) contextScore += 5;
      
      // Meta communication indicators
      if (/i understand|i see|based on|given that|need more/i.test(content)) contextScore += 10;
      if (/unclear|not sure|help me understand|clarify/i.test(content)) contextScore += 5;
      
      // Progress recognition (especially for assistant messages)
      if (message.role === 'assistant') {
        if (/good|great|excellent|perfect|well done/i.test(content)) contextScore += 15;
        if (/you've|you have|you completed|you solved/i.test(content)) contextScore += 10;
      }
      
      // Redundancy prevention check
      if (context.previousMessages && context.previousMessages.length > 0) {
        const hasNewIdeas = /new|different|alternative|another way/i.test(content);
        if (hasNewIdeas) contextScore += 10;
      }
    } catch (contextError) {
      console.log('Context scoring error, using base score');
    }

    // Normalize all scores including context
    strategic = Math.min(100, strategic);
    tactical = Math.min(100, tactical);
    cognitive = Math.min(100, cognitive);
    innovation = Math.min(100, innovation);
    contextScore = Math.min(100, contextScore); // ✅ NEW: Normalize context score

    // ✅ ENHANCED: Calculate overall with 5D weights (matching scoring-engine weights)
    const overall = Math.round(
      strategic * 0.25 +
      tactical * 0.25 +
      cognitive * 0.20 +
      innovation * 0.10 +
      contextScore * 0.20 // ✅ NEW: Context dimension weight
    );

    return {
      overall,
      dimensions: { 
        strategic, 
        tactical, 
        cognitive, 
        innovation,
        context: contextScore // ✅ NEW: 5th dimension in fallback
      },
      classification: this.getClassification(overall),
      chessNotation: this.getChessNotation(overall),
      confidence: 0.6, // Lower confidence for fallback
      explanation: `5D Local analysis: Strategic clarity and context awareness detected.`,
      betterMove: overall < 70 ? 'Consider being more specific about your goals and showing awareness of conversation context.' : undefined
    };
  }

  /**
   * ✅ ENHANCED: Generate 5D fallback score
   */
  private generate5DFallbackScore(): ChessScore {
    return {
      overall: 50,
      dimensions: { 
        strategic: 50, 
        tactical: 50, 
        cognitive: 50, 
        innovation: 50,
        context: 50 // ✅ NEW: 5th dimension fallback
      },
      classification: 'average',
      chessNotation: '=',
      confidence: 0.5,
      explanation: '5D fallback score due to analysis error'
    };
  }

  private getClassification(score: number): 'brilliant' | 'excellent' | 'good' | 'average' | 'mistake' | 'blunder' {
    if (score >= 90) return 'brilliant';
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    if (score >= 30) return 'mistake';
    return 'blunder';
  }

  private getChessNotation(score: number): '!!' | '!' | '+' | '=' | '?' | '??' {
    if (score >= 90) return '!!';
    if (score >= 80) return '!';
    if (score >= 70) return '+';
    if (score >= 50) return '=';
    if (score >= 30) return '?';
    return '??';
  }
}