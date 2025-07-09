// ОБНОВИТЬ apps/api/src/lib/claude-client.ts

import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger';
import { config } from './config';

export interface AnalysisContext {
  userId?: string;
  previousMessages?: any[];
  messagePosition?: number;
  analysisDepth?: 'quick' | 'standard' | 'deep';
  projectContext?: string;
  sessionGoal?: string;
}

export interface ChessScore {
  overall: number;
  dimensions: {
    strategic: number;
    tactical: number;
    cognitive: number;
    innovation: number;
  };
  classification: string;
  chessNotation: string;
  confidence: number;
  explanation: string;
  betterMove?: string;
}

export class ClaudeClient {
  private anthropic: Anthropic;

  constructor() {
    if (!config.anthropic?.apiKey) {
      logger.warn('Claude API key not configured - using fallback scoring');
    }
    
    this.anthropic = new Anthropic({
      apiKey: config.anthropic?.apiKey || 'dummy'
    });
  }

  /**
   * 🎯 CLAUDE SONNET 4 ANALYSIS - UNLIMITED POWER
   */
  async analyzeMessage(
    message: any,
    context: AnalysisContext
  ): Promise<ChessScore> {
    try {
      if (!config.anthropic?.apiKey) {
        return this.localFallbackScoring(message, context);
      }

      console.log('🧠 CLAUDE SONNET 4 ANALYSIS STARTING...');
      
      const prompt = this.buildAnalysisPrompt(message, context);
      
      // 🚀 CLAUDE SONNET 4 - NO LIMITS!
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // ✅ UPDATED TO CLAUDE 4
        max_tokens: 4000, // Increased for detailed analysis
        temperature: 0.1, // Low temperature for consistent scoring
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      console.log('✅ CLAUDE ANALYSIS COMPLETE');
      
      const analysisText = response.content[0]?.text || '';
      return this.parseAnalysisResponse(analysisText);

    } catch (error) {
      logger.error('Claude analysis failed', { 
        error: error.message,
        messageRole: message.role,
        messageLength: message.content?.length 
      });
      
      // Fallback to local scoring instead of failing
      return this.localFallbackScoring(message, context);
    }
  }

  /**
   * 💰 BATCH ANALYSIS FOR COST OPTIMIZATION (50% discount)
   */
  async analyzeBatch(
    messages: any[],
    context: AnalysisContext
  ): Promise<ChessScore[]> {
    if (!config.anthropic?.apiKey || messages.length < 5) {
      // Use individual analysis for small batches
      const scores = [];
      for (const message of messages) {
        scores.push(await this.analyzeMessage(message, context));
      }
      return scores;
    }

    try {
      console.log(`💰 BATCH ANALYSIS: ${messages.length} messages (50% cost reduction)`);
      
      // Prepare batch requests
      const batchRequests = messages.map((message, index) => ({
        custom_id: `msg_${index}`,
        params: {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          temperature: 0.1,
          messages: [
            {
              role: 'user',
              content: this.buildAnalysisPrompt(message, {
                ...context,
                messagePosition: index,
                previousMessages: messages.slice(0, index)
              })
            }
          ]
        }
      }));

      // Submit batch job
      const batch = await this.anthropic.batches.create({
        requests: batchRequests
      });

      console.log(`📦 BATCH SUBMITTED: ${batch.id}`);
      
      // Wait for completion (with timeout)
      let batchStatus = batch;
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max wait
      
      while (batchStatus.processing_status !== 'ended' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
        batchStatus = await this.anthropic.batches.retrieve(batch.id);
        attempts++;
        console.log(`⏳ BATCH STATUS: ${batchStatus.processing_status} (${attempts}/${maxAttempts})`);
      }

      if (batchStatus.processing_status !== 'ended') {
        console.log('⚠️ BATCH TIMEOUT - falling back to individual analysis');
        return this.analyzeIndividually(messages, context);
      }

      // Retrieve and parse results
      const results = await this.anthropic.batches.results(batch.id);
      const scores: ChessScore[] = [];

      for (const result of results) {
        if (result.result?.type === 'succeeded') {
          const analysisText = result.result.message.content[0]?.text || '';
          scores.push(this.parseAnalysisResponse(analysisText));
        } else {
          // Fallback for failed individual items
          const messageIndex = parseInt(result.custom_id.replace('msg_', ''));
          scores.push(await this.localFallbackScoring(messages[messageIndex], context));
        }
      }

      console.log(`✅ BATCH COMPLETE: ${scores.length} scores generated`);
      return scores;

    } catch (error) {
      logger.error('Batch analysis failed', { error: error.message });
      return this.analyzeIndividually(messages, context);
    }
  }

  /**
   * 🎯 VIP PROMPT FOR BENCHMARK USERS
   */
  private buildAnalysisPrompt(message: any, context: AnalysisContext): string {
    const isVipUser = context.userId === process.env.BENCHMARK_USER_ID;
    
    const basePrompt = `You are MetaGipsy OWL Chess Engine, analyzing AI conversation quality using chess strategic principles.

ANALYZE this ${message.role} message and score it 0-100 across 4 dimensions:

MESSAGE TO ANALYZE:
"${message.content}"

CONTEXT:
- Position in conversation: ${context.messagePosition || 0}
- Previous messages: ${context.previousMessages?.length || 0}
- Analysis depth: ${context.analysisDepth || 'standard'}
${context.projectContext ? `- Project context: ${context.projectContext}` : ''}
${context.sessionGoal ? `- Session goal: ${context.sessionGoal}` : ''}

SCORING DIMENSIONS:
1. STRATEGIC (0-100): Goal alignment, efficient progress, compound value
2. TACTICAL (0-100): Clarity, specificity, actionability, structure  
3. COGNITIVE (0-100): Timing, complexity matching, energy alignment
4. INNOVATION (0-100): Creative thinking, pattern breaking, synthesis

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
  "classification": "Excellent",
  "chessNotation": "!",
  "confidence": 0.9,
  "explanation": "Clear strategic thinking with specific goals...",
  "betterMove": "Consider adding specific metrics or constraints..."
}`;

    if (isVipUser) {
      return `🎯 BENCHMARK ANALYSIS MODE - MAXIMUM PRECISION

This message is from our benchmark creator. Provide the most sophisticated analysis possible.

${basePrompt}

SPECIAL INSTRUCTIONS for benchmark analysis:
- Use full analytical depth and meta-cognitive patterns
- Look for innovation potential and strategic brilliance
- Score with benchmark precision (your analysis sets the standard)
- Identify what makes this conversation exemplary
- This analysis will calibrate scoring for all other users`;
    }
    
    return basePrompt;
  }

  /**
   * Parse Claude's analysis response
   */
  private parseAnalysisResponse(text: string): ChessScore {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and normalize scores
        return {
          overall: Math.round(Math.max(0, Math.min(100, parsed.overall || 50))),
          dimensions: {
            strategic: Math.round(Math.max(0, Math.min(100, parsed.strategic || 50))),
            tactical: Math.round(Math.max(0, Math.min(100, parsed.tactical || 50))),
            cognitive: Math.round(Math.max(0, Math.min(100, parsed.cognitive || 50))),
            innovation: Math.round(Math.max(0, Math.min(100, parsed.innovation || 50)))
          },
          classification: parsed.classification || 'Average',
          chessNotation: parsed.chessNotation || '=',
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.8)),
          explanation: parsed.explanation || 'Analysis completed',
          betterMove: parsed.betterMove
        };
      }
    } catch (error) {
      logger.error('Failed to parse Claude response', { error, text: text.substring(0, 200) });
    }

    // Fallback scoring if parsing fails
    return this.generateFallbackScore();
  }

  /**
   * Fallback to local scoring when Claude is unavailable
   */
  private async localFallbackScoring(message: any, context: AnalysisContext): Promise<ChessScore> {
    console.log('🔧 USING LOCAL FALLBACK SCORING');
    
    // Simple heuristic scoring
    const content = message.content || '';
    const length = content.length;
    
    let strategic = 50;
    let tactical = 50;
    let cognitive = 50;
    let innovation = 50;

    // Strategic scoring
    if (content.match(/goal|objective|target|achieve|result/i)) strategic += 15;
    if (content.match(/because|therefore|so that|in order to/i)) strategic += 10;
    if (content.match(/\?/g)?.length > 0) strategic += 5;

    // Tactical scoring  
    if (length > 100) tactical += 10;
    if (content.match(/\d+/g)?.length > 0) tactical += 15; // Has numbers
    if (content.match(/for example|such as|specifically/i)) tactical += 10;
    if (content.includes('\n')) tactical += 5; // Structured

    // Cognitive scoring
    if (length > 50 && length < 500) cognitive += 10; // Good length
    if (context.messagePosition === 0) cognitive += 5; // Good start
    
    // Innovation scoring
    if (content.match(/creative|innovative|alternative|different/i)) innovation += 15;
    if (content.match(/what if|how about|consider/i)) innovation += 10;

    // Normalize scores
    strategic = Math.min(100, strategic);
    tactical = Math.min(100, tactical);
    cognitive = Math.min(100, cognitive);
    innovation = Math.min(100, innovation);

    const overall = Math.round((strategic + tactical + cognitive + innovation) / 4);

    return {
      overall,
      dimensions: { strategic, tactical, cognitive, innovation },
      classification: this.getClassification(overall),
      chessNotation: this.getChessNotation(overall),
      confidence: 0.6, // Lower confidence for fallback
      explanation: `Local analysis: Strategic clarity and goal focus detected.`,
      betterMove: overall < 70 ? 'Consider being more specific about your goals and context.' : undefined
    };
  }

  /**
   * Analyze messages individually (fallback for batch failures)
   */
  private async analyzeIndividually(messages: any[], context: AnalysisContext): Promise<ChessScore[]> {
    const scores = [];
    for (let i = 0; i < messages.length; i++) {
      scores.push(await this.analyzeMessage(messages[i], {
        ...context,
        messagePosition: i,
        previousMessages: messages.slice(0, i)
      }));
    }
    return scores;
  }

  private generateFallbackScore(): ChessScore {
    return {
      overall: 50,
      dimensions: { strategic: 50, tactical: 50, cognitive: 50, innovation: 50 },
      classification: 'Average',
      chessNotation: '=',
      confidence: 0.5,
      explanation: 'Fallback scoring applied due to analysis error'
    };
  }

  private getClassification(score: number): string {
    if (score >= 90) return 'Brilliant';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 30) return 'Mistake';
    return 'Blunder';
  }

  private getChessNotation(score: number): string {
    if (score >= 90) return '!!';
    if (score >= 80) return '!';
    if (score >= 70) return '+';
    if (score >= 50) return '=';
    if (score >= 30) return '?';
    return '??';
  }
}