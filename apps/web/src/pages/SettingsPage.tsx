import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Zap, Bell, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingsStore } from '@/stores/settingsStore';

const SettingsPage: React.FC = () => {
  const {
    theme,
    showChessNotation,
    autoDetectPlatform,
    enableSuggestions,
    compactMode,
    animationsEnabled,
    showFloatingOverlay,
    defaultAnalysisDepth,
    enablePatternDetection,
    enableClaudeAnalysis,
    autoExpandLowScores,
    enableNotifications,
    notifyOnCompletion,
    notifyOnPatterns,
    notifyOnInsights,
    defaultExportFormat,
    includeMetadata,
    includeExplanations,
    setTheme,
    toggleChessNotation,
    toggleAutoDetect,
    toggleSuggestions,
    toggleCompactMode,
    toggleAnimations,
    toggleFloatingOverlay,
    setAnalysisDepth,
    togglePatternDetection,
    toggleClaudeAnalysis,
    toggleAutoExpandLowScores,
    toggleNotifications,
    toggleNotifyOnCompletion,
    toggleNotifyOnPatterns,
    toggleNotifyOnInsights,
    setExportFormat,
    toggleIncludeMetadata,
    toggleIncludeExplanations,
    resetToDefaults
  } = useSettingsStore();

  const settingSections = [
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          label: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'select' as const,
          value: theme,
          onChange: setTheme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' }
          ]
        },
        {
          label: 'Show Chess Notation',
          description: 'Display chess symbols (!, !!, ?, etc.) alongside scores',
          type: 'toggle' as const,
          value: showChessNotation,
          onChange: toggleChessNotation
        },
        {
          label: 'Compact Mode',
          description: 'Use a more condensed layout to fit more content',
          type: 'toggle' as const,
          value: compactMode,
          onChange: toggleCompactMode
        },
        {
          label: 'Animations',
          description: 'Enable smooth transitions and animations',
          type: 'toggle' as const,
          value: animationsEnabled,
          onChange: toggleAnimations
        },
        {
          label: 'Floating Score Overlay',
          description: 'Show floating score indicators during analysis',
          type: 'toggle' as const,
          value: showFloatingOverlay,
          onChange: toggleFloatingOverlay
        }
      ]
    },
    {
      title: 'Analysis',
      icon: Zap,
      settings: [
        {
          label: 'Auto-detect Platform',
          description: 'Automatically identify ChatGPT, Claude, or other platforms',
          type: 'toggle' as const,
          value: autoDetectPlatform,
          onChange: toggleAutoDetect
        },
        {
          label: 'Default Analysis Depth',
          description: 'Choose the default level of analysis detail',
          type: 'select' as const,
          value: defaultAnalysisDepth,
          onChange: setAnalysisDepth,
          options: [
            { value: 'quick', label: 'Quick (Fast, basic analysis)' },
            { value: 'standard', label: 'Standard (Balanced speed and detail)' },
            { value: 'deep', label: 'Deep (Comprehensive, slower)' }
          ]
        },
        {
          label: 'Enable Pattern Detection',
          description: 'Identify conversation patterns like momentum and fatigue',
          type: 'toggle' as const,
          value: enablePatternDetection,
          onChange: togglePatternDetection
        },
        {
          label: 'Enhanced Claude Analysis',
          description: 'Use Claude API for more detailed analysis (requires API key)',
          type: 'toggle' as const,
          value: enableClaudeAnalysis,
          onChange: toggleClaudeAnalysis
        },
        {
          label: 'Auto-expand Low Scores',
          description: 'Automatically expand messages with scores below 60',
          type: 'toggle' as const,
          value: autoExpandLowScores,
          onChange: toggleAutoExpandLowScores
        },
        {
          label: 'Show Suggestions',
          description: 'Display improvement suggestions for low-scoring messages',
          type: 'toggle' as const,
          value: enableSuggestions,
          onChange: toggleSuggestions
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          label: 'Enable Notifications',
          description: 'Receive browser notifications for important events',
          type: 'toggle' as const,
          value: enableNotifications,
          onChange: toggleNotifications
        },
        {
          label: 'Analysis Completion',
          description: 'Notify when conversation analysis is complete',
          type: 'toggle' as const,
          value: notifyOnCompletion,
          onChange: toggleNotifyOnCompletion,
          disabled: !enableNotifications
        },
        {
          label: 'Pattern Detection',
          description: 'Notify when interesting patterns are detected',
          type: 'toggle' as const,
          value: notifyOnPatterns,
          onChange: toggleNotifyOnPatterns,
          disabled: !enableNotifications
        },
        {
          label: 'New Insights',
          description: 'Notify when new insights are generated',
          type: 'toggle' as const,
          value: notifyOnInsights,
          onChange: toggleNotifyOnInsights,
          disabled: !enableNotifications
        }
      ]
    },
    {
      title: 'Export',
      icon: Download,
      settings: [
        {
          label: 'Default Export Format',
          description: 'Choose the default format for exporting analysis results',
          type: 'select' as const,
          value: defaultExportFormat,
          onChange: setExportFormat,
          options: [
            { value: 'json', label: 'JSON (Machine readable)' },
            { value: 'csv', label: 'CSV (Spreadsheet compatible)' },
            { value: 'pdf', label: 'PDF (Formatted report)' },
            { value: 'markdown', label: 'Markdown (Documentation)' }
          ]
        },
        {
          label: 'Include Metadata',
          description: 'Include session metadata in exported files',
          type: 'toggle' as const,
          value: includeMetadata,
          onChange: toggleIncludeMetadata
        },
        {
          label: 'Include Explanations',
          description: 'Include detailed explanations and suggestions',
          type: 'toggle' as const,
          value: includeExplanations,
          onChange: toggleIncludeExplanations
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your MetaGipsy experience
          </p>
        </div>
        
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <section.icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.settings.map((setting, settingIndex) => (
                  <motion.div
                    key={setting.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (settingIndex * 0.05) }}
                    className="flex items-center justify-between space-x-4"
                  >
                    <div className="flex-1 space-y-1">
                      <Label className="text-base font-medium">
                        {setting.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {setting.type === 'toggle' ? (
                        <Switch
                          checked={setting.value as boolean}
                          onCheckedChange={setting.onChange}
                          disabled={setting.disabled}
                        />
                      ) : (
                        <Select
                          value={setting.value as string}
                          onValueChange={setting.onChange}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {setting.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Advanced Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Advanced</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                Import Settings
              </Button>
              <Button variant="outline" className="justify-start">
                Export Settings
              </Button>
              <Button variant="outline" className="justify-start">
                Clear Cache
              </Button>
              <Button variant="outline" className="justify-start">
                Reset All Data
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">About</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>MetaGipsy OWL Chess Engine v1.0.0</p>
                <p>Built with React, TypeScript, and TailwindCSS</p>
                <p>© 2024 MetaGipsy. All rights reserved.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsPage;

