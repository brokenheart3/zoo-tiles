import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface StatTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  backgroundColor: string;
  activeBackgroundColor: string;
  textColor: string;
  activeTextColor: string;
}

const StatTabs: React.FC<StatTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  backgroundColor,
  activeBackgroundColor,
  textColor,
  activeTextColor,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              isActive && [styles.activeTab, { backgroundColor: activeBackgroundColor }]
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            {tab.icon && <Text style={styles.icon}>{tab.icon}</Text>}
            <Text style={[
              styles.tabText,
              { 
                color: isActive ? activeTextColor : textColor,
                opacity: isActive ? 1 : 0.8
              }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#F0F0F0',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StatTabs;