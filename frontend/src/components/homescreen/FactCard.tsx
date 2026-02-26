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
  // Extract emoji from fact or use default
  const getEmoji = () => {
    const emojiMatch = fact.match(/^[^\s]*/);
    if (emojiMatch && emojiMatch[0].length <= 3) {
      return emojiMatch[0];
    }
    return '🐘'; // Default emoji
  };

  // Get fact without emoji for display
  const getFactText = () => {
    const emoji = getEmoji();
    if (fact.startsWith(emoji)) {
      return fact.substring(emoji.length).trim();
    }
    return fact;
  };

  return (
    <View style={[styles.factCard, { backgroundColor: themeColors.button }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={themeColors.text} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            Fetching amazing animal fact...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.factRow}>
            <Text style={[styles.factText, { color: themeColors.text }]}>
              {getFactText()}
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
              📚 From Zoo-Tiles Animal Database
            </Text>
            <Text style={[styles.factFrequency, { color: themeColors.text }]}>
              New fact every day!
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
    alignItems: 'center',
    marginBottom: 15,
  },
  factEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  factText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.95,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  refreshText: {
    fontSize: 16,
  },
  factFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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