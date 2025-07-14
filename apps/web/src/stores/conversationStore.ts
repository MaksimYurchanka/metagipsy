import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Platform } from '@/types';

// ✅ CONVERSATION WORKFLOW STATE
interface ConversationState {
  // ✅ CORE DATA
  conversationText: string;
  platform: Platform;
  sessionGoal: string;
  projectContext: string;
  
  // ✅ PARSING STATE
  parsedMessages: any[];
  parsingMethod: 'local' | 'ai_enhanced' | 'direct_local';
  parsingConfidence: number;
  hasRetryEditFormat: boolean;
  messageCount: number;
  
  // ✅ ANALYSIS OPTIONS
  enableAIAnalysis: boolean;
  analysisDepth: 'quick' | 'standard' | 'deep';
  enablePatternDetection: boolean;
  generateSuggestions: boolean;
  
  // ✅ WORKFLOW STATE
  currentStep: 'input' | 'verify' | 'results';
  workflowId: string;
  timestamp: string;
  
  // ✅ BASIC SETTERS
  setConversationText: (text: string) => void;
  setPlatform: (platform: Platform) => void;
  setSessionGoal: (goal: string) => void;
  setProjectContext: (context: string) => void;
  
  // ✅ PARSING SETTERS
  setParsedMessages: (messages: any[]) => void;
  setParsingMethod: (method: 'local' | 'ai_enhanced' | 'direct_local') => void;
  setParsingConfidence: (confidence: number) => void;
  setHasRetryEditFormat: (hasFormat: boolean) => void;
  setMessageCount: (count: number) => void;
  
  // ✅ ANALYSIS SETTERS
  setAnalysisOptions: (options: {
    enableAIAnalysis?: boolean;
    analysisDepth?: 'quick' | 'standard' | 'deep';
    enablePatternDetection?: boolean;
    generateSuggestions?: boolean;
  }) => void;
  
  // ✅ WORKFLOW MANAGEMENT
  setCurrentStep: (step: 'input' | 'verify' | 'results') => void;
  startNewWorkflow: () => void;
  clearConversation: () => void;
  isWorkflowComplete: () => boolean;
  
  // ✅ DATA BUILDERS
  getAnalysisRequest: () => any;
  getVerifyData: () => any;
}

// ✅ INITIAL STATE
const initialState = {
  conversationText: '',
  platform: 'auto' as Platform,
  sessionGoal: '',
  projectContext: '',
  
  parsedMessages: [],
  parsingMethod: 'local' as const,
  parsingConfidence: 0,
  hasRetryEditFormat: false,
  messageCount: 0,
  
  enableAIAnalysis: true,
  analysisDepth: 'standard' as const,
  enablePatternDetection: true,
  generateSuggestions: true,
  
  currentStep: 'input' as const,
  workflowId: '',
  timestamp: ''
};

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ✅ BASIC SETTERS
      setConversationText: (text: string) => {
        console.log('📝 STORE: Setting conversation text:', text.length, 'characters');
        set({ conversationText: text });
      },
      
      setPlatform: (platform: Platform) => {
        console.log('🔧 STORE: Setting platform:', platform);
        set({ platform });
      },
      
      setSessionGoal: (goal: string) => {
        console.log('🎯 STORE: Setting session goal:', goal);
        set({ sessionGoal: goal });
      },
      
      setProjectContext: (context: string) => {
        console.log('📋 STORE: Setting project context:', context.length, 'characters');
        set({ projectContext: context });
      },

      // ✅ PARSING SETTERS
      setParsedMessages: (messages: any[]) => {
        console.log('📊 STORE: Setting parsed messages:', messages.length);
        set({ parsedMessages: messages });
      },
      
      setParsingMethod: (method: 'local' | 'ai_enhanced' | 'direct_local') => {
        console.log('🔍 STORE: Setting parsing method:', method);
        set({ parsingMethod: method });
      },
      
      setParsingConfidence: (confidence: number) => {
        console.log('📈 STORE: Setting parsing confidence:', confidence);
        set({ parsingConfidence: confidence });
      },
      
      setHasRetryEditFormat: (hasFormat: boolean) => {
        console.log('🎯 STORE: Setting retry-edit format:', hasFormat);
        set({ hasRetryEditFormat: hasFormat });
      },
      
      setMessageCount: (count: number) => {
        console.log('📊 STORE: Setting message count:', count);
        set({ messageCount: count });
      },

      // ✅ ANALYSIS OPTIONS
      setAnalysisOptions: (options) => {
        console.log('⚙️ STORE: Setting analysis options:', options);
        set((state) => ({
          enableAIAnalysis: options.enableAIAnalysis ?? state.enableAIAnalysis,
          analysisDepth: options.analysisDepth ?? state.analysisDepth,
          enablePatternDetection: options.enablePatternDetection ?? state.enablePatternDetection,
          generateSuggestions: options.generateSuggestions ?? state.generateSuggestions
        }));
      },

      // ✅ WORKFLOW MANAGEMENT
      setCurrentStep: (step: 'input' | 'verify' | 'results') => {
        console.log('🚀 STORE: Setting current step:', step);
        set({ currentStep: step });
      },

      startNewWorkflow: () => {
        const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        
        console.log('🆕 STORE: Starting new workflow:', workflowId);
        
        set({
          ...initialState,
          workflowId,
          timestamp,
          currentStep: 'input'
        });
      },

      clearConversation: () => {
        console.log('🧹 STORE: Clearing conversation');
        set(initialState);
      },

      isWorkflowComplete: () => {
        const state = get();
        const isComplete = state.currentStep === 'results' && !!state.workflowId;
        console.log('✅ STORE: Workflow complete check:', isComplete);
        return isComplete;
      },

      // ✅ DATA BUILDERS
      getAnalysisRequest: () => {
        const state = get();
        
        console.log('🏗️ STORE: Building analysis request');
        
        // Use parsed messages if available, otherwise parse locally
        const messages = state.parsedMessages.length > 0 
          ? state.parsedMessages 
          : parseConversationLocal(state.conversationText, state.platform, state.hasRetryEditFormat);

        const analysisRequest = {
          conversation: {
            messages,
            platform: state.platform
          },
          metadata: {
            sessionGoal: state.sessionGoal || undefined,
            projectContext: state.projectContext || undefined,
            hasRetryEditFormat: state.hasRetryEditFormat,
            messageCount: state.messageCount,
            parsingMethod: state.parsingMethod,
            workflowId: state.workflowId,
            timestamp: state.timestamp
          },
          options: {
            useClaudeAnalysis: state.enableAIAnalysis,
            analysisDepth: state.analysisDepth,
            enablePatternDetection: state.enablePatternDetection,
            generateSuggestions: state.generateSuggestions
          }
        };
        
        console.log('🚀 STORE: Analysis request built:', {
          messageCount: messages.length,
          platform: state.platform,
          workflowId: state.workflowId
        });
        
        return analysisRequest;
      },

      getVerifyData: () => {
        const state = get();
        
        console.log('📋 STORE: Building verify data');
        
        const verifyData = {
          conversationText: state.conversationText,
          platform: state.platform,
          sessionGoal: state.sessionGoal,
          projectContext: state.projectContext,
          parsedMessages: state.parsedMessages,
          parsingMethod: state.parsingMethod,
          parsingConfidence: state.parsingConfidence,
          hasRetryEditFormat: state.hasRetryEditFormat,
          messageCount: state.messageCount,
          enableAIAnalysis: state.enableAIAnalysis,
          analysisDepth: state.analysisDepth,
          enablePatternDetection: state.enablePatternDetection,
          generateSuggestions: state.generateSuggestions,
          workflowId: state.workflowId,
          timestamp: state.timestamp,
          currentStep: state.currentStep
        };
        
        console.log('📋 STORE: Verify data built for workflow:', state.workflowId);
        
        return verifyData;
      }
    }),
    {
      name: 'metagipsy-conversation-store',
      version: 1,
      // ✅ PERSIST WORKFLOW DATA
      partialize: (state) => ({
        conversationText: state.conversationText,
        platform: state.platform,
        sessionGoal: state.sessionGoal,
        projectContext: state.projectContext,
        parsedMessages: state.parsedMessages,
        parsingMethod: state.parsingMethod,
        parsingConfidence: state.parsingConfidence,
        hasRetryEditFormat: state.hasRetryEditFormat,
        messageCount: state.messageCount,
        enableAIAnalysis: state.enableAIAnalysis,
        analysisDepth: state.analysisDepth,
        enablePatternDetection: state.enablePatternDetection,
        generateSuggestions: state.generateSuggestions,
        currentStep: state.currentStep,
        workflowId: state.workflowId,
        timestamp: state.timestamp
      }),
      // ✅ STORAGE CONFIG
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);

// ✅ HELPER: Local conversation parsing
function parseConversationLocal(text: string, platform: Platform, hasRetryEditFormat: boolean) {
  console.log('🔄 STORE: Local parsing conversation:', {
    textLength: text.length,
    platform,
    hasRetryEditFormat
  });
  
  const messages: any[] = [];
  
  if (!text.trim()) {
    console.log('⚠️ STORE: Empty text, returning empty messages');
    return messages;
  }
  
  if (hasRetryEditFormat) {
    return parseRetryEditFormat(text);
  }
  
  // Standard parsing based on platform
  let parts: string[] = [];
  
  if (platform === 'claude') {
    parts = text.split(/(?=(?:Human:|Assistant:))/i).filter(p => p.trim());
  } else if (platform === 'chatgpt') {
    parts = text.split(/(?=(?:User:|ChatGPT:))/i).filter(p => p.trim());
  } else {
    // Generic splitting by empty lines
    parts = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  }
  
  parts.forEach((part, index) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    
    let role: 'user' | 'assistant' = index % 2 === 0 ? 'user' : 'assistant';
    let content = trimmed;
    
    // Role detection
    if (trimmed.match(/^(Human:|User:)/i)) {
      role = 'user';
      content = trimmed.replace(/^(Human:|User:)\s*/i, '').trim();
    } else if (trimmed.match(/^(Assistant:|ChatGPT:)/i)) {
      role = 'assistant';
      content = trimmed.replace(/^(Assistant:|ChatGPT:)\s*/i, '').trim();
    }
    
    if (content.trim()) {
      messages.push({
        role,
        content: content.trim(),
        index: messages.length,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  console.log('🔄 STORE: Local parsing complete:', messages.length, 'messages');
  return messages;
}

// ✅ HELPER: Retry→Edit format parsing
function parseRetryEditFormat(text: string) {
  console.log('🎯 STORE: Parsing Retry→Edit format');
  
  const messages: any[] = [];
  const lines = text.split('\n');
  
  const retryLines: number[] = [];
  const editLines: number[] = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed === 'Retry') retryLines.push(index);
    if (trimmed === 'Edit') editLines.push(index);
  });
  
  console.log(`📍 STORE: Found ${retryLines.length} Retry, ${editLines.length} Edit markers`);
  
  for (let i = 0; i < retryLines.length; i++) {
    const retryLine = retryLines[i];
    const nextEdit = editLines.find(edit => edit > retryLine);
    
    if (nextEdit) {
      // User message: from Retry to Edit
      const userMessage = lines.slice(retryLine + 1, nextEdit).join('\n').trim();
      
      if (userMessage && userMessage.length > 10) {
        messages.push({
          role: 'user',
          content: userMessage,
          index: messages.length,
          timestamp: new Date().toISOString()
        });
        
        // Assistant response: from Edit to next Retry (or end)
        const nextRetry = retryLines[i + 1] || lines.length;
        const assistantLines = lines.slice(nextEdit + 1, nextRetry);
        let assistantMessage = assistantLines.join('\n').trim();
        
        // Clean up assistant message (remove metadata)
        assistantMessage = assistantMessage
          .replace(/^[A-Z][a-z].*?\.\s*\n\d+s\s*\n*/g, '') // Remove "Thought process 5s" etc
          .replace(/^Thought process \d+s\s*\n*/g, '')
          .trim();
        
        if (assistantMessage && assistantMessage.length > 10) {
          messages.push({
            role: 'assistant',
            content: assistantMessage,
            index: messages.length,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }
  
  console.log(`🎯 STORE: Retry→Edit parsing complete: ${messages.length} messages`);
  return messages;
}

// ✅ UTILITY: Clean up expired workflows (optional)
export const cleanupExpiredWorkflows = () => {
  const store = useConversationStore.getState();
  const currentTimestamp = Date.now();
  const workflowTimestamp = new Date(store.timestamp).getTime();
  
  // Clear workflow if older than 1 hour
  if (currentTimestamp - workflowTimestamp > 60 * 60 * 1000) {
    console.log('🧹 STORE: Cleaning up expired workflow');
    store.clearConversation();
  }
};

export default useConversationStore;