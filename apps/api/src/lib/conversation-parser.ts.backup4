// ULTRA-SAFE apps/api/src/lib/conversation-parser.ts

import { Message, Platform } from '../types';

export interface ParseResult {
  messages: Message[];
  platform: Platform;
  confidence: number;
  metadata?: Record<string, any>;
}

export class ConversationParser {
  
  /**
   * Auto-detect platform and parse conversation
   */
  static parseConversation(text: string): ParseResult {
    const detectedPlatform = this.detectPlatform(text);
    
    switch (detectedPlatform) {
      case 'CLAUDE':
        return this.parseClaudeConversation(text);
      case 'CHATGPT':
        return this.parseChatGPTConversation(text);
      default:
        return this.parseGenericConversation(text);
    }
  }
  
  /**
   * Detect conversation platform based on patterns - ULTRA-SAFE
   */
  static detectPlatform(text: string): Platform {
    console.log('🔍 DETECTING PLATFORM for text length:', text.length);
    
    // ✅ ULTRA-SAFE: Manual pattern counting instead of regex arrays
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
      
      const anthropicMatches = text.match(/I'm Claude/gi);
      if (anthropicMatches) claudeScore += anthropicMatches.length;
      
      // ChatGPT patterns - safe counting
      const userMatches = text.match(/User:/gi);
      if (userMatches) chatgptScore += userMatches.length;
      
      const chatgptMatches = text.match(/ChatGPT:/gi);
      if (chatgptMatches) chatgptScore += chatgptMatches.length;
      
      const chatgptIdMatches = text.match(/I'm ChatGPT/gi);
      if (chatgptIdMatches) chatgptScore += chatgptIdMatches.length;
      
      const openaiMatches = text.match(/As an AI developed by OpenAI/gi);
      if (openaiMatches) chatgptScore += openaiMatches.length;
      
    } catch (patternError) {
      console.log('Pattern matching error, defaulting to OTHER');
      return 'OTHER';
    }
    
    console.log(`📊 PLATFORM SCORES: Claude=${claudeScore}, ChatGPT=${chatgptScore}`);
    
    if (claudeScore > chatgptScore && claudeScore > 0) return 'CLAUDE';
    if (chatgptScore > claudeScore && chatgptScore > 0) return 'CHATGPT';
    
    return 'OTHER';
  }
  
  /**
   * Parse Claude conversation format - ULTRA-SAFE
   */
  static parseClaudeConversation(text: string): ParseResult {
    console.log('🤖 PARSING CLAUDE CONVERSATION...');
    
    const messages: Message[] = [];
    let confidence = 0.8;
    
    try {
      // ✅ STEP 1: Normalize line endings and clean up
      const cleanText = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
      
      // ✅ STEP 2: Split by role markers, but keep the markers
      const parts = cleanText.split(/(?=\n(?:Human|Assistant):\s*)/i);
      
      console.log(`📝 INITIAL SPLIT: ${parts.length} parts`);
      
      // ✅ STEP 3: Process each part safely
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]?.trim() || '';
        if (!part) continue;
        
        console.log(`🔍 PROCESSING PART ${i}: "${part.substring(0, 50)}..."`);
        
        let role: 'user' | 'assistant' | null = null;
        let content = '';
        
        // ✅ STEP 4: Extract role and content safely
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
            // ✅ STEP 5: Handle text without clear markers
            console.log(`❓ UNCLEAR ROLE for part: "${part.substring(0, 100)}"`);
            
            // If it's the first part and no role markers, assume it's user
            if (i === 0 && parts.length > 1) {
              role = 'user';
              content = part.trim();
              console.log(`👤 ASSUMED USER (first part): ${content.length} chars`);
            } else if (messages.length > 0) {
              // Append to previous message if it exists and is substantial
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
        
        // ✅ STEP 6: Add message if we have valid content
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
      
    } catch (parseError) {
      console.log('Claude parsing error, returning basic result');
      // Return at least something if parsing fails
      if (messages.length === 0) {
        messages.push({
          role: 'user',
          content: text.substring(0, 1000), // First 1000 chars
          index: 0,
          timestamp: new Date().toISOString()
        });
      }
      confidence = 0.1;
    }
    
    console.log(`📊 CLAUDE PARSING COMPLETE: ${messages.length} messages extracted`);
    
    // ✅ STEP 7: Validate alternating pattern safely
    let hasProperAlternation = true;
    try {
      for (let i = 1; i < messages.length; i++) {
        if (messages[i]?.role === messages[i-1]?.role) {
          console.log(`⚠️ NON-ALTERNATING PATTERN at index ${i}: ${messages[i-1]?.role} → ${messages[i]?.role}`);
          hasProperAlternation = false;
        }
      }
      
      if (!hasProperAlternation) {
        confidence -= 0.2;
      }
    } catch (validationError) {
      console.log('Validation error, using base confidence');
    }
    
    return {
      messages,
      platform: 'CLAUDE',
      confidence: Math.max(0.1, confidence),
      metadata: {
        originalLength: text.length,
        parsedParts: parts.length,
        finalMessages: messages.length,
        hasProperAlternation,
        parseMethod: 'claude_role_markers'
      }
    };
  }
  
  /**
   * Parse ChatGPT conversation format - ULTRA-SAFE
   */
  static parseChatGPTConversation(text: string): ParseResult {
    console.log('💬 PARSING CHATGPT CONVERSATION...');
    
    const messages: Message[] = [];
    let confidence = 0.8;
    
    try {
      const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      
      // Try multiple ChatGPT formats safely
      let parts: string[] = [];
      let parseMethod = '';
      
      // Format 1: User: / ChatGPT: or Assistant:
      if (/(?:User|ChatGPT|Assistant):\s*/i.test(cleanText)) {
        parts = cleanText.split(/(?=\n(?:User|ChatGPT|Assistant):\s*)/i);
        parseMethod = 'chatgpt_role_markers';
        console.log(`📝 USING ROLE MARKERS: ${parts.length} parts`);
      }
      // Format 2: **User** / **Assistant**
      else if (/\*\*(?:User|Assistant)\*\*/i.test(cleanText)) {
        parts = cleanText.split(/(?=\n\*\*(?:User|Assistant)\*\*)/i);
        parseMethod = 'chatgpt_bold_markers';
        console.log(`📝 USING BOLD MARKERS: ${parts.length} parts`);
      }
      // Format 3: Numbered format
      else if (/\d+\.\s*(?:User|Assistant)/i.test(cleanText)) {
        parts = cleanText.split(/(?=\n\d+\.\s*(?:User|Assistant))/i);
        parseMethod = 'chatgpt_numbered';
        console.log(`📝 USING NUMBERED FORMAT: ${parts.length} parts`);
      }
      // Format 4: Simple alternating
      else {
        parts = cleanText.split(/\n\s*\n/).filter(p => p && p.trim());
        parseMethod = 'chatgpt_alternating';
        confidence = 0.4; // Lower confidence for assumed format
        console.log(`📝 USING ALTERNATING ASSUMPTION: ${parts.length} parts`);
      }
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]?.trim() || '';
        if (!part) continue;
        
        let role: 'user' | 'assistant';
        let content: string;
        
        try {
          if (/^(?:User:|\*\*User\*\*|\d+\.\s*User)/i.test(part)) {
            role = 'user';
            content = part.replace(/^(?:User:|\*\*User\*\*|\d+\.\s*User)\s*/i, '').trim();
          } else if (/^(?:ChatGPT:|Assistant:|\*\*Assistant\*\*|\d+\.\s*Assistant)/i.test(part)) {
            role = 'assistant';
            content = part.replace(/^(?:ChatGPT:|Assistant:|\*\*Assistant\*\*|\d+\.\s*Assistant)\s*/i, '').trim();
          } else {
            // Infer role based on position for alternating format
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
      confidence = 0.1;
    }
    
    console.log(`📊 CHATGPT PARSING COMPLETE: ${messages.length} messages extracted`);
    
    return {
      messages,
      platform: 'CHATGPT',
      confidence: Math.max(0.1, confidence),
      metadata: {
        originalLength: text.length,
        parsedParts: 0, // Safe fallback
        finalMessages: messages.length,
        parseMethod: 'chatgpt_safe'
      }
    };
  }
  
  /**
   * Parse generic conversation format - ULTRA-SAFE
   */
  static parseGenericConversation(text: string): ParseResult {
    console.log('🔀 PARSING GENERIC CONVERSATION...');
    
    const messages: Message[] = [];
    
    try {
      const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      
      // Split by double newlines (paragraph breaks)
      const parts = cleanText.split(/\n\s*\n/).filter(p => p && p.trim());
      
      console.log(`📝 GENERIC SPLIT: ${parts.length} parts`);
      
      for (let i = 0; i < parts.length; i++) {
        const content = parts[i]?.trim() || '';
        if (!content || content.length < 10) continue;
        
        // Assume alternating user/assistant
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
      // At least return something
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
      platform: 'OTHER',
      confidence: 0.3, // Low confidence for generic parsing
      metadata: {
        originalLength: text.length,
        parsedParts: 0, // Safe fallback
        finalMessages: messages.length,
        parseMethod: 'generic_alternating',
        note: 'Generic parsing - assumed alternating user/assistant'
      }
    };
  }
}

// Function-based export that the routes expect - ULTRA-SAFE
export function parseConversation(
  messages: any,
  platform: string = 'AUTO'
): Message[] {
  console.log('🔄 PARSE CONVERSATION CALLED:', { 
    inputType: Array.isArray(messages) ? 'array' : typeof messages,
    platform,
    length: Array.isArray(messages) ? messages.length : (typeof messages === 'string' ? messages.length : 'unknown')
  });
  
  try {
    // Handle array of messages (direct API input)
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

export default ConversationParser;