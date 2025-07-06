import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  toggleChessNotation: () => void;
  toggleAutoDetect: () => void;
  toggleSuggestions: () => void;
  toggleCompactMode: () => void;
  toggleAnimations: () => void;
  toggleFloatingOverlay: () => void;
  
  setAnalysisDepth: (depth: SettingsState['defaultAnalysisDepth']) => void;
  togglePatternDetection: () => void;
  toggleClaudeAnalysis: () => void;
  toggleAutoExpandLowScores: () => void;
  
  toggleNotifications: () => void;
  toggleNotifyOnCompletion: () => void;
  toggleNotifyOnPatterns: () => void;
  toggleNotifyOnInsights: () => void;
  
  setExportFormat: (format: SettingsState['defaultExportFormat']) => void;
  toggleIncludeMetadata: () => void;
  toggleIncludeExplanations: () => void;
  
  resetToDefaults: () => void;
  importSettings: (settings: Partial<SettingsState>) => void;
  exportSettings: () => SettingsState;
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

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      // Theme actions
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
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
      },
      
      // Display actions
      toggleChessNotation: () => set((state) => ({ 
        showChessNotation: !state.showChessNotation 
      })),
      
      toggleAutoDetect: () => set((state) => ({ 
        autoDetectPlatform: !state.autoDetectPlatform 
      })),
      
      toggleSuggestions: () => set((state) => ({ 
        enableSuggestions: !state.enableSuggestions 
      })),
      
      toggleCompactMode: () => set((state) => ({ 
        compactMode: !state.compactMode 
      })),
      
      toggleAnimations: () => set((state) => ({ 
        animationsEnabled: !state.animationsEnabled 
      })),
      
      toggleFloatingOverlay: () => set((state) => ({ 
        showFloatingOverlay: !state.showFloatingOverlay 
      })),
      
      // Analysis actions
      setAnalysisDepth: (defaultAnalysisDepth) => set({ defaultAnalysisDepth }),
      
      togglePatternDetection: () => set((state) => ({ 
        enablePatternDetection: !state.enablePatternDetection 
      })),
      
      toggleClaudeAnalysis: () => set((state) => ({ 
        enableClaudeAnalysis: !state.enableClaudeAnalysis 
      })),
      
      toggleAutoExpandLowScores: () => set((state) => ({ 
        autoExpandLowScores: !state.autoExpandLowScores 
      })),
      
      // Notification actions
      toggleNotifications: () => set((state) => ({ 
        enableNotifications: !state.enableNotifications 
      })),
      
      toggleNotifyOnCompletion: () => set((state) => ({ 
        notifyOnCompletion: !state.notifyOnCompletion 
      })),
      
      toggleNotifyOnPatterns: () => set((state) => ({ 
        notifyOnPatterns: !state.notifyOnPatterns 
      })),
      
      toggleNotifyOnInsights: () => set((state) => ({ 
        notifyOnInsights: !state.notifyOnInsights 
      })),
      
      // Export actions
      setExportFormat: (defaultExportFormat) => set({ defaultExportFormat }),
      
      toggleIncludeMetadata: () => set((state) => ({ 
        includeMetadata: !state.includeMetadata 
      })),
      
      toggleIncludeExplanations: () => set((state) => ({ 
        includeExplanations: !state.includeExplanations 
      })),
      
      // Utility actions
      resetToDefaults: () => set(defaultSettings),
      
      importSettings: (settings) => set((state) => ({ 
        ...state, 
        ...settings 
      })),
      
      exportSettings: () => get()
    }),
    {
      name: 'settings-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...defaultSettings,
            ...persistedState
          };
        }
        return persistedState;
      }
    }
  )
);

// Selectors
export const useTheme = () => useSettingsStore((state) => state.theme);
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

export const useNotificationSettings = () => useSettingsStore((state) => ({
  enableNotifications: state.enableNotifications,
  notifyOnCompletion: state.notifyOnCompletion,
  notifyOnPatterns: state.notifyOnPatterns,
  notifyOnInsights: state.notifyOnInsights
}));

export const useExportSettings = () => useSettingsStore((state) => ({
  defaultExportFormat: state.defaultExportFormat,
  includeMetadata: state.includeMetadata,
  includeExplanations: state.includeExplanations
}));

// Initialize theme on app start
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
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (useSettingsStore.getState().theme === 'system') {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    });
  }
};

export default useSettingsStore;

