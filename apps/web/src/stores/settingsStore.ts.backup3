import { create } from 'zustand';
// ✅ TEMPORARILY REMOVE MIDDLEWARE to eliminate infinite loop issues
// import { persist } from 'zustand/middleware';

// ✅ SIMPLIFIED INTERFACES - No computed properties that could cause loops
interface SettingsState {
  // Theme settings
  theme: 'dark' | 'light' | 'system';
  
  // Display settings
  showChessNotation: boolean;
  autoDetectPlatform: boolean;
  enableSuggestions: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  showFloatingOverlay: boolean;
  
  // Analysis settings
  defaultAnalysisDepth: 'quick' | 'standard' | 'deep';
  enablePatternDetection: boolean;
  enableClaudeAnalysis: boolean;
  autoExpandLowScores: boolean;
  
  // Notification settings
  enableNotifications: boolean;
  notifyOnCompletion: boolean;
  notifyOnPatterns: boolean;
  notifyOnInsights: boolean;
  
  // Export settings
  defaultExportFormat: 'json' | 'csv' | 'pdf' | 'markdown';
  includeMetadata: boolean;
  includeExplanations: boolean;
  
  // ✅ SIMPLE ACTIONS - No side effects, no DOM manipulation
  setTheme: (theme: SettingsState['theme']) => void;
  setShowChessNotation: (show: boolean) => void;
  setAutoDetectPlatform: (auto: boolean) => void;
  setEnableSuggestions: (enable: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setShowFloatingOverlay: (show: boolean) => void;
  
  setAnalysisDepth: (depth: SettingsState['defaultAnalysisDepth']) => void;
  setEnablePatternDetection: (enable: boolean) => void;
  setEnableClaudeAnalysis: (enable: boolean) => void;
  setAutoExpandLowScores: (enable: boolean) => void;
  
  setEnableNotifications: (enable: boolean) => void;
  setNotifyOnCompletion: (enable: boolean) => void;
  setNotifyOnPatterns: (enable: boolean) => void;
  setNotifyOnInsights: (enable: boolean) => void;
  
  setExportFormat: (format: SettingsState['defaultExportFormat']) => void;
  setIncludeMetadata: (include: boolean) => void;
  setIncludeExplanations: (include: boolean) => void;
  
  resetToDefaults: () => void;
}

// ✅ STABLE DEFAULT VALUES - No functions, no computed properties
const defaultSettings = {
  // Theme settings
  theme: 'dark' as const,
  
  // Display settings
  showChessNotation: true,
  autoDetectPlatform: true,
  enableSuggestions: true,
  compactMode: false,
  animationsEnabled: true,
  showFloatingOverlay: true,
  
  // Analysis settings
  defaultAnalysisDepth: 'standard' as const,
  enablePatternDetection: true,
  enableClaudeAnalysis: true,
  autoExpandLowScores: true,
  
  // Notification settings
  enableNotifications: true,
  notifyOnCompletion: true,
  notifyOnPatterns: true,
  notifyOnInsights: true,
  
  // Export settings
  defaultExportFormat: 'json' as const,
  includeMetadata: true,
  includeExplanations: true
};

// ✅ MAIN STORE - No middleware, no computed properties, no side effects
export const useSettingsStore = create<SettingsState>((set) => ({
  // ✅ Spread stable defaults
  ...defaultSettings,
  
  // ✅ SIMPLE ACTIONS - No side effects, no DOM manipulation, no cascading updates
  setTheme: (theme) => set({ theme }),
  setShowChessNotation: (showChessNotation) => set({ showChessNotation }),
  setAutoDetectPlatform: (autoDetectPlatform) => set({ autoDetectPlatform }),
  setEnableSuggestions: (enableSuggestions) => set({ enableSuggestions }),
  setCompactMode: (compactMode) => set({ compactMode }),
  setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
  setShowFloatingOverlay: (showFloatingOverlay) => set({ showFloatingOverlay }),
  
  setAnalysisDepth: (defaultAnalysisDepth) => set({ defaultAnalysisDepth }),
  setEnablePatternDetection: (enablePatternDetection) => set({ enablePatternDetection }),
  setEnableClaudeAnalysis: (enableClaudeAnalysis) => set({ enableClaudeAnalysis }),
  setAutoExpandLowScores: (autoExpandLowScores) => set({ autoExpandLowScores }),
  
  setEnableNotifications: (enableNotifications) => set({ enableNotifications }),
  setNotifyOnCompletion: (notifyOnCompletion) => set({ notifyOnCompletion }),
  setNotifyOnPatterns: (notifyOnPatterns) => set({ notifyOnPatterns }),
  setNotifyOnInsights: (notifyOnInsights) => set({ notifyOnInsights }),
  
  setExportFormat: (defaultExportFormat) => set({ defaultExportFormat }),
  setIncludeMetadata: (includeMetadata) => set({ includeMetadata }),
  setIncludeExplanations: (includeExplanations) => set({ includeExplanations }),
  
  resetToDefaults: () => set(defaultSettings)
}));

// ✅ SIMPLE SELECTORS - No object creation, stable references
export const useTheme = () => useSettingsStore((state) => state.theme);
export const useCompactMode = () => useSettingsStore((state) => state.compactMode);
export const useAnimationsEnabled = () => useSettingsStore((state) => state.animationsEnabled);
export const useShowChessNotation = () => useSettingsStore((state) => state.showChessNotation);
export const useAutoDetectPlatform = () => useSettingsStore((state) => state.autoDetectPlatform);
export const useEnableSuggestions = () => useSettingsStore((state) => state.enableSuggestions);
export const useShowFloatingOverlay = () => useSettingsStore((state) => state.showFloatingOverlay);

export const useAnalysisDepth = () => useSettingsStore((state) => state.defaultAnalysisDepth);
export const usePatternDetection = () => useSettingsStore((state) => state.enablePatternDetection);
export const useClaudeAnalysis = () => useSettingsStore((state) => state.enableClaudeAnalysis);
export const useAutoExpandLowScores = () => useSettingsStore((state) => state.autoExpandLowScores);

export const useNotificationsEnabled = () => useSettingsStore((state) => state.enableNotifications);
export const useExportFormat = () => useSettingsStore((state) => state.defaultExportFormat);

// ✅ OBJECT SELECTORS - Only if needed, with careful implementation
export const useDisplaySettings = () => useSettingsStore((state) => ({
  showChessNotation: state.showChessNotation,
  autoDetectPlatform: state.autoDetectPlatform,
  enableSuggestions: state.enableSuggestions,
  compactMode: state.compactMode,
  animationsEnabled: state.animationsEnabled,
  showFloatingOverlay: state.showFloatingOverlay
}));

export const useAnalysisSettings = () => useSettingsStore((state) => ({
  defaultAnalysisDepth: state.defaultAnalysisDepth,
  enablePatternDetection: state.enablePatternDetection,
  enableClaudeAnalysis: state.enableClaudeAnalysis,
  autoExpandLowScores: state.autoExpandLowScores
}));

// ✅ THEME INITIALIZATION - Separate function, no store side effects
export const initializeTheme = () => {
  const theme = useSettingsStore.getState().theme;
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // System theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

// ✅ REMOVED: 
// - persist middleware (causing infinite loops)
// - migration logic (causing cascading updates)
// - DOM manipulation in actions (causing side effects)
// - complex computed selectors (causing object recreation)
// - toggle functions (replace with direct setters)

export default useSettingsStore;