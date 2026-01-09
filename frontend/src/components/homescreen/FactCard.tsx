import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type FactCardProps = {
  fact: string;
  themeColors: any;
};

const FactCard: React.FC<FactCardProps> = ({ fact, themeColors }) => {
  return (
    <View style={[styles.factCard, { backgroundColor: themeColors.button }]}>
      <Text style={[styles.factTitle, { color: themeColors.text }]}>
        🐘 Daily Animal Fact
      </Text>
      <Text style={[styles.factText, { color: themeColors.text }]}>
        {fact}
      </Text>
      <Text style={[styles.factFooter, { color: themeColors.text }]}>
        New fact every day!
      </Text>
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
  factTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  factText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 5,
  },
  factFooter: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default FactCard;