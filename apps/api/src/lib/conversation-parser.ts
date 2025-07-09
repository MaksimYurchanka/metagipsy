// ПОЛНАЯ ЗАМЕНА conversation-parser.ts

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
   * Detect conversation platform based on patterns
   */
  static detectPlatform(text: string): Platform {
    console.log('🔍 DETECTING PLATFORM for text length:', text.length);
    
    const patterns = {
      claude: [
        /Human:/gi,
        /Assistant:/gi,
        /Claude:/gi,
        /I'm Claude/gi,
        /I'm an AI assistant created by Anthropic/gi
      ],
      chatgpt: [
        /User:/gi,
        /ChatGPT:/gi,
        /I'm ChatGPT/gi,
        /I'm an AI language model/gi,
        /As an AI developed by OpenAI/gi,
        /\*\*User\*\*/gi,
        /\*\*Assistant\*\*/gi
      ]
    };
    
    let claudeScore = 0;
    let chatgptScore = 0;
    
    patterns.claude.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) claudeScore += matches.length;
    });
    
    patterns.chatgpt.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) chatgptScore += matches.length;
    });
    
    console.log(`📊 PLATFORM SCORES: Claude=${claudeScore}, ChatGPT=${chatgptScore}`);
    
    if (claudeScore > chatgptScore && claudeScore > 0) return 'CLAUDE';
    if (chatgptScore > claudeScore && chatgptScore > 0) return 'CHATGPT';
    
    return 'OTHER';
  }
  
  /**
   * Parse Claude conversation format - COMPLETELY REWRITTEN
   */
  static parseClaudeConversation(text: string): ParseResult {
    console.log('🤖 PARSING CLAUDE CONVERSATION...');
    
    const messages: Message[] = [];
    let confidence = 0.8;
    
    // ✅ STEP 1: Normalize line endings and clean up
    const cleanText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
    
    // ✅ STEP 2: Split by role markers, but keep the markers
    const parts = cleanText.split(/(?=\n(?:Human|Assistant):\s*)/i);
    
    console.log(`📝 INITIAL SPLIT: ${parts.length} parts`);
    
    // ✅ STEP 3: Process each part
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      
      console.log(`🔍 PROCESSING PART ${i}: "${part.substring(0, 50)}..."`);
      
      let role: 'user' | 'assistant' | null = null;
      let content = '';
      
      // ✅ STEP 4: Extract role and content
      if (part.match(/^Human:\s*/i)) {
        role = 'user';
        content = part.replace(/^Human:\s*/i, '').trim();
        console.log(`👤 FOUND USER MESSAGE: ${content.length} chars`);
      } else if (part.match(/^Assistant:\s*/i)) {
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
    
    console.log(`📊 CLAUDE PARSING COMPLETE: ${messages.length} messages extracted`);
    
    // ✅ STEP 7: Validate alternating pattern
    let hasProperAlternation = true;
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].role === messages[i-1].role) {
        console.log(`⚠️ NON-ALTERNATING PATTERN at index ${i}: ${messages[i-1].role} → ${messages[i].role}`);
        hasProperAlternation = false;
      }
    }
    
    if (!hasProperAlternation) {
      confidence -= 0.2;
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
   * Parse ChatGPT conversation format - IMPROVED
   */
  static parseChatGPTConversation(text: string): ParseResult {
    console.log('💬 PARSING CHATGPT CONVERSATION...');
    
    const messages: Message[] = [];
    let confidence = 0.8;
    
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    
    // Try multiple ChatGPT formats
    let parts: string[] = [];
    let parseMethod = '';
    
    // Format 1: User: / ChatGPT: or Assistant:
    if (cleanText.match(/(?:User|ChatGPT|Assistant):\s*/gi)) {
      parts = cleanText.split(/(?=\n(?:User|ChatGPT|Assistant):\s*)/i);
      parseMethod = 'chatgpt_role_markers';
      console.log(`📝 USING ROLE MARKERS: ${parts.length} parts`);
    }
    // Format 2: **User** / **Assistant**
    else if (cleanText.match(/\*\*(?:User|Assistant)\*\*/gi)) {
      parts = cleanText.split(/(?=\n\*\*(?:User|Assistant)\*\*)/i);
      parseMethod = 'chatgpt_bold_markers';
      console.log(`📝 USING BOLD MARKERS: ${parts.length} parts`);
    }
    // Format 3: Numbered format
    else if (cleanText.match(/\d+\.\s*(?:User|Assistant)/gi)) {
      parts = cleanText.split(/(?=\n\d+\.\s*(?:User|Assistant))/i);
      parseMethod = 'chatgpt_numbered';
      console.log(`📝 USING NUMBERED FORMAT: ${parts.length} parts`);
    }
    // Format 4: Simple alternating
    else {
      parts = cleanText.split(/\n\s*\n/).filter(p => p.trim());
      parseMethod = 'chatgpt_alternating';
      confidence = 0.4; // Lower confidence for assumed format
      console.log(`📝 USING ALTERNATING ASSUMPTION: ${parts.length} parts`);
    }
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      
      let role: 'user' | 'assistant';
      let content: string;
      
      if (part.match(/^(?:User:|\*\*User\*\*|\d+\.\s*User)/i)) {
        role = 'user';
        content = part.replace(/^(?:User:|\*\*User\*\*|\d+\.\s*User)\s*/i, '').trim();
      } else if (part.match(/^(?:ChatGPT:|Assistant:|\*\*Assistant\*\*|\d+\.\s*Assistant)/i)) {
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
    }
    
    console.log(`📊 CHATGPT PARSING COMPLETE: ${messages.length} messages extracted`);
    
    return {
      messages,
      platform: 'CHATGPT',
      confidence: Math.max(0.1, confidence),
      metadata: {
        originalLength: text.length,
        parsedParts: parts.length,
        finalMessages: messages.length,
        parseMethod
      }
    };
  }
  
  /**
   * Parse generic conversation format - IMPROVED
   */
  static parseGenericConversation(text: string): ParseResult {
    console.log('🔀 PARSING GENERIC CONVERSATION...');
    
    const messages: Message[] = [];
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    
    // Split by double newlines (paragraph breaks)
    const parts = cleanText.split(/\n\s*\n/).filter(p => p.trim());
    
    console.log(`📝 GENERIC SPLIT: ${parts.length} parts`);
    
    for (let i = 0; i < parts.length; i++) {
      const content = parts[i].trim();
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
    
    console.log(`📊 GENERIC PARSING COMPLETE: ${messages.length} messages extracted`);
    
    return {
      messages,
      platform: 'OTHER',
      confidence: 0.3, // Low confidence for generic parsing
      metadata: {
        originalLength: text.length,
        parsedParts: parts.length,
        finalMessages: messages.length,
        parseMethod: 'generic_alternating',
        note: 'Generic parsing - assumed alternating user/assistant'
      }
    };
  }
}

// Function-based export that the routes expect
export function parseConversation(
  messages: any[],
  platform: string = 'AUTO'
): Message[] {
  console.log('🔄 PARSE CONVERSATION CALLED:', { 
    inputType: Array.isArray(messages) ? 'array' : typeof messages,
    platform,
    length: Array.isArray(messages) ? messages.length : (typeof messages === 'string' ? messages.length : 'unknown')
  });
  
  // Handle array of messages (direct API input)
  if (Array.isArray(messages)) {
    console.log('📋 PROCESSING ARRAY INPUT:', messages.length, 'messages');
    return messages.map((msg, index) => ({
      role: msg.role || 'user',
      content: msg.content || '',
      index,
      timestamp: msg.timestamp || new Date().toISOString()
    }));
  }
  
  // Handle text parsing
  const text = typeof messages === 'string' ? messages : '';
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
}

export default ConversationParser;