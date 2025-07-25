import { create } from 'zustand';

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
  
  // Actions
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

// ✅ MAIN STORE - Clean, no middleware, simple actions
export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,
  
  // Simple actions - no side effects
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

// ✅ ONLY INDIVIDUAL SELECTORS - No object creation, stable references
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
export const useNotifyOnCompletion = () => useSettingsStore((state) => state.notifyOnCompletion);
export const useNotifyOnPatterns = () => useSettingsStore((state) => state.notifyOnPatterns);
export const useNotifyOnInsights = () => useSettingsStore((state) => state.notifyOnInsights);

export const useExportFormat = () => useSettingsStore((state) => state.defaultExportFormat);
export const useIncludeMetadata = () => useSettingsStore((state) => state.includeMetadata);
export const useIncludeExplanations = () => useSettingsStore((state) => state.includeExplanations);

// ✅ THEME INITIALIZATION - Separate function
export const initializeTheme = () => {
  const theme = useSettingsStore.getState().theme;
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

// ✅ REMOVED COMPLETELY:
// - All object selectors (useDisplaySettings, useAnalysisSettings)
// - persist middleware
// - migration logic
// - DOM side effects in actions
// - toggle functions

export default useSettingsStore;