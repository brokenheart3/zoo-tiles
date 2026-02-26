import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { ThemeContext, themeStyles, ThemeType } from '../context/ThemeContext';
import { useSettings, GridSize, Difficulty } from '../context/SettingsContext';
import AppFooter from '../components/common/AppFooter';

// Updated to include all 10 themes
const themes: ThemeType[] = [
  'light', 'dark', 'forest', 'ocean', 'sunset', 
  'lavender', 'mint', 'coral', 'midnight', 'golden'
];

const gridSizes: GridSize[] = ['6x6', '8x8', '10x10', '12x12'];
const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Expert'];

const AppSettingsScreen: React.FC = () => {
  const { theme, setThemeGlobal } = useContext(ThemeContext);
  const { settings, updateSettings } = useSettings();
  
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(theme);
  const [selectedGridSize, setSelectedGridSize] = useState<GridSize>(settings.gridSize);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(settings.difficulty);

  const handleSave = async () => {
    // Update theme in ThemeContext
    setThemeGlobal(selectedTheme);
    
    // Update other settings in SettingsContext
    await updateSettings({
      gridSize: selectedGridSize,
      difficulty: selectedDifficulty,
    });
    
    alert('Settings saved successfully!');
  };

  const colors = themeStyles[selectedTheme];

  // Difficulty-specific colors
  const difficultyColors = {
    Easy: { bg: '#4CAF50', text: '#ffffff' },
    Medium: { bg: '#FF9800', text: '#ffffff' },
    Hard: { bg: '#F44336', text: '#ffffff' },
    Expert: { bg: '#9C27B0', text: '#ffffff' },
  };

  // Helper function to get theme display name
  const getThemeDisplayName = (themeName: ThemeType): string => {
    const names: Record<ThemeType, string> = {
      light: 'Light',
      dark: 'Dark',
      forest: 'Forest',
      ocean: 'Ocean',
      sunset: 'Sunset',
      lavender: 'Lavender',
      mint: 'Mint',
      coral: 'Coral',
      midnight: 'Midnight',
      golden: 'Golden',
    };
    return names[themeName];
  };

  // Helper to determine best contrasting color for text/checkmarks
  const getContrastColor = (bgColor: string): string => {
    // Simple heuristic: if background is dark, use white; if light, use black
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Using luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.header, { color: colors.text }]}>App Settings</Text>
        
        {/* Grid Size Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Grid Size</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            Choose the puzzle grid size
          </Text>
          <View style={styles.buttonGroup}>
            {gridSizes.map((size) => {
              const isSelected = selectedGridSize === size;
              const bgColor = isSelected ? colors.button : `${colors.button}30`;
              const textColor = isSelected ? getContrastColor(colors.button) : colors.text;
              
              return (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    { backgroundColor: bgColor }
                  ]}
                  onPress={() => setSelectedGridSize(size)}
                >
                  {isSelected && (
                    <View style={[
                      styles.checkmark, 
                      { backgroundColor: getContrastColor(colors.button) }
                    ]}>
                      <Text style={[
                        styles.checkmarkText, 
                        { color: colors.button }
                      ]}>
                        ✓
                      </Text>
                    </View>
                  )}
                  <Text style={[
                    styles.optionButtonText,
                    { 
                      color: textColor,
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulty</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            Choose the puzzle difficulty level
          </Text>
          <View style={styles.buttonGroup}>
            {difficulties.map((difficulty) => {
              const isSelected = selectedDifficulty === difficulty;
              const diffColors = difficultyColors[difficulty];
              const bgColor = isSelected ? diffColors.bg : `${diffColors.bg}30`;
              const textColor = isSelected ? getContrastColor(diffColors.bg) : colors.text;
              
              return (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.optionButton,
                    { backgroundColor: bgColor }
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty)}
                >
                  {isSelected && (
                    <View style={[
                      styles.checkmark, 
                      { backgroundColor: getContrastColor(diffColors.bg) }
                    ]}>
                      <Text style={[
                        styles.checkmarkText, 
                        { color: diffColors.bg }
                      ]}>
                        ✓
                      </Text>
                    </View>
                  )}
                  <Text style={[
                    styles.optionButtonText,
                    { 
                      color: textColor,
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }
                  ]}>
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Theme Selection - Updated for 10 themes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            Choose your app theme from 10 options
          </Text>
          <View style={styles.themeGrid}>
            {themes.map((t) => {
              const isSelected = selectedTheme === t;
              const themeColors = themeStyles[t];
              const textColor = getContrastColor(themeColors.button);
              const borderColor = isSelected ? getContrastColor(themeColors.button) : 'transparent';
              
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.themeButton,
                    { backgroundColor: themeColors.button },
                    isSelected && styles.selectedThemeButton,
                    isSelected && { borderColor }
                  ]}
                  onPress={() => setSelectedTheme(t)}
                >
                  {isSelected && (
                    <View style={[
                      styles.themeCheckmark,
                      { 
                        backgroundColor: textColor,
                      }
                    ]}>
                      <Text style={[
                        styles.themeCheckmarkText,
                        { color: themeColors.button }
                      ]}>
                        ✓
                      </Text>
                    </View>
                  )}
                  <View style={styles.themePreview}>
                    <View style={[styles.themeColorSample, { backgroundColor: themeColors.background }]} />
                    <View style={[styles.themeColorSample, { backgroundColor: themeColors.button }]} />
                    <View style={[styles.themeColorSample, { backgroundColor: themeColors.text }]} />
                  </View>
                  <Text style={[
                    styles.themeButtonText,
                    { 
                      color: textColor,
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }
                  ]}>
                    {getThemeDisplayName(t)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.button }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: getContrastColor(colors.button) }]}>
            Save All Settings
          </Text>
        </TouchableOpacity>

        {/* Current Settings Summary */}
        <View style={[styles.summaryCard, { backgroundColor: `${colors.button}20` }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Current Settings</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Grid Size:</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedGridSize}</Text>
              <View style={[styles.smallCheckmark, { backgroundColor: colors.button }]}>
                <Text style={[styles.smallCheckmarkText, { color: getContrastColor(colors.button) }]}>
                  ✓
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Difficulty:</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedDifficulty}</Text>
              <View style={[
                styles.smallCheckmark, 
                { backgroundColor: difficultyColors[selectedDifficulty].bg }
              ]}>
                <Text style={[
                  styles.smallCheckmarkText, 
                  { color: getContrastColor(difficultyColors[selectedDifficulty].bg) }
                ]}>
                  ✓
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Theme:</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {getThemeDisplayName(selectedTheme)}
              </Text>
              <View style={[
                styles.smallCheckmark, 
                { backgroundColor: colors.button }
              ]}>
                <Text style={[styles.smallCheckmarkText, { color: getContrastColor(colors.button) }]}>
                  ✓
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Preview - Fixed for better contrast */}
        <View style={[styles.previewSection, { backgroundColor: `${colors.button}15` }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Theme Preview</Text>
          <View style={styles.previewContainer}>
            <View style={[styles.previewBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.previewText, { color: colors.text }]}>Background</Text>
            </View>
            <View style={[styles.previewBox, { backgroundColor: colors.button }]}>
              <Text style={[styles.previewText, { color: getContrastColor(colors.button) }]}>
                Button
              </Text>
            </View>
            <View style={[styles.previewBox, { backgroundColor: colors.text }]}>
              <Text style={[styles.previewText, { color: getContrastColor(colors.text) }]}>
                Text
              </Text>
            </View>
          </View>
          <Text style={[styles.previewDescription, { color: colors.text }]}>
            This is how your selected "{getThemeDisplayName(selectedTheme)}" theme will look
          </Text>
          <View style={styles.previewNote}>
            <Text style={[styles.previewNoteText, { color: colors.text, opacity: 0.7 }]}>
              ✓ All text is now readable with proper contrast
            </Text>
          </View>
        </View>

        {/* App Footer */}
        <View style={styles.footer}>
          <AppFooter 
            textColor={colors.text}
            version="1.0.0"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  optionButtonText: {
    fontSize: 16,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeButton: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  selectedThemeButton: {
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  themeCheckmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1,
  },
  themeCheckmarkText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  themePreview: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'center',
    width: '100%',
  },
  themeColorSample: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  themeButtonText: {
    fontSize: 12,
    textAlign: 'center',
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  smallCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCheckmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewSection: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  previewBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewDescription: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.9,
    marginBottom: 8,
  },
  previewNote: {
    alignItems: 'center',
    marginTop: 5,
  },
  previewNoteText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
});

export default AppSettingsScreen;