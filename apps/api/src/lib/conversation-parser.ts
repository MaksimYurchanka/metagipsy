// ✅ ENHANCED CONVERSATION PARSER with Claude 3.5 Haiku Integration & TYPE COMPATIBILITY
// apps/api/src/lib/conversation-parser.ts

import Anthropic from '@anthropic-ai/sdk';
import { Message, Platform, ParseResult } from '../types';
import { logger } from './logger';
import { config } from './config';

// ✅ TYPE COMPATIBLE: ParseResult options matching existing types
export interface EnhancedParseOptions {
  forcePattern?: boolean;     // Force pattern parsing (skip Haiku)
  userSignature?: string;
  expectedPlatform?: Platform;
  analysisDepth?: 'quick' | 'standard' | 'deep';
  userId?: string;
  requestId?: string;
  enableContextScoring?: boolean;
}

// ✅ TYPE COMPATIBLE: Haiku parsing result extending ParseResult
interface HaikuParseResult extends ParseResult {
  haikuCost: number;
  haikuConfidence: number;
  contextScores?: number[];  // Per-message context scores (separate from metadata)
}

export class ConversationParser {
  private static anthropic: Anthropic;
  
  // ✅ Claude 3.5 Haiku model configuration for superior conversation understanding
  private static readonly HAIKU_MODEL = 'claude-3-5-haiku-20241022'; // Latest Claude 3.5 Haiku
  
  // ✅ Initialize Anthropic client for Claude 3.5 Haiku
  private static initializeHaiku() {
    if (!this.anthropic && config.anthropic?.apiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropic.apiKey
      });
      logger.info(`🤖 HAIKU CLIENT: Initialized ${this.HAIKU_MODEL} for enhanced parsing`);
    }
  }

  /**
   * ✅ ENHANCED: Always Claude 3.5 Haiku parsing with SMARTER_CONTEXT_SCORING
   */
  static async parseConversationEnhanced(
    text: string, 
    options: EnhancedParseOptions = {}
  ): Promise<ParseResult> {
    const startTime = Date.now();
    const requestId = options.requestId || `parse_${Date.now()}`;
    
    logger.info('🚀 ENHANCED PARSING: Starting Claude 3.5 Haiku-first conversation parsing...', {
      requestId,
      textLength: text.length,
      userId: options.userId,
      model: this.HAIKU_MODEL
    });

    // ✅ ALWAYS HAIKU APPROACH: Try Claude 3.5 Haiku first, fallback only if unavailable
    if (config.anthropic?.apiKey && !options.forcePattern) {
      try {
        this.initializeHaiku();
        const haikuResult = await this.parseWithHaiku(text, options);
        
        // ✅ SMARTER_CONTEXT_SCORING: Apply progressive context logic
        if (options.enableContextScoring !== false) {
          haikuResult.contextScores = this.calculateSmarterContextScores(haikuResult.messages);
          logger.info('🧠 SMARTER_CONTEXT_SCORING: Applied progressive context logic', {
            messageCount: haikuResult.messages.length,
            contextScores: haikuResult.contextScores
          });
        }

        const processingTime = Date.now() - startTime;
        if (haikuResult.metadata) {
          haikuResult.metadata.processingTime = processingTime;
        }
        
        logger.info(`✅ ${this.HAIKU_MODEL} PARSING SUCCESS:`, {
          requestId,
          confidence: haikuResult.confidence,
          messageCount: haikuResult.messages.length,
          cost: haikuResult.haikuCost,
          processingTime
        });

        return haikuResult;
        
      } catch (haikuError) {
        logger.warn(`⚠️ ${this.HAIKU_MODEL} PARSING FAILED, using pattern fallback:`, {
          requestId,
          error: haikuError instanceof Error ? haikuError.message : 'Unknown error'
        });
      }
    }

    // ✅ FALLBACK: Use pattern parsing if Haiku unavailable
    logger.info('📋 PATTERN FALLBACK: Using traditional parsing methods');
    const patternResult = this.parseConversation(text, options);
    
    // ✅ SMARTER_CONTEXT_SCORING: Apply even to pattern parsing
    if (options.enableContextScoring !== false) {
      const contextScores = this.calculateSmarterContextScores(patternResult.messages);
      // Store context scores separately since they're not in metadata type
      (patternResult as any).contextScores = contextScores;
    }

    if (patternResult.metadata) {
      patternResult.metadata.processingTime = Date.now() - startTime;
    }
    return patternResult;
  }

  /**
   * 🤖 CLAUDE 3.5 HAIKU PARSING: AI-powered conversation understanding
   */
  private static async parseWithHaiku(
    text: string, 
    options: EnhancedParseOptions
  ): Promise<HaikuParseResult> {
    const prompt = this.buildHaikuParsingPrompt(text, options);
    
    logger.info(`🤖 ${this.HAIKU_MODEL} API: Sending parsing request...`, {
      promptLength: prompt.length,
      expectedPlatform: options.expectedPlatform
    });

    const response = await this.anthropic.messages.create({
      model: this.HAIKU_MODEL, // ✅ Claude 3.5 Haiku for superior conversation understanding
      max_tokens: 2000,
      temperature: 0.1, // Low temperature for consistent parsing
      messages: [{ role: 'user', content: prompt }]
    });

    const analysisText = this.extractResponseText(response);
    const parseResult = this.parseHaikuResponse(analysisText, text);
    
    // ✅ COST TRACKING: Calculate Claude 3.5 Haiku usage cost
    const estimatedCost = this.calculateHaikuCost(text.length + prompt.length);
    
    return {
      ...parseResult,
      haikuCost: estimatedCost,
      haikuConfidence: parseResult.confidence,
      // ✅ TYPE COMPATIBLE: Use 'haiku' instead of 'claude-3.5-haiku'
      method: 'haiku' // This matches the 'pattern' | 'haiku' | 'hybrid' union
    };
  }

  /**
   * 🧠 SMARTER_CONTEXT_SCORING: Progressive context evaluation
   */
  private static calculateSmarterContextScores(messages: Message[]): number[] {
    const contextScores: number[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      let contextScore = 0;
      
      if (i === 0) {
        // ✅ First message: Always 0 (no previous context)
        contextScore = 0;
        logger.debug('🧠 CONTEXT SCORING: First message, context = 0');
        
      } else if (i === 1) {
        // ✅ Second message: Limited context scoring (25-40)
        contextScore = this.calculateLimitedContext(messages[i], messages[i-1]);
        logger.debug('🧠 CONTEXT SCORING: Second message, limited context analysis', {
          score: contextScore
        });
        
      } else {
        // ✅ 3+ messages: Full context analysis (0-100)
        contextScore = this.calculateFullContext(messages, i);
        logger.debug('🧠 CONTEXT SCORING: Full context analysis', {
          messageIndex: i,
          score: contextScore
        });
      }
      
      contextScores.push(Math.round(contextScore));
    }
    
    logger.info('🧠 SMARTER_CONTEXT_SCORING COMPLETE:', {
      totalMessages: messages.length,
      averageContext: Math.round(contextScores.reduce((a, b) => a + b, 0) / contextScores.length),
      pattern: contextScores.join(' → ')
    });
    
    return contextScores;
  }

  /**
   * 🔍 LIMITED CONTEXT: For second message (basic temporal awareness)
   */
  private static calculateLimitedContext(current: Message, previous: Message): number {
    let score = 25; // Base score for second message
    
    // Check for basic acknowledgment of previous message
    const acknowledgments = /thank you|thanks|i see|understood|got it|that helps/i;
    if (acknowledgments.test(current.content)) {
      score += 10;
    }
    
    // Check for building on previous content
    const buildingPhrases = /based on|following up|regarding|about what you mentioned/i;
    if (buildingPhrases.test(current.content)) {
      score += 15;
    }
    
    // Penalty for completely ignoring previous message
    if (current.content.length > 50 && !this.hasContentOverlap(current.content, previous.content)) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(40, score)); // Cap at 40 for limited context
  }

  /**
   * 🧠 FULL CONTEXT: For 3+ messages (complete temporal understanding)
   */
  private static calculateFullContext(messages: Message[], currentIndex: number): number {
    const current = messages[currentIndex];
    const previous = messages.slice(0, currentIndex);
    
    let score = 50; // Base score for full context analysis
    
    // ✅ TEMPORAL UNDERSTANDING (0-25 points)
    score += this.evaluateTemporalUnderstanding(current, previous);
    
    // ✅ STATE AWARENESS (0-25 points)  
    score += this.evaluateStateAwareness(current, previous);
    
    // ✅ REDUNDANCY PREVENTION (0-25 points)
    score += this.evaluateRedundancyPrevention(current, previous);
    
    // ✅ META COMMUNICATION (0-25 points)
    score += this.evaluateMetaCommunication(current, previous);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * ⏱️ TEMPORAL UNDERSTANDING: Timeline and progression awareness
   */
  private static evaluateTemporalUnderstanding(current: Message, previous: Message[]): number {
    let score = 0;
    
    // References to previous steps/stages
    const temporalRefs = /first|then|next|now|finally|previously|earlier|after|before|following/i;
    if (temporalRefs.test(current.content)) {
      score += 10;
    }
    
    // Explicit progression markers
    const progressionMarkers = /step \d+|phase \d+|now that.*done|having completed|moving forward/i;
    if (progressionMarkers.test(current.content)) {
      score += 15;
    }
    
    return Math.min(25, score);
  }

  /**
   * 🎯 STATE AWARENESS: Current vs past state recognition
   */
  private static evaluateStateAwareness(current: Message, previous: Message[]): number {
    let score = 0;
    
    // State acknowledgment phrases
    const stateRefs = /current|existing|previous|original|new|updated|changed|modified/i;
    if (stateRefs.test(current.content)) {
      score += 10;
    }
    
    // Explicit state comparisons
    const comparisons = /compared to|different from|unlike before|improvement over|better than/i;
    if (comparisons.test(current.content)) {
      score += 15;
    }
    
    return Math.min(25, score);
  }

  /**
   * 🚫 REDUNDANCY PREVENTION: Avoiding repeated suggestions
   */
  private static evaluateRedundancyPrevention(current: Message, previous: Message[]): number {
    let score = 25; // Start with full points, subtract for redundancy
    
    // Check for content repetition
    for (const prevMsg of previous) {
      const similarity = this.calculateContentSimilarity(current.content, prevMsg.content);
      if (similarity > 0.7) {
        score -= 15; // Heavy penalty for high similarity
      } else if (similarity > 0.4) {
        score -= 5; // Light penalty for moderate similarity
      }
    }
    
    return Math.max(0, score);
  }

  /**
   * 💬 META COMMUNICATION: Clear about context limitations
   */
  private static evaluateMetaCommunication(current: Message, previous: Message[]): number {
    let score = 0;
    
    // Meta-awareness phrases
    const metaPhrases = /building on|following up|as mentioned|referring to|context|conversation/i;
    if (metaPhrases.test(current.content)) {
      score += 15;
    }
    
    // Explicit acknowledgment of previous exchanges
    const acknowledgments = /your previous|earlier you mentioned|as we discussed/i;
    if (acknowledgments.test(current.content)) {
      score += 10;
    }
    
    return Math.min(25, score);
  }

  /**
   * 🎯 CLAUDE 3.5 HAIKU PROMPT: Optimized for conversation parsing
   */
  private static buildHaikuParsingPrompt(text: string, options: EnhancedParseOptions): string {
    return `You are an expert conversation parser using Claude 3.5 Haiku's advanced understanding. Analyze this text and identify precise message boundaries between different speakers.

CONVERSATION TO ANALYZE:
"${text.substring(0, 3000)}${text.length > 3000 ? '...[truncated]' : ''}"

EXPECTED PLATFORM: ${options.expectedPlatform || 'auto-detect'}
USER SIGNATURE: ${options.userSignature || 'none provided'}

IDENTIFY:
1. Speaker changes (user/assistant alternation)
2. Message boundaries (where one message ends, next begins)  
3. Speaker patterns (names, roles, signatures)
4. Conversation structure (question-answer, dialogue flow)

RETURN VALID JSON FORMAT:
{
  "messages": [
    {"speaker": "user", "content": "First message content", "confidence": 0.95},
    {"speaker": "assistant", "content": "Response content", "confidence": 0.90}
  ],
  "platform": "claude|chatgpt|other",
  "confidence": 0.85,
  "patterns": ["Human:", "Assistant:", "detected patterns"],
  "insights": ["Conversation has X exchanges", "Clear role markers present"]
}

REQUIREMENTS:
- Be conservative with confidence scores
- Ensure alternating user/assistant pattern where possible
- Include all meaningful content, exclude pure formatting
- speaker field must be "user" or "assistant" only`;
  }

  /**
   * 📊 PARSE CLAUDE 3.5 HAIKU RESPONSE: Convert AI analysis to structured result
   */
  private static parseHaikuResponse(analysisText: string, originalText: string): ParseResult {
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude 3.5 Haiku response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      const messages: Message[] = parsed.messages.map((msg: any, index: number) => ({
        role: msg.speaker === 'user' ? 'user' : 'assistant',
        content: msg.content.trim(),
        index,
        timestamp: new Date().toISOString()
      }));

      return {
        messages,
        platform: this.normalizePlatform(parsed.platform),
        confidence: Math.min(parsed.confidence || 0.8, 0.95), // Cap AI confidence at 95%
        // ✅ TYPE COMPATIBLE: Use 'haiku' instead of 'claude-3.5-haiku'
        method: 'haiku',
        metadata: {
          originalLength: originalText.length,
          processingTime: 0, // Will be set by caller
          cost: this.calculateHaikuCost(originalText.length),
          patternLearning: [
            `${this.HAIKU_MODEL} parsing: ${parsed.patterns?.join(', ') || 'no patterns'}`,
            `Insights: ${parsed.insights?.join('; ') || 'none'}`,
            `Message count: ${messages.length}`,
            `Confidence: ${parsed.confidence}`
          ]
        }
      };

    } catch (error) {
      logger.error('❌ CLAUDE 3.5 HAIKU RESPONSE PARSING FAILED:', error);
      throw new Error(`Failed to parse Claude 3.5 Haiku response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ✅ UTILITY METHODS

  /**
   * 💰 COST CALCULATION: Estimate Claude 3.5 Haiku usage cost
   */
  private static calculateHaikuCost(totalTokens: number): number {
    // Claude 3.5 Haiku pricing: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
    // Rough estimate: 1 token ≈ 4 characters for input, assume 500 output tokens
    const inputTokens = totalTokens / 4;
    const outputTokens = 500; // Conservative estimate
    
    const inputCost = (inputTokens / 1000000) * 0.25;
    const outputCost = (outputTokens / 1000000) * 1.25;
    
    return inputCost + outputCost; // Usually ~$0.001 per conversation
  }

  /**
   * 📄 EXTRACT RESPONSE TEXT: Handle Anthropic API response format
   */
  private static extractResponseText(response: any): string {
    if (response.content && Array.isArray(response.content) && response.content.length > 0) {
      const firstContent = response.content[0];
      if (firstContent && typeof firstContent === 'object' && 'text' in firstContent) {
        return String(firstContent.text || '');
      }
    }
    return '';
  }

  /**
   * 🔄 NORMALIZE PLATFORM: Ensure consistent platform naming
   */
  private static normalizePlatform(platform: string): Platform {
    const platformMap: Record<string, Platform> = {
      'claude': 'claude',
      'chatgpt': 'chatgpt', 
      'other': 'other',
      'auto': 'other'
    };
    return platformMap[platform?.toLowerCase()] || 'other';
  }

  /**
   * 📊 CONTENT SIMILARITY: Calculate text similarity for redundancy detection
   */
  private static calculateContentSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  /**
   * 🔍 CONTENT OVERLAP: Check if messages reference similar topics
   */
  private static hasContentOverlap(text1: string, text2: string): boolean {
    const similarity = this.calculateContentSimilarity(text1, text2);
    return similarity > 0.2; // 20% word overlap threshold
  }

  // ✅ EXISTING METHODS: Preserve all existing functionality
  static parseConversation(text: string, options?: EnhancedParseOptions): ParseResult {
    const startTime = Date.now();
    
    try {
      const detectedPlatform = this.detectPlatform(text);
      
      let result: ParseResult;
      
      switch (detectedPlatform) {
        case 'claude':
          result = this.parseClaudeConversation(text);
          break;
        case 'chatgpt':
          result = this.parseChatGPTConversation(text);
          break;
        default:
          result = this.parseGenericConversation(text);
      }
      
      if (!result.metadata) {
        result.metadata = {
          originalLength: text.length,
          processingTime: Date.now() - startTime
        };
      } else {
        result.metadata.processingTime = Date.now() - startTime;
      }
      
      if (options?.userSignature && result.metadata.patternLearning) {
        result.metadata.patternLearning.push(`User signature: ${options.userSignature}`);
      }
      
      result.method = 'pattern';
      
      return result;
      
    } catch (error) {
      logger.error('Conversation parsing failed:', error);
      return this.createFallbackResult(text);
    }
  }

  /**
   * ✅ UNIFIED: Detect conversation platform with lowercase types
   */
  static detectPlatform(text: string): Platform {
    console.log('🔍 DETECTING PLATFORM for text length:', text.length);
    
    let claudeScore = 0;
    let chatgptScore = 0;
    
    try {
      // Claude patterns - safe counting
      const humanMatches = text.match(/Human:/gi);
      if (humanMatches) claudeScore += humanMatches.length;
      
      const assistantMatches = text.match(/Assistant:/gi);
      if (assistantMatches) claudeScore += assistantMatches.length;
      
      const claudeMatches = text.match(/Claude:/gi);
      if (claudeMatches) claudeScore += claudeMatches.length;
      
      // ChatGPT patterns - safe counting
      const userMatches = text.match(/User:/gi);
      if (userMatches) chatgptScore += userMatches.length;
      
      const chatgptMatches = text.match(/ChatGPT:/gi);
      if (chatgptMatches) chatgptScore += chatgptMatches.length;
      
    } catch (error) {
      console.log('Pattern matching error, defaulting to other');
      return 'other';
    }
    
    console.log(`📊 PLATFORM SCORES: Claude=${claudeScore}, ChatGPT=${chatgptScore}`);
    
    // ✅ UNIFIED: Return lowercase platform types
    if (claudeScore > chatgptScore && claudeScore > 0) return 'claude';
    if (chatgptScore > claudeScore && chatgptScore > 0) return 'chatgpt';
    
    return 'other';
  }

  /**
   * ✅ ENHANCED: Parse Claude conversation with unified platform type
   */
  static parseClaudeConversation(text: string): ParseResult {
    console.log('🤖 PARSING CLAUDE CONVERSATION...');
    
    const messages: Message[] = [];
    let confidence = 0.8;
    let parsedParts = 0;
    
    try {
      // Normalize line endings and clean up
      const cleanText = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
      
      // Split by role markers
      const textParts = cleanText.split(/(?=\n(?:Human|Assistant):\s*)/i);
      parsedParts = textParts.length;
      
      console.log(`📝 INITIAL SPLIT: ${textParts.length} parts`);
      
      // Process each part
      for (let i = 0; i < textParts.length; i++) {
        const part = textParts[i]?.trim() || '';
        if (!part) continue;
        
        console.log(`🔍 PROCESSING PART ${i}: "${part.substring(0, 50)}..."`);
        
        let role: 'user' | 'assistant' | null = null;
        let content = '';
        
        try {
          if (/^Human:\s*/i.test(part)) {
            role = 'user';
            content = part.replace(/^Human:\s*/i, '').trim();
            console.log(`👤 FOUND USER MESSAGE: ${content.length} chars`);
          } else if (/^Assistant:\s*/i.test(part)) {
            role = 'assistant';
            content = part.replace(/^Assistant:\s*/i, '').trim();
            console.log(`🤖 FOUND ASSISTANT MESSAGE: ${content.length} chars`);
          } else {
            console.log(`❓ UNCLEAR ROLE for part: "${part.substring(0, 100)}"`);
            
            // If it's the first part and no role markers, assume it's user
            if (i === 0 && textParts.length > 1) {
              role = 'user';
              content = part.trim();
              console.log(`👤 ASSUMED USER (first part): ${content.length} chars`);
            } else if (messages.length > 0) {
              // Append to previous message if it exists
              const lastMessage = messages[messages.length - 1];
              if (lastMessage && part.length > 10) {
                lastMessage.content += '\n\n' + part;
                console.log(`📎 APPENDED TO PREVIOUS MESSAGE: ${lastMessage.role}`);
                continue;
              }
            }
            
            // Skip if we can't determine role and content is too short
            if (!role && content.length < 20) {
              console.log(`⏭️ SKIPPING SHORT UNCLEAR PART: "${part}"`);
              continue;
            }
          }
        } catch (roleError) {
          console.log('Role parsing error, skipping part');
          continue;
        }
        
        // Add message if we have valid content
        if (role && content && content.length > 5) {
          messages.push({
            role,
            content: content.trim(),
            index: messages.length,
            timestamp: new Date().toISOString()
          });
          console.log(`✅ ADDED ${role.toUpperCase()} MESSAGE #${messages.length}: ${content.length} chars`);
        }
      }
      
      // Validate alternating pattern
      let hasProperAlternation = true;
      for (let i = 1; i < messages.length; i++) {
        if (messages[i]?.role === messages[i-1]?.role) {
          console.log(`⚠️ NON-ALTERNATING PATTERN at index ${i}: ${messages[i-1]?.role} → ${messages[i]?.role}`);
          hasProperAlternation = false;
        }
      }
      
      if (!hasProperAlternation) {
        confidence -= 0.2;
      }
      
    } catch (parseError) {
      console.log('Claude parsing error, creating fallback message');
      // Ensure we have at least one message
      if (messages.length === 0) {
        messages.push({
          role: 'user',
          content: text.substring(0, 1000),
          index: 0,
          timestamp: new Date().toISOString()
        });
      }
      confidence = 0.1;
      parsedParts = 1;
    }
    
    console.log(`📊 CLAUDE PARSING COMPLETE: ${messages.length} messages extracted`);
    
    return {
      messages,
      platform: 'claude', // ✅ UNIFIED: lowercase platform
      confidence: Math.max(0.1, confidence),
      method: 'pattern', // ✅ VALID: exists in ParseResult
      metadata: {
        originalLength: text.length,
        processingTime: 0, // Will be set by parent function
        patternLearning: [
          `Claude parsing: ${parsedParts} parts processed`,
          `Final messages: ${messages.length}`,
          `Confidence: ${confidence}`,
          'Method: claude_role_markers'
        ]
      }
    };
  }

  /**
   * ✅ ENHANCED: Parse ChatGPT conversation with unified platform type
   */
  static parseChatGPTConversation(text: string): ParseResult {
    console.log('💬 PARSING CHATGPT CONVERSATION...');
    
    const messages: Message[] = [];
    let confidence = 0.8;
    let parseMethod = '';
    
    try {
      const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      
      let textParts: string[] = [];
      
      // Try different ChatGPT formats
      if (/(?:User|ChatGPT|Assistant):\s*/i.test(cleanText)) {
        textParts = cleanText.split(/(?=\n(?:User|ChatGPT|Assistant):\s*)/i);
        parseMethod = 'chatgpt_role_markers';
      } else if (/\*\*(?:User|Assistant)\*\*/i.test(cleanText)) {
        textParts = cleanText.split(/(?=\n\*\*(?:User|Assistant)\*\*)/i);
        parseMethod = 'chatgpt_bold_markers';
      } else {
        textParts = cleanText.split(/\n\s*\n/).filter(p => p && p.trim());
        parseMethod = 'chatgpt_alternating';
        confidence = 0.4;
      }
      
      console.log(`📝 USING ${parseMethod}: ${textParts.length} parts`);
      
      for (let i = 0; i < textParts.length; i++) {
        const part = textParts[i]?.trim() || '';
        if (!part) continue;
        
        let role: 'user' | 'assistant';
        let content: string;
        
        try {
          if (/^(?:User:|\*\*User\*\*)/i.test(part)) {
            role = 'user';
            content = part.replace(/^(?:User:|\*\*User\*\*)\s*/i, '').trim();
          } else if (/^(?:ChatGPT:|Assistant:|\*\*Assistant\*\*)/i.test(part)) {
            role = 'assistant';
            content = part.replace(/^(?:ChatGPT:|Assistant:|\*\*Assistant\*\*)\s*/i, '').trim();
          } else {
            role = i % 2 === 0 ? 'user' : 'assistant';
            content = part.trim();
            confidence -= 0.1;
          }
          
          if (content && content.length > 5) {
            messages.push({
              role,
              content,
              index: messages.length,
              timestamp: new Date().toISOString()
            });
          }
        } catch (partError) {
          console.log('Part processing error, skipping');
          continue;
        }
      }
      
    } catch (chatgptError) {
      console.log('ChatGPT parsing error, using fallback');
      if (messages.length === 0) {
        messages.push({
          role: 'user',
          content: text.substring(0, 1000),
          index: 0,
          timestamp: new Date().toISOString()
        });
      }
      confidence = 0.1;
      parseMethod = 'fallback';
    }
    
    console.log(`📊 CHATGPT PARSING COMPLETE: ${messages.length} messages extracted`);
    
    return {
      messages,
      platform: 'chatgpt', // ✅ UNIFIED: lowercase platform
      confidence: Math.max(0.1, confidence),
      method: 'pattern', // ✅ VALID: exists in ParseResult
      metadata: {
        originalLength: text.length,
        processingTime: 0, // Will be set by parent function
        patternLearning: [
          `ChatGPT parsing: ${parseMethod}`,
          `Messages extracted: ${messages.length}`,
          `Confidence: ${confidence}`
        ]
      }
    };
  }

  /**
   * ✅ ENHANCED: Parse generic conversation with unified platform type
   */
  static parseGenericConversation(text: string): ParseResult {
    console.log('🔀 PARSING GENERIC CONVERSATION...');
    
    const messages: Message[] = [];
    
    try {
      const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      const textParts = cleanText.split(/\n\s*\n/).filter(p => p && p.trim());
      
      console.log(`📝 GENERIC SPLIT: ${textParts.length} parts`);
      
      for (let i = 0; i < textParts.length; i++) {
        const content = textParts[i]?.trim() || '';
        if (!content || content.length < 10) continue;
        
        const role = i % 2 === 0 ? 'user' : 'assistant';
        
        messages.push({
          role,
          content,
          index: messages.length,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (genericError) {
      console.log('Generic parsing error, creating single message');
      messages.push({
        role: 'user',
        content: text.substring(0, 1000),
        index: 0,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`📊 GENERIC PARSING COMPLETE: ${messages.length} messages extracted`);
    
    return {
      messages,
      platform: 'other', // ✅ UNIFIED: lowercase platform
      confidence: 0.3,
      method: 'pattern', // ✅ VALID: exists in ParseResult
      metadata: {
        originalLength: text.length,
        processingTime: 0, // Will be set by parent function
        patternLearning: [
          'Generic alternating parsing',
          `Messages: ${messages.length}`,
          'Low confidence due to no role markers'
        ]
      }
    };
  }

  /**
   * ✅ ENHANCED: Create fallback result with unified types
   */
  static createFallbackResult(text: string): ParseResult {
    return {
      messages: [{
        role: 'user',
        content: text.substring(0, 1000),
        index: 0,
        timestamp: new Date().toISOString()
      }],
      platform: 'other', // ✅ UNIFIED: lowercase platform
      confidence: 0.1,
      method: 'pattern', // ✅ VALID: exists in ParseResult
      metadata: {
        originalLength: text.length,
        processingTime: 0,
        patternLearning: ['Fallback parsing applied']
      }
    };
  }

  // ✅ ENHANCED: User signature detection for improved parsing
  static detectUserSignature(text: string): string[] {
    const signatures: string[] = [];
    
    // Common signature patterns
    const patterns = [
      /^([A-Z][a-z]+):\s*/gm,        // "Alex:", "John:", etc.
      /^([A-Z]{2,}):\s*/gm,          // "MY:", "JD:", etc.
      /^([a-z_]+\d*):\s*/gm,         // "user1:", "alex_m:", etc.
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const signature = match.replace(':', '').trim();
          if (!signatures.includes(signature)) {
            signatures.push(signature);
          }
        });
      }
    });
    
    return signatures;
  }

  // ✅ FOUNDATION: Validation for enhanced parsing
  static validateParseResult(result: ParseResult): boolean {
    if (!result.messages || result.messages.length === 0) {
      return false;
    }
    
    // Check for alternating roles (good conversation pattern)
    for (let i = 1; i < result.messages.length; i++) {
      if (result.messages[i].role === result.messages[i-1].role) {
        logger.warn(`Non-alternating pattern detected at index ${i}`);
      }
    }
    
    // Check for minimum content length
    const shortMessages = result.messages.filter(m => m.content.length < 10);
    if (shortMessages.length > 0) {
      logger.warn(`${shortMessages.length} messages have very short content`);
    }
    
    return true;
  }
}

// ✅ ENHANCED: Function-based export with unified types
export function parseConversation(
  messages: any,
  platform: string = 'auto'
): Message[] {
  console.log('🔄 PARSE CONVERSATION CALLED:', { 
    inputType: Array.isArray(messages) ? 'array' : typeof messages,
    platform,
    length: Array.isArray(messages) ? messages.length : (typeof messages === 'string' ? messages.length : 'unknown')
  });
  
  try {
    // Handle array of messages
    if (Array.isArray(messages)) {
      console.log('📋 PROCESSING ARRAY INPUT:', messages.length, 'messages');
      return messages.map((msg, index) => ({
        role: msg?.role || 'user',
        content: String(msg?.content || ''),
        index,
        timestamp: msg?.timestamp || new Date().toISOString()
      }));
    }
    
    // Handle text parsing
    const text = typeof messages === 'string' ? messages : String(messages || '');
    if (!text) {
      console.error('❌ NO TEXT PROVIDED FOR PARSING');
      return [];
    }
    
    console.log('📄 PROCESSING TEXT INPUT:', text.length, 'characters');
    const result = ConversationParser.parseConversation(text);
    
    console.log('✅ PARSING RESULT:', {
      platform: result.platform,
      messageCount: result.messages.length,
      confidence: result.confidence
    });
    
    return result.messages;
    
  } catch (parseError) {
    console.log('Parse conversation error, returning empty array');
    return [];
  }
}

// ✅ ENHANCED: Primary export for Claude 3.5 Haiku-enhanced parsing
export async function parseConversationEnhanced(
  text: string,
  options?: EnhancedParseOptions
): Promise<ParseResult> {
  return ConversationParser.parseConversationEnhanced(text, options);
}

export default ConversationParser;