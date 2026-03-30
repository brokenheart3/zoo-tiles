// src/components/homescreen/FactCard.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';

type FactCardProps = {
  fact: string;
  themeColors: any;
  isLoading?: boolean;
  onRefresh?: () => void;
};

const FactCard: React.FC<FactCardProps> = ({ 
  fact, 
  themeColors, 
  isLoading = false,
  onRefresh 
}) => {
  // Clean up the fact text - remove any leading emoji and name if present
  const getCleanedFactText = () => {
    if (!fact) return '';
    
    // Check if the fact starts with an emoji pattern
    const emojiPattern = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+/u;
    const emojiMatch = fact.match(emojiPattern);
    
    let cleanedText = fact;
    
    if (emojiMatch) {
      // Remove the emoji
      cleanedText = fact.substring(emojiMatch[0].length).trim();
      
      // Check if there's a colon (fact name) and remove it
      const colonIndex = cleanedText.indexOf(':');
      if (colonIndex > 0 && colonIndex < 50) { // Only if colon is within first 50 chars
        cleanedText = cleanedText.substring(colonIndex + 1).trim();
      }
    }
    
    return cleanedText;
  };

  const cleanedFactText = getCleanedFactText();

  return (
    <View style={[styles.factCard, { backgroundColor: themeColors.button }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={themeColors.text} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            Fetching amazing fact...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.factRow}>
            <Text style={[styles.factText, { color: themeColors.text }]}>
              {cleanedFactText}
            </Text>
            {onRefresh && (
              <TouchableOpacity 
                style={[styles.refreshButton, { backgroundColor: themeColors.text + '20' }]}
                onPress={onRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={themeColors.text} />
                ) : (
                  <Text style={[styles.refreshText, { color: themeColors.text }]}>
                    🔄
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.factFooter}>
            <Text style={[styles.factSource, { color: themeColors.text }]}>
              📚 Daily Fact
            </Text>
            <Text style={[styles.factFrequency, { color: themeColors.text }]}>
              New fact daily!
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  factCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    flexWrap: 'wrap', // Allow wrapping if needed
  },
  factText: {
    flex: 1,
    fontSize: 16, // Slightly increased for better readability
    lineHeight: 24, // Better line spacing
    opacity: 0.95,
    textAlign: 'left',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: -4, // Align with text
  },
  refreshText: {
    fontSize: 16,
  },
  factFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 10,
  },
  factSource: {
    fontSize: 11,
    opacity: 0.7,
  },
  factFrequency: {
    fontSize: 11,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default FactCard;