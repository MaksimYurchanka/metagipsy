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
      case 'claude':
        return this.parseClaudeConversation(text);
      case 'chatgpt':
        return this.parseChatGPTConversation(text);
      default:
        return this.parseGenericConversation(text);
    }
  }
  
  /**
   * Detect conversation platform based on patterns
   */
  static detectPlatform(text: string): Platform {
    const patterns = {
      claude: [
        /Human:/i,
        /Assistant:/i,
        /Claude:/i,
        /I'm Claude/i,
        /I'm an AI assistant created by Anthropic/i
      ],
      chatgpt: [
        /User:/i,
        /ChatGPT:/i,
        /I'm ChatGPT/i,
        /I'm an AI language model/i,
        /As an AI developed by OpenAI/i,
        /\*\*User\*\*/i,
        /\*\*Assistant\*\*/i
      ]
    };
    
    let claudeScore = 0;
    let chatgptScore = 0;
    
    patterns.claude.forEach(pattern => {
      if (pattern.test(text)) claudeScore++;
    });
    
    patterns.chatgpt.forEach(pattern => {
      if (pattern.test(text)) chatgptScore++;
    });
    
    if (claudeScore > chatgptScore && claudeScore > 0) return 'claude';
    if (chatgptScore > claudeScore && chatgptScore > 0) return 'chatgpt';
    
    return 'other';
  }
  
  /**
   * Parse Claude conversation format
   */
  static parseClaudeConversation(text: string): ParseResult {
    const messages: Message[] = [];
    let confidence = 0.8;
    
    // Split by Human: and Assistant: markers
    const parts = text.split(/(?=Human:|Assistant:)/i);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      
      let role: 'user' | 'assistant';
      let content: string;
      
      if (part.match(/^Human:/i)) {
        role = 'user';
        content = part.replace(/^Human:\s*/i, '').trim();
      } else if (part.match(/^Assistant:/i)) {
        role = 'assistant';
        content = part.replace(/^Assistant:\s*/i, '').trim();
      } else {
        // Try to infer role based on position
        role = i % 2 === 0 ? 'user' : 'assistant';
        content = part.trim();
        confidence -= 0.1; // Lower confidence for inferred roles
      }
      
      if (content) {
        messages.push({
          role,
          content,
          index: messages.length,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return {
      messages,
      platform: 'claude',
      confidence: Math.max(0.1, confidence),
      metadata: {
        originalLength: text.length,
        parsedParts: parts.length
      }
    };
  }
  
  /**
   * Parse ChatGPT conversation format
   */
  static parseChatGPTConversation(text: string): ParseResult {
    const messages: Message[] = [];
    let confidence = 0.8;
    
    // Try multiple ChatGPT formats
    let parts: string[] = [];
    
    // Format 1: User: / ChatGPT:
    if (text.includes('User:') || text.includes('ChatGPT:')) {
      parts = text.split(/(?=User:|ChatGPT:)/i);
    }
    // Format 2: **User** / **Assistant**
    else if (text.includes('**User**') || text.includes('**Assistant**')) {
      parts = text.split(/(?=\*\*User\*\*|\*\*Assistant\*\*)/i);
    }
    // Format 3: Numbered format (1. User, 2. Assistant)
    else if (text.match(/\d+\.\s*(?:User|Assistant)/i)) {
      parts = text.split(/(?=\d+\.\s*(?:User|Assistant))/i);
    }
    // Format 4: Simple alternating (assume first is user)
    else {
      parts = text.split(/\n\s*\n/).filter(p => p.trim());
      confidence = 0.5; // Lower confidence for assumed format
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
        // Infer role based on position
        role = i % 2 === 0 ? 'user' : 'assistant';
        content = part.trim();
        confidence -= 0.1;
      }
      
      if (content) {
        messages.push({
          role,
          content,
          index: messages.length,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return {
      messages,
      platform: 'chatgpt',
      confidence: Math.max(0.1, confidence),
      metadata: {
        originalLength: text.length,
        parsedParts: parts.length
      }
    };
  }
  
  /**
   * Parse generic conversation format
   */
  static parseGenericConversation(text: string): ParseResult {
    const messages: Message[] = [];
    
    // Split by double newlines (paragraph breaks)
    const parts = text.split(/\n\s*\n/).filter(p => p.trim());
    
    for (let i = 0; i < parts.length; i++) {
      const content = parts[i].trim();
      if (!content) continue;
      
      // Assume alternating user/assistant
      const role = i % 2 === 0 ? 'user' : 'assistant';
      
      messages.push({
        role,
        content,
        index: messages.length,
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      messages,
      platform: 'other',
      confidence: 0.3, // Low confidence for generic parsing
      metadata: {
        originalLength: text.length,
        parsedParts: parts.length,
        note: 'Generic parsing - assumed alternating user/assistant'
      }
    };
  }
}

// Function-based export that the routes expect
export function parseConversation(
  messages: any[],
  platform: string = 'auto'
): Message[] {
  // Handle array of messages (direct API input)
  if (Array.isArray(messages)) {
    return messages.map((msg, index) => ({
      role: msg.role || 'user',
      content: msg.content || '',
      index,
      timestamp: msg.timestamp || new Date().toISOString()
    }));
  }
  
  // Handle text parsing
  const text = typeof messages === 'string' ? messages : '';
  const result = ConversationParser.parseConversation(text);
  return result.messages;
}

export default ConversationParser;