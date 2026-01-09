import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type EnhancedAppFooterProps = {
  version?: string;
  showCopyright?: boolean;
  additionalText?: string;
  showLogo?: boolean;
  showDivider?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  versionStyle?: TextStyle;
  copyrightStyle?: TextStyle;
  themeColors?: {
    text?: string;
    background?: string;
  };
};

const EnhancedAppFooter: React.FC<EnhancedAppFooterProps> = ({
  version = '1.0.0',
  showCopyright = true,
  additionalText,
  showLogo = true,
  showDivider = true,
  containerStyle,
  textStyle,
  versionStyle,
  copyrightStyle,
  themeColors,
}) => {
  const textColor = themeColors?.text || '#333';
  const backgroundColor = themeColors?.background || 'transparent';

  return (
    <View style={[
      styles.footer,
      { backgroundColor },
      containerStyle,
    ]}>
      {showDivider && (
        <View style={[styles.divider, { backgroundColor: textColor + '20' }]} />
      )}
      
      {showLogo && (
        <Text style={[styles.logo, { color: textColor }, textStyle]}>
          🦓 Zoo-Tiles
        </Text>
      )}
      
      <Text style={[styles.footerText, { color: textColor }, textStyle]}>
        Animal Puzzle Adventure
      </Text>
      
      {additionalText && (
        <Text style={[styles.additionalText, { color: textColor + 'CC' }]}>
          {additionalText}
        </Text>
      )}
      
      <Text style={[styles.footerVersion, { color: textColor + '99' }, versionStyle]}>
        Version {version}
      </Text>
      
      {showCopyright && (
        <Text style={[styles.copyright, { color: textColor + '77' }, copyrightStyle]}>
          © {new Date().getFullYear()} Zoo-Tiles. All rights reserved.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  divider: {
    height: 1,
    width: '80%',
    marginBottom: 20,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  additionalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
    maxWidth: '80%',
  },
  footerVersion: {
    fontSize: 12,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 11,
  },
});

export default EnhancedAppFooter;