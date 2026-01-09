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

const themes: ThemeType[] = ['light', 'dark', 'forest', 'ocean', 'sunset', 'lavender', 'mint'];
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
            {gridSizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  selectedGridSize === size 
                    ? { backgroundColor: colors.button } 
                    : { backgroundColor: `${colors.button}30` }
                ]}
                onPress={() => setSelectedGridSize(size)}
              >
                {selectedGridSize === size && (
                  <View style={[styles.checkmark, { backgroundColor: colors.text }]}>
                    <Text style={[styles.checkmarkText, { color: colors.background }]}>✓</Text>
                  </View>
                )}
                <Text style={[
                  styles.optionButtonText,
                  { 
                    color: selectedGridSize === size ? colors.text : colors.text,
                    fontWeight: selectedGridSize === size ? 'bold' : 'normal'
                  }
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
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
              
              return (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.optionButton,
                    isSelected 
                      ? { backgroundColor: diffColors.bg } 
                      : { backgroundColor: `${diffColors.bg}30` }
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty)}
                >
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: colors.text }]}>
                      <Text style={[styles.checkmarkText, { color: diffColors.bg }]}>✓</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.optionButtonText,
                    { 
                      color: isSelected ? diffColors.text : colors.text,
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

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            Choose your app theme
          </Text>
          <View style={styles.themeGrid}>
            {themes.map((t) => {
              const isSelected = selectedTheme === t;
              const themeColors = themeStyles[t];
              
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.themeButton,
                    { backgroundColor: themeColors.button },
                    isSelected && styles.selectedThemeButton
                  ]}
                  onPress={() => setSelectedTheme(t)}
                >
                  {isSelected && (
                    <View style={styles.themeCheckmark}>
                      <Text style={[styles.themeCheckmarkText, { color: themeColors.text }]}>✓</Text>
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
                      color: themeColors.text,
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }
                  ]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
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
          <Text style={[styles.saveButtonText, { color: colors.text }]}>Save All Settings</Text>
        </TouchableOpacity>

        {/* Current Settings Summary */}
        <View style={[styles.summaryCard, { backgroundColor: `${colors.button}20` }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Current Settings</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Grid Size:</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedGridSize}</Text>
              <View style={[styles.smallCheckmark, { backgroundColor: colors.button }]}>
                <Text style={[styles.smallCheckmarkText, { color: colors.text }]}>✓</Text>
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
                <Text style={[styles.smallCheckmarkText, { color: difficultyColors[selectedDifficulty].text }]}>✓</Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Theme:</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}
              </Text>
              <View style={[
                styles.smallCheckmark, 
                { backgroundColor: colors.button }
              ]}>
                <Text style={[styles.smallCheckmarkText, { color: colors.text }]}>✓</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER WITH LOGO */}
        <View style={styles.footer}>
          <View style={[styles.footerLogoContainer, { borderTopColor: colors.text }]}>
            <Text style={[styles.footerLogo, { color: colors.text }]}>🦓</Text>
            <Text style={[styles.footerLogoText, { color: colors.text }]}>Zoo-Tiles</Text>
          </View>
          <Text style={[styles.footerVersion, { color: colors.text }]}>Version 1.0.0</Text>
          <Text style={[styles.footerTagline, { color: colors.text }]}>
            Animal-themed puzzle fun for everyone!
          </Text>
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
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedThemeButton: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  themeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeCheckmarkText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  themePreview: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  themeColorSample: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  themeButtonText: {
    fontSize: 14,
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
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingTop: 20,
  },
  footerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    width: '100%',
  },
  footerLogo: {
    fontSize: 36,
    marginRight: 10,
  },
  footerLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footerVersion: {
    fontSize: 14,
    marginTop: 10,
    opacity: 0.7,
  },
  footerTagline: {
    fontSize: 16,
    marginTop: 5,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default AppSettingsScreen;
